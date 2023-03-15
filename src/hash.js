/**
 * Copyright (C) 2023 Duck McSouls
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

import { hnet_t } from "/quack/lib/constant/hacknet.js";
import { colour } from "/quack/lib/constant/misc.js";
import { home } from "/quack/lib/constant/server.js";
import { has_hacknet_server_api } from "/quack/lib/source.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";

/**
 * Whether we have the prerequisites for continuing with this script.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we have the prerequisites; false otherwise.
 */
function has_prerequisite(ns) {
    return has_hacknet_server_api(ns) && ns.hacknet.numNodes() > 0;
}

/**
 * Whether it is time to spend all hashes at once.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if it is time to spend all hashes; false otherwise.
 */
function is_liquidate(ns) {
    return ns.fileExists(hnet_t.LIQUIDATE, home);
}

/**
 * Spend all hashes.
 *
 * @param {NS} ns The Netscript API.
 */
async function liquidate(ns) {
    while (ns.hacknet.spendHashes(hnet_t.hash.SELL)) {
        await ns.sleep(wait_t.MILLISECOND);
    }
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("sleep");
}

/**
 * Attempt to spend the generated hashes.
 *
 * @param {NS} ns The Netscript API.
 */
function spend_hash(ns) {
    ns.hacknet.spendHashes(hnet_t.hash.CCT);
}

/**
 * Level 3 of "Source-File 9: Hacktocracy" grants us an upgraded Hacknet server
 * whenever we enter a BitNode.  The Hacknet server will disappear after a soft
 * reset.  Spend the hashes before the Hacknet server is gone.
 *
 * Usage: run quack/hash.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    if (!has_prerequisite(ns)) {
        log(ns, "No Hacknet servers found", colour.RED);
        return;
    }

    // Spend the hashes whenever we can.
    for (;;) {
        if (is_liquidate(ns)) {
            await liquidate(ns);
        }
        spend_hash(ns);
        await ns.sleep(wait_t.DEFAULT);
    }
}
