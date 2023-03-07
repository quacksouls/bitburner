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
import {
    gain_root_access,
    has_root_access,
    network,
    num_threads,
} from "/guide/lib/util.js";

/**
 * Gain root access to as many world servers as we can.  Use each compromised
 * server to hack a common target.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} script Our hacking script.  Assumed to be located on home
 *     server.
 * @param {string} target Use our hack script to hack this target server.
 */
function compromise(ns, script, target) {
    network(ns)
        .filter((host) => !skip(ns, script, host))
        .filter((host) => gain_root_access(ns, host))
        .forEach((host) => deploy(ns, script, host, target));
}

/**
 * Deploy our hack script to a compromised server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} script Our hacking script.  Assumed to be located on home
 *     server.
 * @param {string} host Hostname of a world server where we will run our hacking
 *     script.  Assumed to have root access to this server.
 * @param {string} target Use our hack script to hack this target server.
 */
function deploy(ns, script, host, target) {
    const nthread = num_threads(ns, script, host);
    if (
        !has_root_access(ns, host)
        || !has_root_access(ns, target)
        || !ns.fileExists(script, server.HOME)
        || nthread < 1
    ) {
        return;
    }
    ns.scp(script, host, server.HOME);
    ns.exec(script, host, nthread, target);
}

/**
 * Whether to skip a world server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} script Our hacking script.  Assumed to be located on home
 *     server.
 * @param {string} host Hostname of a world server.
 * @returns {boolean} True if the given server is to be skipped over;
 *     false otherwise.
 */
function skip(ns, script, host) {
    const required_lvl = ns.getServer(host).requiredHackingSkill;
    if (
        host === server.HOME
        || ns.getServer(host).purchasedByPlayer
        || ns.scriptRunning(script, host)
        || num_threads(ns, script, host) < 1
        || ns.getHackingLevel() < required_lvl
    ) {
        return true;
    }
    return false;
}

/**
 * Periodically scan the network of world servers and compromise as many servers
 * as possible.  This script accepts a command line argument, i.e. the name of
 * the server to hack.  We will redirect all compromised servers to hack this
 * common target.
 *
 * Usage: run guide/worm.js [targetServer]
 * Example: run guide/worm.js n00dles
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const second = 1000;
    const minute = 60 * second;
    const target = ns.args[0];
    if (!gain_root_access(ns, target)) {
        ns.tprintf(`No root access to target: ${target}`);
        return;
    }
    const script = "/guide/hack.js";
    for (;;) {
        compromise(ns, script, target);
        await ns.sleep(minute);
    }
}
