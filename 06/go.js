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

import { assert, Player, Server } from "./libbnr.js";

/**
 * This function should be run immediately after the soft reset of installing
 * a bunch of Augmentations.  Our purpose is to gain some money and Hack
 * experience points early on when our stats are low.  We assume our home
 * server has a small amount of RAM.
 *
 * @param ns The Netscript API.
 */
function reboot_low(ns) {
    const player = new Player(ns);
    const server = new Server(ns, player.home());
    const nthread = 1;
    const script = ["hnet-farm.js", "world-server.js", "buy-server.js"];

    // If we cannot run any of these scripts on our home server, then at
    // various points in the game we need to kill one or more scripts to
    // free some RAM.
    for (const s of script) {
        if (server.can_run_script(s)) {
            ns.exec(s, player.home(), nthread);
        }
    }
}

/**
 * This function should be run immediately after the soft reset of installing
 * a bunch of Augmentations.  Our purpose is to gain some money and Hack
 * experience points early on when our stats are low.  We assume our home
 * server has at least 128GB RAM.
 *
 * @param ns The Netscript API.
 */
function reboot_high(ns) {
    const player = new Player(ns);
    const server = new Server(ns, player.home());
    const nthread = 1;
    const script = [
        "low-end.js", "world-server.js", "hnet-farm.js",
        "buy-server.js", "trade-bot.js"
    ];

    for (const s of script) {
        assert(server.can_run_script(s));
        ns.exec(s, player.home(), nthread);
    }
}

/**
 * NOTE: This script requires an upgraded home server to run successfully.
 * The reason is that it will run various other scripts, each of which requires
 * RAM.  Our home server should have at least 256GB RAM.
 *
 * Restart our source of income and Hack experience points.  This script is
 * useful whenever we have installed a bunch of Augmentations and we want to
 * automatically restart scripts to:
 *
 *     (1) Purchase Hacknet Nodes and manage our farm of Nodes.
 *     (2) Purchase servers and use each purchased server to hack a target
 *         server in the game world.
 *     (3) Gain root access to servers in the game world (excluding purchased
 *         servers) and use each server to hack itself.
 *
 * Usage: run go.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const player = new Player(ns);
    const server = new Server(ns, player.home());
    const ram = server.available_ram();
    const threshold = 128;

    if (ram < threshold) {
        reboot_low(ns);
    } else {
        reboot_high(ns);
    }
}
