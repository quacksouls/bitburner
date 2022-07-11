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
import { assert } from "/lib/util.js";

/**
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
 * Usage: run go.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Run some or all utility scripts, depending on the amount of RAM on our
    // home server.
    const mid_ram = 256;
    const high_ram = 2048;
    const server = ns.getServer(home);
    const nthread = 1;
    let script = "";
    if (server.maxRam >= high_ram) {
        script = "go-high.js";
    } else if (server.maxRam >= mid_ram) {
        script = "go-mid.js";
    } else {
        assert(server.maxRam < mid_ram);
        script = "go-low.js";
    }
    ns.exec(script, home, nthread);
}
