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

/**
 * Gain root access to as many world servers as we can.  Use each compromised
 * server to hack a common target.
 *
 * @param ns The Netscript API.
 * @param script Our hacking script.  Assumed to be located on home server.
 * @param target Use our hack script to hack this target server.
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
 * @param ns The Netscript API.
 * @param script Our hacking script.  Assumed to be located on home server.
 * @param host Hostname of a world server where we will run our hacking script.
 *     Assumed to have root access to this server.
 * @param target Use our hack script to hack this target server.
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
 * @param ns The Netscript API.
 * @param host Hostname of a world server.
 * @return True if we have root access to the given server; false otherwise.
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
 * @param ns The Netscript API.
 * @param host Hostname of a world server.
 * @return True if we have root access to the given server; false otherwise.
 */
function has_root_access(ns, host) {
    return ns.getServer(host).hasAdminRights;
}

/**
 * Scan all servers in the game world.  Use breadth-first search.
 *
 * @param ns The Netscript API.
 * @return An array of hostnames, excluding our home server.
 */
function network(ns) {
    const home = "home";
    const q = [home];
    const visit = new Set([home]);
    while (q.length > 0) {
        ns.scan(q.shift())
            .filter((v) => !visit.has(v))
            .forEach((x) => {
                visit.add(x);
                q.push(x);
            });
    }
    visit.delete(home);
    return [...visit];
}

/**
 * The maximum number of threads that can be used to run our script on a given
 * server.
 *
 * @param ns The Netscript API.
 * @param script Our hacking script.  Assumed to be located on home server.
 * @param host Hostname of a world server.
 * @return The maximum number of threads to run our script on the given server.
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
 * @param ns The Netscript API.
 * @param script Our hacking script.  Assumed to be located on home server.
 * @param host Hostname of a world server.
 * @return True if the given server is to be skipped over; false otherwise.
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
 * Periodically scan the network of world servers and compromise as many servers
 * as possible.  This script accepts a command line argument, i.e. the name of
 * the server to hack.  We will redirect all compromised servers to hack this
 * common target.
 *
 * Usage: run worm.js [targetServer]
 * Example: run worm.js n00dles
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const second = 1000;
    const minute = 60 * second;
    const target = ns.args[0];
    if (!gain_root_access(ns, target)) {
        ns.tprint(`No root access to target: ${target}`);
        return;
    }
    const script = "hack.js";
    for (;;) {
        compromise(ns, script, target);
        await ns.sleep(minute);
    }
}
