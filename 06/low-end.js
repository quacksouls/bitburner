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

import {
    assert, filter_pserv, minutes_to_milliseconds, network, Player, Server
} from "./libbnr.js";

/**
 * Whether there are new low-end servers we can now hack.
 *
 * @param current_ln An array of low-end servers that we are now hacking.
 * @param new_ln An array of low-end servers, possibly including new
 *     low-end servers that we can now hack.
 * @return true if we can now hack more low-end servers; false otherwise.
 */
function has_new_low_end(current_ln, new_ln) {
    assert(current_ln.length >= 0);
    assert(new_ln.length > 0);
    assert(current_ln.length <= new_ln.length);
    const NEW = true;     // Have new low-end servers to hack.
    const NO_NEW = !NEW;  // No new low-end servers to hack.
    // We have new low-end servers.
    if (current_ln.length < new_ln.length) {
        return NEW;
    }

    // If the two arrays are of equal length, ensure that both
    // have the same low-end servers.
    assert(current_ln.length == new_ln.length);
    const new_set = new Set(new_ln);
    for (const s of current_ln) {
        assert(new_set.has(s));
    }
    return NO_NEW;
}

/**
 * Choose servers in the game world that are low-end.  A server is low-end if
 * it does not have enough RAM to run our hack script even using one thread.
 *
 * A bankrupt server can be low-end if it lacks the required amount of RAM to
 * run our hack script using one thread.  Although we would not obtain any money
 * from hacking a low-end bankrupt server, we would still obtain some hacking
 * points.
 *
 * @param ns The Netscript API.
 * @return An array of low-end servers.
 */
function low_end_servers(ns) {
    const server = filter_pserv(ns, network(ns));
    const player = new Player(ns);
    let lowend = new Array();
    for (const s of server) {
        if (skip_server(ns, s)) {
            continue;
        }
        const serv = new Server(ns, s);
        const nthread = serv.num_threads(player.script());
        if (nthread < 1) {
            lowend.push(s);
        }
    }
    return lowend;
}

/**
 * Whether to skip a server.  A server is skipped if it is not a low-end server.
 * We exclude these servers:
 *
 *     * Purchased servers.
 *     * A world server whose hacking skill requirement is higher than
 *       our Hack stat.
 *     * A world server for which we cannot open all ports.
 *     * A world server that is currently running our hacking script.
 *
 * @param ns The Netscript API.
 * @param server Do we skip this server?
 * @return true if the given server should be skipped; false otherwise.
 */
function skip_server(ns, server) {
    const SKIP = true;
    const NO_SKIP = !SKIP;
    const player = new Player(ns);
    const serv = new Server(ns, server);

    // Skip a server if its hacking skill requirement is higher
    // than our Hack stat.
    if (player.hacking_skill() < serv.hacking_skill()) {
        return SKIP;
    }
    // Skip a server if it is running our hack script.
    if (serv.is_running_script(player.script())) {
        return SKIP;
    }
    // Skip a server if we cannot open all of its ports.
    if (player.num_ports() < serv.num_ports_required()) {
        return SKIP;
    }
    return NO_SKIP;
}

/**
 * Use our home server to hack any new low-end servers that we can now
 * compromise.
 *
 * @param ns The Netscript API.
 * @param lowend An array of low-end servers.
 * @return An array of low-end servers, possibly updated to include new low-end
 *     servers that have been hacked during this update.
 */
async function update(ns, lowend) {
    assert(lowend.length >= 0);
    const player = new Player(ns);
    const target = low_end_servers(ns);

    // Hack the new low-end servers.
    if (has_new_low_end(lowend, target)) {
        // First, kill all instances of the hack script.
        for (const server of lowend) {
            ns.kill(player.script(), player.home(), server);
        }
        // Next, hack all low-end servers we can now visit, include those
        // newly found.
        const home = new Server(ns, player.home());
        let nthread = home.threads_per_instance(player.script(), target.length);
        if (nthread < 1) {
            nthread = 1;
        }
        for (const server of target) {
            ns.exec(player.script(), player.home(), nthread, server);
        }
    }
    return target;
}

/**
 * Hack various low-end servers found in the game world, excluding purchased
 * servers.  A world server is said to be low-end if it does not have enough
 * RAM to run our hack script on the server.  We use our home server to hack
 * low-end servers.  The script figures out how many threads to use to hack a
 * low-end server.
 *
 * Usage: run low-end.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // We want a less verbose log.
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("sleep");
    // First, kill all instances of the hack script that are running on our
    // home server against a low-end server.  We do this because after
    // reloading the game, the value of the variable "target" is lost.
    // Treat it like we are running this script for the first time.
    const player = new Player(ns);
    for (const server of low_end_servers(ns)) {
        await ns.kill(player.script(), player.home(), server);
    }
    // Continuously try to search for low-end servers to hack.
    const time = minutes_to_milliseconds(1);
    let target = new Array();
    while (true) {
        target = await update(ns, target);
        await ns.print("Low-end servers: " + target.join(", "));
        await ns.sleep(time);
    }
}
