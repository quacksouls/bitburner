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

import { Player } from "/lib/player.js";
import { network } from "/lib/network.js";

/**
 * Kill all scripts on world or purchased servers.  Must provide one of the
 * following at the command line:
 *
 * (1) pserv := Kill all scripts on all purchased servers.
 * (2) world := Kill all scripts on all world servers where we have root access.
 *
 * Usage: run kill-script.js [pserv | world]
 * Example: run kill-script.js pserv
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const error_msg = "Must provide one command line argument: pserv | world";
    // Must provide a command line argument to this script.
    if (ns.args.length < 1) {
        ns.tprint(error_msg);
        return;
    }
    const stype = ns.args[0];
    const player = new Player(ns);
    if ("pserv" == stype) {
        // Kill all scripts on purchased servers.
        player.pserv().map((s) => ns.killall(s));
    } else if ("world" == stype) {
        // Kill all scripts on world servers where we have root access.
        let server = network(ns);
        server = server.filter((s) => ns.hasRootAccess(s));
        server.map((s) => ns.killall(s));
    } else {
        ns.tprint(error_msg);
    }
}
