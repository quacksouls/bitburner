/**
 * Copyright (C) 2023 Duck McSouls
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

import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";
import { network } from "/quack/lib/network.js";
import { Server } from "/quack/lib/server.js";
import { nuke_servers } from "/quack/lib/util.js";

/**
 * Deploy our share script to a nuked server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of a world server where we will run our share
 *     script.  Assumed to have root access to this server.
 */
function deploy(ns, host) {
    const serv = new Server(ns, host);
    serv.share();
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("scan");
    ns.disableLog("sleep");
}

/**
 * Search for world servers to nuke.  Share the RAM of a nuked server with a
 * faction.  We exclude purchased servers.
 *
 * @param {NS} ns The Netscript API.
 */
function update(ns) {
    nuke_servers(ns, network(ns)).forEach((host) => deploy(ns, host));
}

/**
 * Share our botnet with a faction.  Sharing would boost the rate at which we
 * gain reputation within the faction.  The script takes the following
 * parameter:
 *
 * (1) factionName := The name of the faction with which we are sharing our
 *     botnet.
 *
 * Usage: run quack/faction/share.js [factionName]
 * Example: run quack/faction/share.js Netburners
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    const faction = ns.args[0];
    log(ns, `Share botnet with faction ${faction}`);
    for (;;) {
        update(ns);
        await ns.sleep(5 * wait_t.MINUTE);
    }
}
