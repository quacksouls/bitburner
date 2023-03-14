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
import { script } from "/quack/lib/constant/misc.js";
import { pserv } from "/quack/lib/constant/pserv.js";
import { home } from "/quack/lib/constant/server.js";
import { money } from "/quack/lib/money.js";
import { assert } from "/quack/lib/util.js";

/**
 * A class that holds information specific to purchased servers.
 */
export class PurchasedServer {
    /**
     * The player's home server.
     */
    #home;

    /**
     * The Netscript API.
     */
    #ns;

    /**
     * The player's main hacking script.
     */
    #script;

    /**
     * Possible amount of RAM (GB) for a purchased server.
     */
    #valid_ram;

    /**
     * Create an object to represent a purchased server.
     *
     * @param ns The Netscript API.
     */
    constructor(ns) {
        this.#home = home;
        this.#ns = ns;
        this.#script = script;
        this.#valid_ram = Array.from(pserv.RAM);
    }

    /**
     * Whether we can upgrade the RAM of a purchased server.
     *
     * @param {string} host Hostname of the purchased server to upgrade.
     * @param {number} ram Upgrade the server to this amount of RAM.
     * @returns {boolean} True if we can upgrade the purchased server to the
     *     given amount of RAM; false otherwise.
     */
    can_upgrade(host, ram) {
        assert(this.has_server(host));
        return money(this.#ns) > this.cost(ram);
    }

    /**
     * The cost of buying a server with the given amount of RAM (GB).
     *
     * @param {number} ram The amount of RAM (GB) to buy with this purchased
     *     server.  RAM is assumed to be given as a power of 2.
     * @returns {number} The cost for a purchased server having the given RAM.
     */
    cost(ram) {
        assert(this.is_valid_ram(ram));
        return this.#ns.getPurchasedServerCost(ram);
    }

    /**
     * Choose the default amount of RAM (in GB) for a new purchased server.
     * The chosen amount of RAM should allow the purchased server to run our
     * hacking script using at least 2 threads.
     */
    default_ram() {
        const script_ram = this.#ns.getScriptRam(this.#script, this.#home);
        let i = 0;
        while (script_ram > this.#valid_ram[i]) {
            i++;
        }
        assert(i + 1 <= this.#valid_ram.length);
        return this.#valid_ram[i + 1];
    }

    /**
     * All servers in our farm of purchased servers.
     *
     * @returns {array<string>} Array of hostnames of our purchased servers.
     */
    farm() {
        return this.#ns.getPurchasedServers();
    }

    /**
     * Whether we have the maximum number of purchased servers.
     *
     * @returns {boolean} True if we have the maximum number of purchased
     *     servers; false otherwise.
     */
    has_max() {
        return this.farm().length === this.limit();
    }

    /**
     * Whether we have a given purchased server.
     *
     * @param {string} host Hostname of a purchased server.
     * @returns {boolean} True if we have the given purchased server;
     *     false otherwise.
     */
    has_server(host) {
        assert(host !== "" && host !== home);
        return this.farm().includes(host);
    }

    /**
     * Whether the given amount of RAM (GB) is valid for a purchased server.
     *
     * @param ram The amount of RAM in GB.  Must be a power of 2.  Lowest is
     *     2GB.  Will round down to the nearest whole number.
     * @return true if the given amount of RAM is valid for a purchased server;
     *     false otherwise.
     */
    is_valid_ram(ram) {
        const n = Math.floor(ram);
        return this.#valid_ram.includes(n);
    }

    /**
     * Delete all purchased servers.  This would also kill all scripts running
     * on each purchased server.
     */
    kill_all() {
        for (const server of this.farm()) {
            // Kill all scripts running on a purchased server.
            this.#ns.killall(server);
            // Delete the purchased server.
            this.#ns.deleteServer(server);
        }
    }

    /**
     * The maximum number of purchased servers that can be bought.
     */
    limit() {
        return this.#ns.getPurchasedServerLimit();
    }

    /**
     * The maximum amount of RAM of a purchased server.
     *
     * @param {string} host Query this purchased server.
     * @returns {number} The maximum amount of RAM of the given server.
     */
    max_ram(host) {
        assert(this.has_server(host));
        return this.#ns.getServerMaxRam(host);
    }

    /**
     * Purchase a new server with the given hostname and amount of RAM (GB).
     *
     * @param hostname The hostname of the new purchased server.  If a player
     *     already has a purchased server with the given hostname, append a
     *     numeric value to the hostname.
     * @param ram The amount of RAM (GB) of the purchased server.
     * @return The hostname of the newly purchased server.
     */
    purchase(hostname, ram) {
        return this.#ns.purchaseServer(hostname, ram);
    }

    /**
     * Upgrade the RAM of a purchased server.
     *
     * @param {string} host We want to upgrade this purchased server.
     * @param {number} ram Upgrade the purchased server to this amount of RAM.
     * @returns {boolean} True if the upgrade is successful; false otherwise.
     */
    upgrade(host, ram) {
        if (!this.can_upgrade(host, ram) || this.max_ram(host) >= ram) {
            return bool.FAILURE;
        }
        return this.#ns.upgradePurchasedServer(host, ram);
    }

    /**
     * The possible amount of RAM a purchased server can have.  According to
     * this page
     *
     * https://github.com/danielyxie/bitburner/blob/dev/markdown/bitburner.ns.getpurchasedservercost.md
     *
     * the highest amount of RAM for a purchased server is 1048576.
     */
    valid_ram() {
        return this.#valid_ram;
    }
}
