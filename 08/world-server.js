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

import { NO_SKIP, SKIP } from "/lib/constant.bool.js";
import { network } from "/lib/network.js";
import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import { Time } from "/lib/time.js";
import {
    assert, choose_best_server, filter_bankrupt_servers, filter_pserv
} from "/lib/util.js";

/**
 * Determine which servers in the game world have been compromised.  We
 * exclude all purchased servers.  A server in the game world is said to be
 * compromised provided that:
 *
 * (1) We have root access to the server.
 * (2) Our hack scripts are currently running on the server.
 *
 * @param ns The Netscript API.
 * @param script A hack script.  We want to check whether a server is running
 *     this script.
 * @param server An array of server names.
 * @return An array of servers that have been compromised.
 */
function compromised_servers(ns, script, server) {
    assert(server.length > 0);
    const compromised = new Array();
    for (const s of filter_pserv(ns, server)) {
        const serv = new Server(ns, s);
        if (serv.has_root_access() && serv.is_running_script(script)) {
            compromised.push(s);
        }
    }
    return compromised;
}

/**
 * Gain root access to a server, copy our hack scripts over to the server, and
 * use the server to hack a target.
 *
 * @param ns The Netscript API.
 * @param server Use this server to hack a target.
 * @param target Hack this server.
 */
async function hack_a_server(ns, server, target) {
    const serv = new Server(ns, server);
    const targ = new Server(ns, target);
    // Ensure we have root access on both servers.
    if (!serv.has_root_access()) {
        await serv.gain_root_access();
    }
    if (!targ.has_root_access()) {
        await targ.gain_root_access();
    }
    // Copy our hack script over to a server.  Use the server to hack a target.
    assert(await serv.deploy(targ.hostname()));
}

/**
 * Try to hack a bunch of servers in the game world.
 *
 * @param ns The Netscript API.
 * @param target Try to hack one or more servers on this list.  Can't be
 *     an empty array.
 * @return An array [reject, hacked] as follows.
 *     (1) reject := An array of servers we can't hack at the moment.
 *     (2) hacked := An array of servers that have been hacked.
 */
async function hack_servers(ns, target) {
    // Sanity check.
    assert(target.length > 0);
    // Determine the maximum number of ports we can open on a server.
    const player = new Player(ns);
    const nport = player.num_ports();
    assert(nport >= 0);
    // A list of servers that were successfully hacked.
    const hacked_server = new Array();
    // Gain root access to as many servers as possible on the network.  Copy
    // our hack script to each server and use the server to hack itself.
    const reject = new Array();  // Servers we can't hack at the moment.
    // A Hack stat margin: 1% of our Hack stat, plus another 5 points.
    const margin = Math.floor((0.01 * player.hacking_skill()) + 5);
    for (const s of target) {
        // Should we skip this server?
        if (skip_server(ns, s, player.script(), margin)) {
            continue;
        }
        const server = new Server(ns, s);
        const hack_lvl = player.hacking_skill();
        const required_lvl = server.hacking_skill();
        // If the hacking skill requirement of the server is within the margin
        // of our Hack stat, skip the server for now but make a note to attempt
        // at a later time.
        if (hack_lvl < required_lvl) {
            if (tolerate_margin(ns, margin, s)) {
                reject.push(s);
                continue;
            }
        }
        assert(hack_lvl >= required_lvl);
        // If the server is bankrupt, skip the server for now and add it to
        // the list of rejects.
        if (server.is_bankrupt()) {
            reject.push(s);
            continue;
        }
        // Use the server to hack itself.
        await hack_a_server(ns, s, s);
        hacked_server.push(s);
    }
    return [reject, hacked_server];
}

/**
 * Use a bankrupt server to hack a server that can hold money.
 *
 * @param ns The Netscript API.
 * @param candidate Scan this array of servers to see whether any is bankrupt.
 * @param hacked_server Each server in this array has been successfully hacked.
 *     The implication is that each server is not bankrupt, i.e. can hold money.
 * @return An array of servers we cannot redirect at the moment.
 */
async function redirect_bankrupt_server(ns, candidate, hacked_server) {
    // Sanity checks.
    assert(candidate.length > 0);
    assert(hacked_server.length > 0);
    // An array of hacked servers.  We remove bankrupt servers from this list.
    let hserver = filter_bankrupt_servers(ns, Array.from(hacked_server));
    const reject = new Array();
    const player = new Player(ns);
    for (const s of candidate) {
        const server = new Server(ns, s);
        if (player.hacking_skill() >= server.hacking_skill()) {
            // Redirect a bankrupt server to hack a target.
            if (server.is_bankrupt()) {
                // Choose a target server from a list of servers that have
                // been hacked.
                const target = new Server(ns, choose_best_server(ns, hserver));
                assert(!target.is_bankrupt());
                hserver = hserver.filter(s => s != target.hostname());
                // Redirect the bankrupt server to hack the target server.
                await hack_a_server(ns, s, target.hostname());
                continue;
            }
        }
        reject.push(s);
    }
    return reject;
}

/**
 * Whether we should skip the server.  A server might be skipped over for
 * various reasons.
 *
 * @param ns The Netscript API.
 * @param server Should we skip this server?
 * @param script The name of our hacking script.
 * @param margin The Hack stat margin.  For servers whose hacking skill
 *     requirement is higher than our current Hack stat, the margin is the
 *     extra Hack stat we are willing to wait to acquire.  Let h be our Hack
 *     stat, let m be the margin, and r the required hacking skill requirement
 *     of the server.  If h + m < r, then the hacking skill requirement of the
 *     server is too high and we should skip over this server.  In case
 *     h < r and h + m >= r, we are willing to wait for our Hack stat to
 *     increase by an extra m points.
 * @return true if we are to skip over the given server; false otherwise.
 */
function skip_server(ns, server, script, margin) {
    const serv = new Server(ns, server);
    const player = new Player(ns);
    const m = Math.floor(margin);
    assert(m > 0);
    // Determine the maximum number of ports we can open on a server.
    const nport = player.num_ports();
    assert(nport >= 0);
    // Skip over a server that requires more ports than we can open.
    if (serv.num_ports_required() > nport) {
        return SKIP;
    }
    // If our hack script is already running on the server, then skip the
    // server.
    if (serv.is_running_script(script)) {
        return SKIP;
    }
    // Determine how many threads we can run our script on a server.  If we
    // can't run our script on the server, then we skip the server.
    const nthread = serv.num_threads(script);
    if (nthread < 1) {
        return SKIP;
    }
    // Skip over a server if its hacking skill requirement is too high.
    if ((player.hacking_skill() + m) < serv.hacking_skill()) {
        return SKIP;
    }
    return NO_SKIP;
}

/**
 * Whether to tolerate the given margin with respect to the hacking skill
 * requirement of a server.  Let h be our Hack stat, m the margin, and r the
 * hacking skill requirement of a server.  Suppose that h < r.  We are willing
 * to tolerate the margin, i.e. wait for our Hack stat to increase by an extra
 * m points, provided that h + m >= r.
 *
 * @param ns The Netscript API.
 * @param margin The Hack stat margin.
 * @param server The target server.
 * @return true if we are willing to tolerate the margin; false otherwise.
 */
function tolerate_margin(ns, margin, server) {
    const serv = new Server(ns, server);
    const player = new Player(ns);
    const h = player.hacking_skill();
    const m = Math.floor(margin);
    assert(m > 0);
    const requirement = serv.hacking_skill();
    assert(h < requirement);
    return (h + m) >= requirement;
}

/**
 * Search for world servers to hack.  We exclude purchased servers.
 *
 * @param ns The Netscript API.
 */
async function update(ns) {
    let server = network(ns);
    const t = new Time();
    const time = 10 * t.second();
    // A list of servers that have been successfully hacked.
    const player = new Player(ns);
    let hacked_server = compromised_servers(ns, player.script(), server);
    // Continuously try to gain root access to servers in the game world and
    // let each server hack itself.  Exclude all purchased servers.
    while (server.length > 0) {
        let [reject, hacked] = await hack_servers(ns, server);
        hacked_server = [...new Set(hacked_server.concat(hacked))];
        assert(hacked_server.length > 0);
        // Redirect a bankrupt server to hack another target.
        if (reject.length > 0) {
            reject = await redirect_bankrupt_server(ns, reject, hacked_server);
        }
        server = reject;
        await ns.sleep(time);
    }
}

/**
 * Use each server in the game world to hack itself.  We exclude purchased
 * servers.  A bankrupt server is used to hack another world server that
 * isn't bankrupt.
 *
 * Usage: run world-server.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("scan");
    ns.disableLog("sleep");
    // Continuously look for world servers to hack.
    const t = new Time();
    const time = 10 * t.minute();
    while (true) {
        await update(ns);
        await ns.sleep(time);
    }
}
