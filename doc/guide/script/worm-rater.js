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
 * The best target server to hack.  This server has the greatest hack
 * desirability score.
 *
 * @param {NS} ns The Netscript API.
 * @returns {string} Hostname of the server to target.
 */
function best_target(ns) {
    const better_server = (s, t) => (weight(ns, s) < weight(ns, t) ? t : s);
    return nuke_servers(ns).reduce(better_server);
}

/**
 * Gain root access to as many world servers as we can.  Use each compromised
 * server to hack a common target.  The common target is automatically chosen.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} script Our hacking script.  Assumed to be located on home
 *     server.
 * @param {string} target Direct nuked servers to hack this common server.
 */
function compromise(ns, script, target) {
    network(ns)
        .filter((s) => !skip(ns, script, s))
        .filter((s) => gain_root_access(ns, s))
        .forEach((s) => deploy(ns, script, s, target));
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
 * Gain root access to as many world servers as we can.
 *
 * @param {NS} ns The Netscript API.
 * @returns {array<string>} An array of hostnames of servers.  We have root
 *     access to each server.
 */
function nuke_servers(ns) {
    return network(ns).filter((s) => gain_root_access(ns, s));
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
 * The weight, or hack desirability, of a server.  Higher weight is better.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host The hostname of a server.
 * @returns {number} A non-negative number representing the hack desirability of
 *     the given server.
 */
function weight(ns, host) {
    const serv = ns.getServer(host);
    const threshold = ns.getHackingLevel() / 2;
    if (
        host === server.HOME
        || serv.purchasedByPlayer
        || !serv.hasAdminRights
        || serv.requiredHackingSkill > threshold
    ) {
        return 0;
    }
    return serv.moneyMax / serv.minDifficulty;
}

/**
 * Periodically scan the network of world servers and compromise as many servers
 * as possible.  Use the nuked servers to hack a common target.
 *
 * Usage: run guide/worm-rater.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const second = 1000;
    const minute = 60 * second;
    const script = "/guide/hack.js";
    let target = "";
    for (;;) {
        const new_target = best_target(ns);
        if (target !== new_target) {
            const nthread = 1;
            ns.exec("/guide/killall.js", server.HOME, nthread);
            target = new_target;
        }
        compromise(ns, script, target);
        await ns.sleep(minute);
    }
}
