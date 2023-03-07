/**
 * Copyright (C) 2022--2023 Duck McSouls
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

import { server } from "/guide/lib/constant/server.js";
import { shell } from "/guide/lib/util.js";

/**
 * Connect to a given target server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} target We want to connect to this target server.
 */
function connect(ns, target) {
    // A chain of terminal commands that connect to the target server.
    const not_home = (host) => host !== server.HOME;
    const walk = path(ns, target).filter(not_home);
    if (walk.length === 0) {
        ns.tprint(`Server not reachable from home: ${target}`);
        return;
    }
    const command = `connect ${walk.join("; connect ")}`;
    shell(command);
}

/**
 * Scan all servers in the game world, starting from our home server.  Use
 * breadth-first search.
 *
 * @param {NS} ns The Netscript API.
 * @returns {map} A map of the server preceding a given server.  For example,
 *     p[i] gives a server that directly connects to server i, where p[i]
 *     precedes i.
 */
function network(ns) {
    const q = [server.HOME];
    const visit = new Set([server.HOME]);
    const prev = new Map([[server.HOME, undefined]]);
    const not_visited = (host) => !visit.has(host);
    while (q.length > 0) {
        const u = q.shift();
        ns.scan(u)
            .filter(not_visited)
            .forEach((x) => {
                visit.add(x);
                q.push(x);
                prev.set(x, u);
            });
    }
    return prev;
}

/**
 * A path from our home server to a given target server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} target Hostname of the target server.
 * @returns {array<string>} An array of hostnames of servers in a path from home
 *     to the given target server.  An empty array if the target is not
 *     reachable from home.
 */
function path(ns, target) {
    // Start from the target.  Work backward to find a path from home to the
    // target.
    const stack = [];
    let u = target;
    const prev = network(ns);
    while (prev.get(u) !== undefined) {
        stack.push(u);
        u = prev.get(u);
    }
    // Target is not reachable from home.
    if (stack.length === 0) {
        return [];
    }

    // Reconstruct the full path from home to target.
    stack.push(server.HOME);
    stack.reverse();
    return stack;
}

/**
 * Connect to a target server.  This script accepts a command line argument,
 * i.e. the hostname of the server to which we want to connect.
 *
 * Usage: run guide/connect.js [targetServer]
 * Example: run guide/connect.js run4theh111z
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    // Must provide a command line argument.
    const error_msg = "Must provide the name of the target server.";
    if (ns.args.length < 1) {
        ns.tprintf(error_msg);
        return;
    }

    connect(ns, ns.args[0]);
}
