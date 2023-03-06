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
function network(ns, root = "home", visit = new Set()) {
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
 * Print data about a Coding Contract found on a given server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of a server where a Coding Contract is found.
 */
function print_cct(ns, host) {
    ns.ls(host, ".cct").forEach((file) => {
        const type = ns.codingcontract.getContractType(file, host);
        ns.tprintf(`${host}: ${file}, ${type}`);
    });
}

/**
 * Find Coding Contracts on world servers.
 *
 * Usage: run find-cct.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const has_cct = (host) => ns.ls(host, ".cct").length > 0;
    const log = (host) => print_cct(ns, host);
    network(ns).concat(["home"]).filter(has_cct).forEach(log);
}
