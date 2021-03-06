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

import { shortest_path } from "./libbnr.js";

/**
 * Determine the shortest path from our home server to a target server.
 * Must provide the target server from the command line.
 *
 * Usage: run shortest-path.js [targetServer]
 * Example: run shortest-path.js run4theh111z
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Must provide a command line argument.
    const error_msg = "Must provide the name of the target server.";
    if (ns.args.length < 1) {
        await ns.tprint(error_msg);
        ns.exit();
    }
    const target = ns.args[0];
    const path = shortest_path(ns, "home", target);
    if (path.length < 1) {
        await ns.tprint("Target server must be reachable from home.");
        ns.exit();
    }
    ns.tprint(path.join(" -> "));
}
