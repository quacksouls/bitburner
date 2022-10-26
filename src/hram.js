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

import { io } from "/lib/constant/io.js";
import { server } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { network } from "/lib/network.js";
import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import { assert, choose_targets, filter_bankrupt_servers } from "/lib/util.js";

/**
 * Choose the "best" world server to hack.  The definition of "best" is
 * subjective.  However, for our purposes the best target is the server that
 * meet these criteria:
 *
 * (1) The server having the highest Hack stat requirement not exceeding our
 *     Hack stat.
 * (2) We can open all ports on the given server.
 * (3) The server is not bankrupt.
 * (4) Is not a purchased server.
 *
 * If multiple servers meet the above criteria, then we choose the server that
 * has the highest maximum money.
 *
 * @param ns The Netscript API.
 * @return The best server to target.
 */
function best_target(ns) {
    const target = choose_targets(ns, filter_bankrupt_servers(ns, network(ns)));
    if (target.length === 1) {
        return target[0];
    }
    // If we have multiple best targets, choose the target having the highest
    // maximum money.
    let host = "";
    let max_money = -Infinity;
    target.forEach((s) => {
        if (ns.getServerMaxMoney(s) > max_money) {
            max_money = ns.getServerMaxMoney(s);
            host = s;
        }
    });
    return host;
}

/**
 * Constantly update the target to hack.
 *
 * @param ns The Netscript API.
 * @param t A string representing the name of the current target.
 * @return The hostname of the (possibly new) server currently being targeted.
 */
function update(ns, t) {
    const target = best_target(ns);
    assert(target !== "");
    const player = new Player(ns);
    const home = new Server(ns, player.home());
    // No new target.  Hack the current target if it is not already being
    // targeted.
    if (t === target) {
        if (!ns.isRunning(player.script(), player.home(), target)) {
            const nthread = home.num_threads(player.script());
            ns.exec(player.script(), player.home(), nthread, target);
            ns.write(server.HRAM, target, io.WRITE);
        }
        return target;
    }
    // We have found a better target.  Hack this better server.
    assert(t !== target);
    const nthread = home.num_threads(player.script());
    if (ns.isRunning(player.script(), player.home(), t)) {
        assert(ns.kill(player.script(), player.home(), t));
    }
    ns.exec(player.script(), player.home(), nthread, target);
    ns.write(server.HRAM, target, io.WRITE);
    return target;
}

/**
 * Use the RAM of our home server for miscellaneous tasks.  For now, use the
 * home RAM to hack a world server.  If at some later time we need to devote the
 * home RAM to another task, then this script should be suspended to free up
 * some RAM.
 *
 * Usage: run hram.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMaxMoney");
    ns.disableLog("scan");
    ns.disableLog("sleep");
    // Periodically search for a better target.  Kill this, and the spawned
    // script, if we need to share our home server with a faction.
    let target = update(ns, "");
    const player = new Player(ns);
    for (;;) {
        // Do we need to suspend the script?
        if (ns.fileExists(server.SHARE, player.home())) {
            if (
                target !== ""
                && ns.isRunning(player.script(), player.home(), target)
            ) {
                assert(ns.kill(player.script(), player.home(), target));
            }
            await ns.sleep(wait_t.DEFAULT);
            continue;
        }
        // Find a better target.
        target = update(ns, target);
        await ns.sleep(wait_t.DEFAULT);
    }
}
