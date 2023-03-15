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

import { MyArray } from "/quack/lib/array.js";
import { home } from "/quack/lib/constant/server.js";
import { network, shortest_path } from "/quack/lib/network.js";
import { assert, shell } from "/quack/lib/util.js";

/**
 * Connect to a given target server.
 *
 * @param {array<string>} path An array of hostnames along the path that
 *     connects to a target server.  The target server is the last element of
 *     this array.
 */
function connect(path) {
    // A chain of terminal commands that connect to the target server.
    assert(!MyArray.is_empty(path));
    const cmd = `connect ${path.filter((s) => s !== home).join("; connect ")}`;
    shell(cmd);
}

/**
 * Connect to a target server.  This script accepts a command line argument:
 *
 * (1) target := Hostname of the server to which we want to connect.
 *
 * Usage: run quack/connect.js [targetServer]
 * Example: run quack/connect.js run4theh111z
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    // Must provide a command line argument.
    const error_msg = "Must provide the name of the target server.";
    if (MyArray.is_empty(ns.args)) {
        ns.tprintf(error_msg);
        return;
    }

    // Not a server in the game world.  Exclude purchased servers.
    const target = ns.args[0];
    const server = new Set(network(ns));
    if (!server.has(target)) {
        ns.tprintf(`Server not found: ${target}`);
        return;
    }

    // Find shortest path.
    const path = shortest_path(ns, home, target);
    if (MyArray.is_empty(path)) {
        ns.tprintf(`Target server must be reachable from ${home}.`);
        return;
    }
    connect(path);
}
