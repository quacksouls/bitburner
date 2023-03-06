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
    const home = "home";
    const nthread = num_threads(ns, script, host);
    if (
        !has_root_access(ns, host)
        || !has_root_access(ns, target)
        || !ns.fileExists(script, home)
        || nthread < 1
    ) {
        return;
    }
    ns.scp(script, host, home);
    ns.exec(script, host, nthread, target);
}

/**
 * Attempt to gain root access to a given server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of a world server.
 * @returns {boolean} True if we have root access to the given server;
 *     false otherwise.
 */
function gain_root_access(ns, host) {
    if (has_root_access(ns, host)) {
        return true;
    }
    // Try to open all required ports and nuke the server.
    try {
        ns.brutessh(host);
    } catch {}
    try {
        ns.ftpcrack(host);
    } catch {}
    try {
        ns.httpworm(host);
    } catch {}
    try {
        ns.relaysmtp(host);
    } catch {}
    try {
        ns.sqlinject(host);
    } catch {}
    try {
        ns.nuke(host);
        return true;
    } catch {
        return false;
    }
}

/**
 * Whether we have root access to a world server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of a world server.
 * @returns {boolean} True if we have root access to the given server;
 *     false otherwise.
 */
function has_root_access(ns, host) {
    return ns.getServer(host).hasAdminRights;
}

/**
 * Kill all scripts on all world servers where we have root access.
 *
 * @param {NS} ns The Netscript API.
 */
function kill_scripts(ns) {
    nuke_servers(ns).forEach((host) => ns.killall(host));
}

/**
 * Scan all servers in the game world.  Use a recursive version of
 * depth-first search.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} root Start our scan from this server.  Default is our home
 *     server.
 * @param {string} visit Set of servers we have visited so far.  Default is
 *     empty set.
 * @returns {array<string>} An array of hostnames of world servers, excluding
 *     our home server and purchased servers.
 */
function network(ns, root = "home", visit = new Set()) {
    ns.scan(root)
        .filter((s) => !ns.getServer(s).purchasedByPlayer)
        .filter((s) => !visit.has(s))
        .forEach((s) => {
            visit.add(s);
            network(ns, s, visit);
        });
    return [...visit];
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
 * The maximum number of threads that can be used to run our script on a given
 * server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} script Our hacking script.  Assumed to be located on home
 *     server.
 * @param {string} host Hostname of a world server.
 * @returns {number} The maximum number of threads to run our script on the
 *     given server.
 */
function num_threads(ns, script, host) {
    const home = "home";
    const script_ram = ns.getScriptRam(script, home);
    const { maxRam, ramUsed } = ns.getServer(host);
    const server_ram = maxRam - ramUsed;
    if (server_ram < 1) {
        return 0;
    }
    return Math.floor(server_ram / script_ram);
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
        host === "home"
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
        host === "home"
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
 * Usage: run worm-rater.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const second = 1000;
    const minute = 60 * second;
    const script = "hack.js";
    let target = "";
    for (;;) {
        const new_target = best_target(ns);
        if (target !== new_target) {
            kill_scripts(ns);
            target = new_target;
        }
        compromise(ns, script, target);
        await ns.sleep(minute);
    }
}
