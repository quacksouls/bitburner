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

import { home } from "/lib/constant/server.js";
import { network, shortest_path } from "/lib/network.js";
import { assert } from "/lib/util.js";

/**
 * Connect to a given target server.
 *
 * @param path An array of hostnames along the path that connects to a target
 *     server.  The target server is the last element of this array.
 */
function connect(path) {
    // A chain of Terminal commands that connect to the target server.
    assert(path.length > 0);
    const cmd = `connect ${path.filter((s) => s !== home).join("; connect ")}`;
    // Template code from the official documentation of Bitburner:
    //
    // https://bitburner.readthedocs.io/en/latest/netscript/advancedfunctions/inject_html.html
    const input = globalThis.document.getElementById("terminal-input");
    input.value = cmd;
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
    // Not a server in the game world.  Exclude purchased servers.
    const target = ns.args[0];
    const server = new Set(network(ns));
    if (!server.has(target)) {
        ns.tprint(`Server not found: ${target}`);
        return;
    }
    // Find shortest path.
    const path = shortest_path(ns, home, target);
    if (path.length < 1) {
        ns.tprint(`Target server must be reachable from ${home}.`);
        return;
    }
    connect(path);
}
