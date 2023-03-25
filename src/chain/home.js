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

import { exec } from "/quack/lib/util.js";

/**
 * Start a load chain to run scripts to upgrade our home server.
 *
 * Usage: run quack/chain/home.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    ns.disableLog("sleep");
    exec(ns, "/quack/singularity/home.js");
}
