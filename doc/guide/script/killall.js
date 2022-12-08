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
 * Scan all world servers, excluding purchased servers.  Use a recursive version
 * of depth-first search.
 *
 * @param ns The Netscript API.
 * @param root Start our scan from this node.  Default is our home server.
 * @param visit Set of nodes we have visited so far.  Default is empty set.
 * @return Array of world servers, excluding our home server.
 */
function network(ns, root = "home", visit = new Set()) {
    ns.scan(root)
        .filter((s) => !visit.has(s))
        .filter((s) => !ns.getServer(s).purchasedByPlayer)
        .forEach((s) => {
            visit.add(s);
            network(ns, s, visit);
        });
    return [...visit];
}

/**
 * Kill all scripts running on world servers.  Exclude our home server.
 *
 * Usage: run killall.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    network(ns)
        .filter((s) => ns.getServer(s).hasAdminRights)
        .forEach((s) => ns.killall(s));
}
