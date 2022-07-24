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

import { home } from "/lib/constant.js";

/**
 * This function should be run immediately after the soft reset of installing a
 * bunch of Augmentations.  Our purpose is to gain some money and Hack
 * experience points early on when our stats are low.  We assume our home
 * server has a small amount of RAM, possibly at least 256GB RAM.
 *
 * @param ns The Netscript API.
 */
function reboot(ns) {
    const nthread = 1;
    const script = [
        "hnet-farm.js", "world-server.js", "buy-server.js", "/cct/solver.js"
    ];
    for (const s of script) {
        ns.exec(s, home, nthread);
    }
}

/**
 * NOTE: Assume our home server has at least 128GB RAM.
 *
 * Restart our source of income and Hack experience points.  This script is
 * useful whenever we have installed a bunch of Augmentations and we want to
 * automatically restart scripts to:
 *
 * (1) Purchase Hacknet nodes and manage our farm of nodes.
 * (2) Buy servers and use each purchased server to hack a target server in the
 *     game world.
 * (3) Gain root access to servers in the game world (excluding purchased
 *     servers) and use each server to hack itself.
 *
 * Usage: run go-mid.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    reboot(ns);
}
