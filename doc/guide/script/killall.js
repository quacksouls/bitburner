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
 * Scan all world servers, excluding purchased servers.  Use a recursive version
 * of depth-first search.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} root Start our scan from this node.  Default is our home
 *     server.
 * @param {set} visit Set of nodes we have visited so far.  Default is empty
 *     set.
 * @returns {array<string>} Array of hostnames of world servers, excluding our
 *     home server and purchased servers.
 */
function network(ns, root = "home", visit = new Set()) {
    const not_visited = (host) => !visit.has(host);
    const not_pserv = (host) => !ns.getServer(host).purchasedByPlayer;
    ns.scan(root)
        .filter(not_visited)
        .filter(not_pserv)
        .forEach((host) => {
            visit.add(host);
            network(ns, host, visit);
        });
    return [...visit];
}

/**
 * Kill all scripts running on world servers.  Exclude our home server.
 *
 * Usage: run killall.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const has_root_access = (host) => ns.getServer(host).hasAdminRights;
    const kill_all = (host) => ns.killall(host);
    network(ns).filter(has_root_access).forEach(kill_all);
}
