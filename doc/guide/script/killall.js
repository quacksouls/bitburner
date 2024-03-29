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

import { network } from "/guide/lib/util.js";

/**
 * Kill all scripts running on world servers.  Exclude our home server.
 *
 * Usage: run guide/killall.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const has_root_access = (host) => ns.getServer(host).hasAdminRights;
    const kill_all = (host) => ns.killall(host);
    network(ns).filter(has_root_access).forEach(kill_all);
}
