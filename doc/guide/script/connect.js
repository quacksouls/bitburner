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

/**
 * Connect to a given target server.
 *
 * @param ns The Netscript API.
 * @param target We want to connect to this target server.
 */
function connect(ns, target) {
    // A chain of Terminal commands that connect to the target server.
    const walk = path(ns, target).filter((s) => s !== "home");
    if (walk.length === 0) {
        ns.tprint(`Server not reachable from home: ${target}`);
        return;
    }
    const command = `connect ${walk.join("; connect ")}`;
    // Template code from the official documentation of Bitburner:
    //
    // https://bitburner.readthedocs.io/en/latest/netscript/advancedfunctions/inject_html.html
    const input = globalThis["document"].getElementById("terminal-input"); // eslint-disable-line
    input.value = command;
    const handler = Object.keys(input)[1];
    input[handler].onChange({
        target: input,
    });
    input[handler].onKeyDown({
        key: "Enter",
        preventDefault: () => null,
    });
}

/**
 * Scan all servers in the game world, starting from our home server.  Use
 * breadth-first search.
 *
 * @param ns The Netscript API.
 * @return A map of the server preceding a given server.  For example, p[i]
 *     gives a server that directly connects to server i, where p[i] precedes i.
 */
function network(ns) {
    const home = "home";
    const q = [home];
    const visit = new Set([home]);
    const prev = new Map([[home, undefined]]);
    while (q.length > 0) {
        const u = q.shift();
        ns.scan(u)
            .filter((v) => !visit.has(v))
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
 * @param ns The Netscript API.
 * @param target Hostname of the target server.
 * @return An array of servers in a path from home to the given target server.
 *     An empty array if the target is not reachable from home.
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
    stack.push("home");
    stack.reverse();
    return stack;
}

/**
 * Connect to a target server.  This script accepts a command line argument,
 * i.e. the hostname of the server to which we want to connect.
 *
 * Usage: run connect.js [targetServer]
 * Example: run connect.js run4theh111z
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Must provide a command line argument.
    const error_msg = "Must provide the name of the target server.";
    if (ns.args.length < 1) {
        ns.tprint(error_msg);
        return;
    }
    // Connect to the target server.
    connect(ns, ns.args[0]);
}
