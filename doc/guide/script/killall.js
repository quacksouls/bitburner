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
 * Kill all scripts running on world servers.  Exclude our home server.
 *
 * Usage: run killall.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    network(ns)
        .filter((s) => !ns.getServer(s).purchasedByPlayer)
        .filter((s) => ns.getServer(s).hasAdminRights)
        .forEach((s) => ns.killall(s));
}
