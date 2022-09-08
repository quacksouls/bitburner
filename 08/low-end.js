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
import { Time } from "/lib/time.js";
import { assert, filter_pserv } from "/lib/util.js";

/**
 * All low-end servers against which our hacking script is targetting.
 *
 * @param ns The Netscript API.
 * @return An array of hostnames, each of which is a low-end server that our
 *     hacking script is targetting.  An empty array if:
 *
 *     (1) We have not yet compromised any low-end servers.
 *     (2) Our hack script is not running against any compromised low-end
 *         servers.  We have root access on at least one low-end server, but
 *         our hack script is currently not targetting any of those compromised
 *         servers.
 */
function current_compromised(ns) {
    const hacked = new Array();
    const player = new Player(ns);
    for (const target of low_end_servers(ns)) {
        if (ns.isRunning(player.script(), player.home(), target)) {
            hacked.push(target);
        }
    }
    return hacked;
}

/**
 * Hack any low-end servers we can compromise.
 *
 * @param ns The Netscript API.
 * @param target An array of hostnames of low-end servers.  Assume we can gain
 *     root access on these servers.
 */
async function hack_low_end(ns, target) {
    assert(target.length > 0);
    // First, kill all instances of our hack script (running on home) that are
    // directed against low-end servers.
    const player = new Player(ns);
    const kill_target = low_end_servers(ns);
    kill_target.map(
        host => ns.kill(player.script(), player.home(), host)
    );
    // Next, hack all low-end servers we can now visit, including those newly
    // found.
    const home = new Server(ns, player.home());
    let nthread = home.threads_per_instance(player.script(), target.length);
    if (nthread < 1) {
        nthread = 1;
    }
    for (const host of target) {
        const server = new Server(ns, host);
        assert(await server.gain_root_access());
        ns.exec(player.script(), player.home(), nthread, host);
    }
}

/**
 * Whether we can compromise any new low-end servers.  Suppose there are
 * low-end servers that our hacking script is not targetting.  We want to know
 * if we can compromise any of those remaining low-end servers.
 *
 * @param ns The Netscript API.
 * @return true if there is at least one new low-end server we can compromise;
 *     false otherwise.
 */
function has_target(ns) {
    const HAS_TARGET = true;
    const NO_TARGET = !HAS_TARGET;
    const lowend = new_low_end(ns);
    assert(lowend.length > 0);
    const target = new Array();
    for (const host of lowend) {
        if (skip_low_end(ns, host)) {
            continue;
        }
        target.push(host);
    }
    if (0 == target.length) {
        return NO_TARGET;
    }
    return HAS_TARGET;
}

/**
 * Whether we have compromised all low-end servers and our hack script is
 * running against them.
 *
 * @param ns The Netscript API.
 * @return true if our hack script is running against all low-end servers;
 *     false otherwise.
 */
function is_complete(ns) {
    const lowend = new_low_end(ns);
    if (0 == lowend.length) {
        return true;
    }
    return false;
}

/**
 * Whether a server is a low-end server.  A server is low-end if it does not
 * have enough RAM to run our hack script even using one thread.  We exclude
 * these:
 *
 * (1) Purchased servers.
 * (2) A world server that is currently running our hacking script.
 *
 * @param ns The Netscript API.
 * @param hostname The hostname of a world server.  Cannot be a purchased
 *     server.
 * @return true if the given hostname represents a low-end server;
 *     false otherwise.
 */
function is_low_end(ns, hostname) {
    assert(hostname.length > 0);
    const LOWEND = true;
    const NO_LOWEND = !LOWEND;
    const player = new Player(ns);
    const server = new Server(ns, hostname);
    if (server.is_running_script(player.script())) {
        return NO_LOWEND;
    }
    const nthread = server.num_threads(player.script());
    if (nthread > 0) {
        return NO_LOWEND;
    }
    return LOWEND;
}

/**
 * Choose servers in the game world that are low-end.  A server is low-end if
 * it does not have enough RAM to run our hack script even using one thread.
 *
 * A bankrupt server can be low-end if it lacks the required amount of RAM to
 * run our hack script using one thread.  Although we would not obtain any money
 * from hacking a low-end bankrupt server, we would still obtain some hacking
 * XP.
 *
 * @param ns The Netscript API.
 * @return An array of low-end servers.
 */
function low_end_servers(ns) {
    const server = filter_pserv(ns, network(ns));
    const lowend = new Array();
    for (const s of server) {
        if (is_low_end(ns, s)) {
            lowend.push(s);
        }
    }
    assert(lowend.length > 0);
    return lowend;
}

/**
 * Search for new low-end servers to hack.  Suppose we have already compromised
 * a number of low-end servers and are currently running our hack script
 * against those servers.  This function searches for low-end servers that are
 * not yet compromised.
 *
 * @param ns The Netscript API.
 * @return An array of low-end servers that are yet to be hacked.
 */
function new_low_end(ns) {
    const target = new Array();
    const player = new Player(ns);
    for (const host of low_end_servers(ns)) {
        if (ns.isRunning(player.script(), player.home(), host)) {
            continue;
        }
        target.push(host);
    }
    return target;
}

/**
 * Whether to skip a low-end server.  A low-end server is skipped due to
 * various reasons:
 *
 * (1) The server has a hacking skill requirement that is higher than our Hack
 *     stat.
 * (2) We cannot open all ports on the given low-end server.
 *
 * @param ns The Netscript API.
 * @param host Do we skip this server?
 * @return true if the given server should be skipped; false otherwise.
 */
function skip_low_end(ns, host) {
    assert(is_low_end(ns, host));
    const SKIP = true;
    const NO_SKIP = !SKIP;
    const player = new Player(ns);
    const server = new Server(ns, host);
    if (player.hacking_skill() < server.hacking_skill()) {
        return SKIP;
    }
    if (player.num_ports() < server.num_ports_required()) {
        return SKIP;
    }
    return NO_SKIP;
}

/**
 * Use our home server to hack any new low-end servers that we can now
 * compromise.
 *
 * @param ns The Netscript API.
 * @return true if there are more low-end servers yet to be hacked; false if we
 *     have compromised all low-end servers in the game world.
 */
async function update(ns) {
    const HAS_MORE = true;
    const NO_MORE = !HAS_MORE;
    // No more low-end servers to compromise.
    if (is_complete(ns)) {
        return NO_MORE;
    }
    // Cannot hack any of the remaining low-end servers.
    if (!has_target(ns)) {
        return HAS_MORE;
    }
    // Hack all low-end servers we can compromise.
    const skip = new Array();
    const target = new Array();
    for (const host of low_end_servers(ns)) {
        if (skip_low_end(ns, host)) {
            skip.push(host);
            continue;
        }
        target.push(host);
    }
    const current = current_compromised(ns);
    assert(target.length > 0);
    assert(target.length > current.length);
    await hack_low_end(ns, target);
    if (0 == skip.length) {
        return NO_MORE;
    }
    return HAS_MORE;
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
    ns.disableLog("kill");
    ns.disableLog("scan");
    ns.disableLog("sleep");
    // Continuously search for low-end servers to hack.
    let has_more = true;
    const t = new Time();
    const time = t.minute();
    while (has_more) {
        has_more = await update(ns);
        await ns.sleep(time);
    }
}
