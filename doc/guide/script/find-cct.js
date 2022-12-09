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
 * Scan all servers in the game world.  Exclude purchased servers and our home
 * server.
 *
 * @param ns The Netscript API.
 * @param root Start scanning from this server.  Default is home server.
 * @param visit Set of servers visited so far.  Default is empty set.
 * @return Array of world servers, excluding home and purchased servers.
 */
function network(ns, root = "home", visit = new Set()) {
    // Use a recursive version of depth-first search.
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
 * Print data about a Coding Contract found on a given server.
 *
 * @param ns The Netscript API.
 * @param host Hostname of a server where a Coding Contract can be found.
 */
function print_cct(ns, host) {
    ns.ls(host, ".cct").forEach((f) => {
        const type = ns.codingcontract.getContractType(f, host);
        ns.tprintf(`${host}: ${f}, ${type}`);
    });
}

/**
 * Find Coding Contracts on world servers.
 *
 * Usage: run find-cct.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const has_cct = (s) => ns.ls(s, ".cct").length > 0;
    network(ns)
        .concat(["home"])
        .filter((s) => has_cct(s))
        .forEach((s) => print_cct(ns, s));
}
