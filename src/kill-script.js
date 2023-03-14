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
import { network } from "/quack/lib/network.js";

/**
 * Kill all scripts on world or purchased servers.  Must provide one of the
 * following at the command line:
 *
 * (1) pserv := Kill all scripts on all purchased servers.
 * (2) world := Kill all scripts on all world servers where we have root access.
 *
 * Usage: run quack/kill-script.js [pserv | world]
 * Example: run quack/kill-script.js pserv
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    // Must provide a command line argument to this script.
    const error_msg = "Must provide one command line argument: pserv | world";
    if (MyArray.is_empty(ns.args)) {
        ns.tprintf(error_msg);
        return;
    }

    const stype = ns.args[0];
    const kill = (host) => ns.killall(host);
    const is_nuked = (host) => ns.hasRootAccess(host);
    switch (stype) {
        case "pserv":
            ns.getPurchasedServers().forEach(kill);
            break;
        case "world":
            network(ns).filter(is_nuked).forEach(kill);
            break;
        default:
            ns.tprintf(error_msg);
    }
}
