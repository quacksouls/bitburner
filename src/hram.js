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
import { script } from "/lib/constant/misc.js";
import { home, server } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { network } from "/lib/network.js";
import { Server } from "/lib/server.js";
import { assert, server_of_max_weight } from "/lib/util.js";

/**
 * The number of threads we can use to run a script on our home server.
 *
 * @param ns The Netscript API.
 * @return The number of threads to use.  Always at least 1.
 */
function home_num_threads(ns) {
    const home_serv = new Server(ns, home);
    const nthread = home_serv.num_threads(script);
    return nthread < 1 ? 1 : nthread;
}

/**
 * Suppress various log messages.
 *
 * @param ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMaxMoney");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("scan");
    ns.disableLog("sleep");
}

/**
 * Constantly update the target to hack.
 *
 * @param ns The Netscript API.
 * @param t A string representing the name of the current target.
 * @return The hostname of the (possibly new) server currently being targeted.
 */
function update(ns, t) {
    // Ensure we have root access on the chosen target.
    const target = server_of_max_weight(ns, network(ns));
    const serv = new Server(ns, target);
    assert(serv.has_root_access());
    // No new target.  Hack the current target if it is not already being
    // targeted.
    if (t === target) {
        if (!ns.isRunning(script, home, target)) {
            const nthread = home_num_threads(ns);
            ns.exec(script, home, nthread, target);
            ns.write(server.HRAM, target, io.WRITE);
        }
        return target;
    }
    // We have found a better target.  Hack this better server.
    assert(t !== target);
    if (ns.isRunning(script, home, t)) {
        assert(ns.kill(script, home, t));
    }
    const nthread = home_num_threads(ns);
    ns.exec(script, home, nthread, target);
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
    shush(ns);
    // Periodically search for a better target.  Suspend this script, and kill
    // the spawned script, if we need to share our home server with a faction.
    let target = update(ns, "");
    for (;;) {
        // Do we need to suspend the script?
        if (ns.fileExists(server.SHARE, home)) {
            if (target !== "" && ns.isRunning(script, home, target)) {
                assert(ns.kill(script, home, target));
            }
            await ns.sleep(wait_t.DEFAULT);
            continue;
        }
        // Find a better target.
        target = update(ns, target);
        await ns.sleep(wait_t.DEFAULT);
    }
}
