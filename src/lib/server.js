/**
 * Copyright (C) 2022--2023 Duck McSouls
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

import { bool } from "/quack/lib/constant/bool.js";
import { script } from "/quack/lib/constant/script.js";
import { home, home_t } from "/quack/lib/constant/server.js";
import { assert } from "/quack/lib/util.js";

/**
 * A server class that holds information about a server, whether it be a
 * purchased server or a server found on the network in the game world.
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
     * The player's main hacking script.  Usually the early hacking template.
     */
    #script;

    /**
     * The minimum security level to which this server can be weakened.
     */
    #security_min;

    /**
     * The script for sharing the RAM of a server with a faction.
     */
    #share_script;

    /**
     * Create a server object with the given hostname.
     *
     * @param {NS} ns The Netscript API.
     * @param {string} hostname The hostname of a server.  The server must exist
     *     in the game world and can be either a purchased server or a server
     *     found on the network in the game world.
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
        this.#script = script.HACK;
        this.#security_min = server.minDifficulty;
        this.#share_script = script.SHARE;

        // By default, we do not reserve any RAM.  However, if this is the
        // player's home server, then reserve some RAM.
        this.#ram_reserve = 0;
        if (this.is_home()) {
            // Reserve an amount of RAM, depending on the maximum RAM on the
            // home server.
            this.#ram_reserve = this.#reserve_ram();
        }
    }

    /**
     * How much RAM (in GB) is available on this server.
     *
     * @returns {number} The amount of RAM available on this server.
     */
    available_ram() {
        return this.ram_max() - this.#ns.getServerUsedRam(this.hostname());
    }

    /**
     * Whether the server has enough RAM to run a given script, using at
     * least one thread.  We ignore any amount of RAM that has been reserved,
     * using all available RAM to help us make a decision.
     *
     * @param {string} s We want to run this script on this server.
     * @returns {boolean} True if the given script can be run on this server;
     *     false otherwise.
     */
    can_run_script(s) {
        const script_ram = this.#ns.getScriptRam(s, this.#home);
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
     *
     * @returns {number} How many CPU Cores this server has.
     */
    cores() {
        return this.#ns.getServer(this.hostname()).cpuCores;
    }

    /**
     * Copy our hack script over to this server.  Run the hack script on this
     * server and use the server to hack the given target.
     *
     * @param {string} target We run our hack script against this target server.
     * @returns {boolean} True if our hack script is running on the server using
     *     at least one thread; false otherwise.  The method can return false
     *     if, for example, there is no free RAM on the server or we do not have
     *     root access on either servers.
     */
    deploy(target) {
        assert(target.length > 0);
        const targ = this.#ns.getServer(target);
        if (
            !this.has_root_access()
            || !targ.hasAdminRights
            || !this.#ns.fileExists(this.#script, this.#home)
        ) {
            return bool.FAILURE;
        }

        // No free RAM on server to run our hack script.
        const nthread = this.num_threads(this.#script);
        if (nthread < 1) {
            return bool.FAILURE;
        }

        // Copy our script over to this server.  Use the server to hack the
        // target.
        this.#ns.scp(this.#script, this.hostname(), this.#home);
        const option = { preventDuplicates: true, threads: nthread };
        this.#ns.exec(this.#script, this.hostname(), option, targ.hostname);
        return bool.SUCCESS;
    }

    /**
     * Try to gain root access on this server.
     *
     * @returns {boolean} True if the player has root access to this server;
     *     false if root access cannot be obtained.
     */
    gain_root_access() {
        // Do we already have root access to this server?
        if (this.has_root_access()) {
            return true;
        }

        // Try to open all required ports and nuke the server.
        try {
            this.#ns.brutessh(this.hostname());
        } catch {}
        try {
            this.#ns.ftpcrack(this.hostname());
        } catch {}
        try {
            this.#ns.httpworm(this.hostname());
        } catch {}
        try {
            this.#ns.relaysmtp(this.hostname());
        } catch {}
        try {
            this.#ns.sqlinject(this.hostname());
        } catch {}
        try {
            this.#ns.nuke(this.hostname());
            return true;
        } catch {
            assert(!this.has_root_access());
            return false;
        }
    }

    /**
     * Increase the amount of money available on this server.
     */
    async grow() {
        await this.#ns.grow(this.hostname());
    }

    /**
     * Steal money from this server.
     */
    async hack() {
        await this.#ns.hack(this.hostname());
    }

    /**
     * The amount of Hack stat required to hack this server.
     *
     * @returns {number} The hacking requirement of this server.
     */
    hacking_skill() {
        return this.#hacking_skill;
    }

    /**
     * Whether we have root access to this server.
     *
     * @returns {boolean} True if we have root access to this server;
     *     false otherwise.
     */
    has_root_access() {
        return this.#ns.hasRootAccess(this.hostname());
    }

    /**
     * The hostname of this server.
     *
     * @returns {string} This server's hostname.
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
     * @returns {boolean} True if the server is bankrupt; false otherwise.
     */
    is_bankrupt() {
        return Math.floor(this.money_max()) === 0;
    }

    /**
     * Whether this is our home server.
     *
     * @returns {boolean} True if this is our home server; false otherwise.
     */
    is_home() {
        return this.hostname() === this.#home;
    }

    /**
     * Whether we have purchased this server.
     *
     * @returns {boolean} True if this is a purchased server; false otherwise.
     */
    is_pserv() {
        return this.#ns.getServer(this.hostname()).purchasedByPlayer;
    }

    /**
     * Whether this server is currently running a script.
     *
     * @param {string} s Check to see if this script is currently running on the
     *     server.
     * @returns {boolean} True if the given script is running on the server;
     *     false otherwise.
     */
    is_running_script(s) {
        return this.#ns.scriptRunning(s, this.hostname());
    }

    /**
     * The amount of money currently available on the server.
     *
     * @returns {number} How much money the server has.
     */
    money_available() {
        return this.#ns.getServerMoneyAvailable(this.hostname());
    }

    /**
     * The maximum amount of money this server can hold.
     *
     * @returns {number} The largest amount of money this server can hold.
     */
    money_max() {
        return this.#money_max;
    }

    /**
     * The number of ports that must be opened in order to hack this server.
     *
     * @returns {number} How many ports must be opened on this server.
     */
    num_ports_required() {
        return this.#n_ports_required;
    }

    /**
     * Determine how many threads we can run a given script on this server.
     * This method takes care not to use all available RAM on the player's
     * home server.  If this is the player's home server, the method reserves
     * some amount of RAM on the home server and use the remaining available
     * RAM to calculate the number of threads to devote to the given script.
     *
     * @param {string} s We want to run this script on the server.  The script
     *     must exist on our home server.
     * @returns {number} The number of threads that can be used to run the given
     *     script on this server.  Return 0 if we cannot run the script using at
     *     least one thread.
     */
    num_threads(s) {
        const script_ram = this.#ns.getScriptRam(s, this.#home);
        const server_ram = this.available_ram() - this.#ram_reserve;
        if (server_ram < 1) {
            return 0;
        }
        const nthread = Math.floor(server_ram / script_ram);
        return nthread;
    }

    /**
     * The maximum amount of RAM (GB) of this server.
     *
     * @returns {number} The largest amount of RAM on this server.
     */
    ram_max() {
        return this.#ns.getServer(this.hostname()).maxRam;
    }

    /**
     * Reserve some RAM on the home server.  Use this method when we know we
     * have level 3 of "Source-File 4: The Singularity".  Even if we are in
     * BN4.1 or BN4.2, the game allows us to use Singularity functions at their
     * lowest RAM costs as if we have level 3 of the Source-File.
     *
     * @returns {number} The amount of RAM to reserve.
     */
    #reserve_ram() {
        // if (this.ram_max() >= home_t.RAM_HUGE) {
        //     return home_t.reserve.HIGH;
        // }
        if (this.ram_max() >= home_t.RAM_HIGH) {
            return home_t.reserve.HIGH / 2;
        }
        if (this.ram_max() >= home_t.RAM_HIGH / 2) {
            return home_t.reserve.MID;
        }
        if (this.ram_max() < home_t.reserve.DEFAULT) {
            return 0;
        }
    }

    /**
     * The current security level of this server.
     *
     * @returns {number} The server's current security level.
     */
    security_level() {
        return this.#ns.getServerSecurityLevel(this.hostname());
    }

    /**
     * The minimum security level to which this server can be weakened.
     *
     * @returns {number} The lowest possible security level of this server.
     */
    security_min() {
        return this.#security_min;
    }

    /**
     * Copy our share script over to this server and run the script.
     *
     * @returns {boolean} True if our share script is running on the server
     *     using at least one thread; false otherwise.
     */
    share() {
        if (
            !this.has_root_access()
            || !this.#ns.fileExists(this.#share_script, this.#home)
        ) {
            return bool.FAILURE;
        }

        // No free RAM on server to run our share script.
        const nthread = this.num_threads(this.#share_script);
        if (nthread < 1) {
            return bool.FAILURE;
        }

        // Copy our share script over to this server and share its RAM with a
        // faction.
        this.#ns.scp(this.#share_script, this.hostname(), this.#home);
        const option = { preventDuplicates: true, threads: nthread };
        this.#ns.exec(this.#share_script, this.hostname(), option);
        return bool.SUCCESS;
    }

    /**
     * The number of threads to use for each instance of a script.  We want to
     * run various instances of a script, each instance uses a certain number
     * of threads.  Given the number of instances to run, we want to know how
     * many threads each instance can use.
     *
     * @param {string} s The script to run on this server.
     * @param {number} n We want to run this many instances of the given script.
     *     Must be a positive integer.
     * @returns {number} The number of threads for each instance of the script.
     *     Return 0 if we cannot run any scripts on this server.
     */
    threads_per_instance(s, n) {
        const ninstance = Math.floor(n);
        assert(ninstance > 0);
        return Math.floor(this.num_threads(s) / ninstance);
    }

    /**
     * Weaken the security of this server.
     */
    async weaken() {
        await this.#ns.weaken(this.hostname());
    }
}
