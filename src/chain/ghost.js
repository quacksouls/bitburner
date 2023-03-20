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

import { exec } from "/quack/lib/util.js";

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
}

/**
 * Manage the gameplay in "BitNode-8: Ghost of Wall Street".
 *
 * Usage: run quack/chain/ghost.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);

    // Farm Hack XP.
    exec(ns, "/quack/hgw/xp.js");
    // Create port opener programs.
    exec(ns, "/quack/singularity/popen.js");
    // Launch trade bot, pre-4S.
    exec(ns, "/quack/stock/pre4s.js");
    // Join factions and purchase Augmentations.  Only do so after we have all
    // port opener programs.
}
