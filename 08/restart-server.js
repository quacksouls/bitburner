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

import { network } from "/lib/network.js";
import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import {
    assert, choose_best_server, choose_targets, filter_bankrupt_servers
} from "/lib/util.js";

/**
 * Restart all scripts on a purchased server.  This is useful in the case where
 * all scripts running on a purchased server have been killed.  We start running
 * those scripts again.  This script chooses the "best" servers to hack.
 *
 * Usage: run restart-server.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Cycle through our purchased servers to see whether to restart our
    // hack script.
    const player = new Player(ns);
    let target = new Array();
    for (const s of player.pserv()) {
        // Determine the target servers to hack.  There are always at least 2
        // targets because at least 2 servers in the game world require only
        // 1 Hack stat and zero opened ports.
        // Assume that each target is not bankrupt.
        if (target.length < 1) {
            target = filter_bankrupt_servers(
                ns, choose_targets(ns, network(ns))
            );
            assert(target.length > 0);
        }
        const server = new Server(ns, s);
        if (!server.is_running_script(player.script())) {
            // Choose the best target server that is not bankrupt.  Run our
            // hack script against this target server.
            const t = choose_best_server(ns, target);
            target = target.filter(s => s != t);
            const target_server = new Server(ns, t);
            assert(await target_server.gain_root_access());
            assert(await server.deploy(target_server.hostname()));
        }
    }
}
