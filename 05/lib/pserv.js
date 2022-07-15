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

/**
 * A class that holds information specific to purchased servers.
 */
export class PurchasedServer {
    /**
     * The Netscript API.
     */
    #ns;
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
        this.#ns = ns;
        this.#valid_ram = [
            2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
            32768, 65536, 131072, 262144];
    }

    /**
     * The cost of buying a server with the given amount of RAM (GB).
     *
     * @param ram The amount of RAM (GB) to buy with this purchased server.
     *     RAM is assumed to be given as a power of 2.
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
        const player = new Player(this.#ns);
        const script_ram = this.#ns.getScriptRam(player.script(), player.home());
        let i = 0;
        while (script_ram > this.#valid_ram[i]) {
            i++;
        }
        assert((i + 1) <= this.#valid_ram.length);
        return this.#valid_ram[i + 1];
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
        const player = new Player(this.#ns);
        for (const server of player.pserv()) {
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
}
