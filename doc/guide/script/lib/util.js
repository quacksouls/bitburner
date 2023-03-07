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

import { server } from "/guide/lib/constant/server.js";

/// ///////////////////////////////////////////////////////////////////////
// Miscellaneous utility functions
/// ///////////////////////////////////////////////////////////////////////

/**
 * Attempt to gain root access to a given server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of a world server.
 * @returns {boolean} True if we have root access to the given server;
 *     false otherwise.
 */
export function gain_root_access(ns, host) {
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
export function has_root_access(ns, host) {
    return ns.getServer(host).hasAdminRights;
}

/**
 * Scan all servers in the game world.  Exclude purchased servers and our home
 * server.
 *
 * @param {ns} ns The Netscript API.
 * @param {string} root Start scanning from this server.  Default is home
 *     server.
 * @param {set} visit Set of servers visited so far.  Default is empty set.
 * @returns {array<string>} Array of hostnames of world servers, excluding home
 *     and purchased servers.
 */
export function network(ns, root = server.HOME, visit = new Set()) {
    const not_pserv = (host) => !ns.getServer(host).purchasedByPlayer;
    const not_visited = (host) => !visit.has(host);
    // Use a recursive version of depth-first search.
    ns.scan(root)
        .filter(not_pserv)
        .filter(not_visited)
        .forEach((host) => {
            visit.add(host);
            network(ns, host, visit);
        });
    return [...visit];
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
export function num_threads(ns, script, host) {
    const script_ram = ns.getScriptRam(script, server.HOME);
    const { maxRam, ramUsed } = ns.getServer(host);
    const server_ram = maxRam - ramUsed;
    return server_ram < 1 ? 0 : Math.floor(server_ram / script_ram);
}

/**
 * Hackish way to implement rudimentary shell scripting in Bitburner.
 *
 * @param {string} cmd The terminal commands we want to run.
 */
export function shell(cmd) {
    const input = globalThis["document"].getElementById("terminal-input"); // eslint-disable-line
    input.value = cmd;
    const handler = Object.keys(input)[1];
    input[handler].onChange({
        target: input,
    });
    input[handler].onKeyDown({
        key: "Enter",
        preventDefault: () => null,
    });
}
