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

// Miscellaneous helper functions related to network.

import { shortest_path } from "/lib/network.js";
import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Connect to a given server.  The target server can be multiple hops away.
 *
 * @param ns The Netscript API.
 * @param source The source node.  We are currently on this server.
 * @param target We want to connect to this server.  Not necessarily a
 *     neighbour node.
 */
export function connect_to(ns, source, target) {
    const path = shortest_path(ns, source, target);
    assert(path.length > 0);
    assert(source == path[0]);
    path.shift();
    while (path.length > 0) {
        const node = path.shift();
        assert(ns.singularity.connect(node));
    }
}

/**
 * Install a backdoor on a world server.
 *
 * @param ns The Netscript API.
 * @param hostname We want to install a backdoor on the server having this
 *     hostname.  Assume that we have root access to the target server.
 */
export async function install_backdoor(ns, hostname) {
    // Sanity checks.
    const player = new Player(ns);
    const server = new Server(ns, hostname);
    assert(player.hacking_skill() >= server.hacking_skill());
    assert(server.has_root_access());
    // Install a backdoor on the target server.
    connect_to(ns, player.home(), server.hostname());
    await ns.singularity.installBackdoor();
    connect_to(ns, server.hostname(), player.home());
}

/**
 * Travel to a city.
 *
 * @param ns The Netscript API.
 * @param city We want to travel to this city.
 */
export async function visit_city(ns, city) {
    const player = new Player(ns);
    if (player.city() == city) {
        return;
    }
    ns.singularity.goToLocation("Travel Agency");  // Raise Intelligence XP.
    const t = new Time();
    const time = 5 * t.second();
    let success = ns.singularity.travelToCity(city);
    while (!success) {
        await ns.sleep(time);
        success = ns.singularity.travelToCity(city);
    }
}
