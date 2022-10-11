/**
 * Copyright (C) 2022 Duck McSouls
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { bool } from "/lib/constant/bool.js";
import { script } from "/lib/constant/misc.js";
import { home } from "/lib/constant/server.js";
import { assert } from "/lib/util.js";

/**
 * A server class that holds all information about a server, whether it be
 * a purchased server or a server found on the network in the game world.
 */
export class Server {
    /**
     * The amount of Hack stat required to hack this server.
     */
    #hacking_skill;
    /**
     * The player's home server.
     */
    #home;
    /**
     * The hostname of this server.
     */
    #hostname;
    /**
     * The maximum amount of money this server can hold.
     */
    #money_max;
    /**
     * How many ports must be opened on this server in order to run
     * NUKE.exe on it.
     */
    #n_ports_required;
    /**
     * The Netscript API.
     */
    #ns;
    /**
     * Reserve this amount of RAM.  We want the server to always have at least
     * this amount of RAM available.  The reserve RAM is important especially
     * if this is the player's home server.  We want to have a minimum amount
     * of RAM on the home server for various purposes.
     */
    #ram_reserve;
    /**
     * The player's main hacking script.
     */
    #script;
    /**
     * The minimum security level to which this server can be weaked.
     */
    #security_min;

    /**
     * Create a server object with the given hostname.
     *
     * @param ns The Netscript API.
     * @param hostname The hostname of a server.  The server must exist in the
     *     game world and can be either a purchased server or a server found on
     *     the network in the game world.
     */
    constructor(ns, hostname) {
        assert(hostname.length > 0);
        const server = ns.getServer(hostname);
        this.#hacking_skill = server.requiredHackingSkill;
        this.#home = home;
        this.#hostname = server.hostname;
        this.#money_max = server.moneyMax;
        this.#n_ports_required = server.numOpenPortsRequired;
        this.#ns = ns;
        this.#script = script;
        this.#security_min = server.minDifficulty;
        // By default, we do not reserve any RAM.  However, if this is the
        // player's home server, then reserve some RAM.
        this.#ram_reserve = 0;
        if (this.hostname() == this.#home) {
            // By default, we reserve 50GB RAM on the player's home server.  If
            // the home server has less than this amount of RAM, we do not
            // reserve any RAM at all.
            const default_ram = 50;
            this.#ram_reserve = default_ram;
            // Reserve a higher amount of RAM, depending on the maximum RAM on
            // the home server.
            if (this.ram_max() >= 1024) {
                this.#ram_reserve = 512;
            } else if (this.ram_max() >= 512) {
                this.#ram_reserve = 256;
            } else if (this.ram_max() >= 256) {
                this.#ram_reserve = 128;
            } else if (this.ram_max() < default_ram) {
                this.#ram_reserve = 0;
            }
        }
    }

    /**
     * How much RAM (in GB) is available on this server.
     */
    available_ram() {
        const ram = this.ram_max() - this.#ns.getServerUsedRam(this.hostname());
        return ram;
    }

    /**
     * Whether the server has enough RAM to run a given script, using at
     * least one thread.  We ignore any amount of RAM that has been reserved,
     * using all available RAM to help us make a decision.
     *
     * @param script We want to run this script on this server.
     * @return true if the given script can be run on this server;
     *     false otherwise.
     */
    can_run_script(script) {
        const script_ram = this.#ns.getScriptRam(script, this.#home);
        const server_ram = this.available_ram();
        if (server_ram < 1) {
            return bool.NOT_RUN;
        }
        const nthread = Math.floor(server_ram / script_ram);
        if (nthread < 1) {
            return bool.NOT_RUN;
        }
        return bool.CAN_RUN;
    }

    /**
     * The number of CPU Cores on this server.
     */
    cores() {
        const serv = this.#ns.getServer(this.hostname());
        return serv.cpuCores;
    }

    /**
     * Copy our hack script over to this server.  Run the hack script on this
     * server.
     *
     * @param target We run our hack script against this target server.
     * @return true if our hack script is running on the server using at least
     *     one thread; false otherwise, e.g. no free RAM on the server or we
     *     do not have root access on either servers.
     */
    async deploy(target) {
        assert(target.length > 0);
        const targ = this.#ns.getServer(target);
        // No root access on either servers.
        if (!this.has_root_access()) {
            this.#ns.tprint("No root access on " + this.hostname());
            return bool.FAILURE;
        }
        if (!targ.hasAdminRights) {
            this.#ns.tprint("No root access on " + targ.hostname);
            return bool.FAILURE;
        }
        // Hack script not found on our home server.
        if (!this.#ns.fileExists(this.#script, this.#home)) {
            this.#ns.tprint("Hack script not found on server " + this.#home);
            return bool.FAILURE;
        }
        // No free RAM on server to run our hack script.
        const nthread = this.num_threads(this.#script);
        if (nthread < 1) {
            this.#ns.tprint("No free RAM on server " + this.hostname());
            return bool.FAILURE;
        }
        // Copy our script over to this server.  Use the server to hack the
        // target.
        await this.#ns.scp(this.#script, this.hostname(), this.#home);
        this.#ns.exec(this.#script, this.hostname(), nthread, targ.hostname);
        return bool.SUCCESS;
    }

    /**
     * Try to gain root access on this server.
     *
     * @return true if the player has root access to this server;
     *     false if root access cannot be obtained.
     */
    async gain_root_access() {
        // Do we already have root access to this server?
        if (this.has_root_access()) {
            return true;
        }
        // Try to open all required ports and nuke the server.
        try {
            await this.#ns.brutessh(this.hostname());
        } catch {}
        try {
            await this.#ns.ftpcrack(this.hostname());
        } catch {}
        try {
            await this.#ns.httpworm(this.hostname());
        } catch {}
        try {
            await this.#ns.relaysmtp(this.hostname());
        } catch {}
        try {
            await this.#ns.sqlinject(this.hostname());
        } catch {}
        try {
            await this.#ns.nuke(this.hostname());
            return true;
        } catch {
            assert(!this.has_root_access());
            return false;
        }
    }

    /**
     * Increase the amount of money available on this server.
     *
     */
    async grow() {
        await this.#ns.grow(this.hostname());
    }

    /**
     * Steal money from this server.
     *
     */
    async hack() {
        await this.#ns.hack(this.hostname());
    }

    /**
     * The amount of Hack stat required to hack this server.
     */
    hacking_skill() {
        return this.#hacking_skill;
    }

    /**
     * Whether we have root access to this server.
     *
     * @return true if we have root access to this server; false otherwise.
     */
    has_root_access() {
        return this.#ns.hasRootAccess(this.hostname());
    }

    /**
     * The hostname of this server.
     */
    hostname() {
        return this.#hostname;
    }

    /**
     * Determine whether the server is bankrupt, i.e. it can't hold any money.
     * This is not the same as there being zero money currently on the server.
     * The server can have zero money currently available, but we can grow the
     * server.  The server is bankrupt if the maximum amount of money it
     * can hold is zero.
     *
     * @return true if the server is bankrupt; false otherwise.
     */
    is_bankrupt() {
        const max_money = Math.floor(this.money_max());
        return 0 == max_money;
    }

    /**
     * Whether this server is currently running a script.
     *
     * @param script Check to see if this script is currently running on the
     *     server.
     * @return true if the given script is running on the server;
     *     false otherwise.
     */
    is_running_script(script) {
        return this.#ns.scriptRunning(script, this.hostname());
    }

    /**
     * The amount of money currently available on the server.
     *
     */
    money_available() {
        return this.#ns.getServerMoneyAvailable(this.hostname());
    }

    /**
     * The maximum amount of money this server can hold.
     */
    money_max() {
        return this.#money_max;
    }

    /**
     * The number of ports that must be opened in order to hack this server.
     */
    num_ports_required() {
        return this.#n_ports_required;
    }

    /**
     * Determine how many threads we can run a given script on this server.
     * This function takes care not to use all available RAM on the player's
     * home server.  If this is the player's home server, the function reserves
     * some amount of RAM on the home server and use the remaining available
     * RAM to calculate the number of threads to devote to the given script.
     *
     * @param script We want to run this script on the server.  The script must
     *     exist on our home server.
     * @return The number of threads that can be used to run the given script
     *     on this server.  Return 0 if the amount of RAM to reserve is higher
     *     than the available RAM.
     */
    num_threads(script) {
        const script_ram = this.#ns.getScriptRam(script, this.#home);
        const server_ram = this.available_ram() - this.#ram_reserve;
        if (server_ram < 1) {
            return 0;
        }
        const nthread = Math.floor(server_ram / script_ram);
        return nthread;
    }

    /**
     * The maximum amount of RAM (GB) of this server.
     */
    ram_max() {
        const serv = this.#ns.getServer(this.hostname());
        return serv.maxRam;
    }

    /**
     * The current security level of this server.
     *
     * @param ns The Netscript API.
     */
    security_level() {
        return this.#ns.getServerSecurityLevel(this.hostname());
    }

    /**
     * The minimum security level to which this server can be weakened.
     */
    security_min() {
        return this.#security_min;
    }

    /**
     * The number of threads to use for each instance of a script.  We want to
     * run various instances of a script, each instance uses a certain number
     * of threads.  Given the number of instances to run, we want to know how
     * many threads each instance can use.
     *
     * @param script The script to run on this server.
     * @param n We want to run this many instances of the given script.
     *     Must be a positive whole number.
     * @return The number of threads for each instance of the script.
     *     Return 0 if we cannot run any scripts on this server.
     */
    threads_per_instance(script, n) {
        // Sanity check.
        const ninstance = Math.floor(n);
        assert(ninstance > 0);
        const nthread = this.num_threads(script);
        const nthread_per_instance = Math.floor(nthread / ninstance);
        return nthread_per_instance;
    }

    /**
     * Weaken the security of this server.
     *
     */
    async weaken() {
        await this.#ns.weaken(this.hostname());
    }
}
