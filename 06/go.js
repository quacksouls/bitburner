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

import { Player } from "./libbnr.js";

/**
 * This function should be run immediately after the soft reset of installing
 * a bunch of Augmentations.  Our purpose is to gain some money and Hack
 * experience points early on when our stats are low.
 *
 * @param ns The Netscript API.
 * @return An array of low-end servers.  Each of these servers are being hacked
 *     by our hacking script, running from our home server.
 */
function reboot(ns) {
    const player = new Player(ns);
    const nthread = 1;

    // First, use our home server to hack world servers that satisfy these
    // criteria:
    //
    // (1) Require a hacking skill of 1 because our Hack stat is 1 after a soft
    //     reset.
    // (2) Does not require any ports to be opened in order for us to run
    //     NUKE.exe on the server.  The script should be able to figure out
    //     whether or not we can open all ports on a world server.
    ns.exec("low-end.js", player.home(), nthread);

    // Use servers in the game world to hack themselves.
    ns.exec("world-server.js", player.home(), nthread);

    // Setup a farm of Hacknet Nodes.
    ns.exec("hnet-farm.js", player.home(), nthread);

    // Purchase servers and use each purchased server to hack a target server.
    ns.exec("buy-server.js", player.home(), nthread);

    // Start our trade bot.
    ns.exec("trade-bot.js", player.home(), nthread);
}

/**
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
 * @param ns The Netscript API.
 */
export async function main(ns) {
    reboot(ns);
}
