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

import { server } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { log } from "/lib/io.js";
import { network } from "/lib/network.js";
import { Server } from "/lib/server.js";
import { nuke_servers } from "/lib/util.js";

/**
 * Deploy our hack script to a nuked server.  Use the server to hack the given
 * target.
 *
 * @param ns The Netscript API.
 * @param host Hostname of a world server where we will run our hacking script.
 *     Assumed to have root access to this server.
 * @param target Use our hack script to hack this target server.
 */
function deploy(ns, host, target) {
    const serv = new Server(ns, host);
    serv.deploy(target);
}

/**
 * Disable various messages in the script log.
 *
 * @param ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("scan");
    ns.disableLog("sleep");
}

/**
 * Search for world servers to nuke.  Direct each compromised server to target a
 * common server.  We exclude purchased servers.
 *
 * @param ns The Netscript API.
 * @param target Hostname of the server to target.
 */
async function update(ns, target) {
    nuke_servers(ns, network(ns)).forEach((host) => deploy(ns, host, target));
}

/**
 * The naive hacking algorithm.  We pool the resources of world servers into a
 * botnet.  Use the botnet to hack a common target.  We exclude purchased
 * servers.
 *
 * This script relies on the basic hacking script.  It is not an implementation
 * of a proto-batcher nor a sequential batcher.  The script accepts a command
 * line argument:
 *
 * (1) target := Hostname of the server to target.  If not provided, then target
 *     n00dles by default.
 *
 * By default we should target n00dles because the naive algorithm
 * (against n00dles) can generate money quicker than a sequential
 * batcher.  Data here
 *
 * https://github.com/quacksouls/bitburner/blob/main/data/hgw/world.md
 *
 * Usage: run world.js [target]
 * Example: run world.js n00dles
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    const target = ns.args.length > 0 ? ns.args[0] : server.NOODLES;
    // Continuously look for world servers to nuke.
    log(ns, "Searching for world servers to nuke and hack");
    for (;;) {
        await update(ns, target);
        await ns.sleep(5 * wait_t.MINUTE);
    }
}
