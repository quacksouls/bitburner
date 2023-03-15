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

import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { exec } from "/quack/lib/util.js";

/**
 * Start a load chain to run scripts related to factions.
 *
 * Usage: run quack/chain/faction.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    ns.disableLog("sleep");
    while (ns.isRunning("/quack/singularity/program.js", home)) {
        await ns.sleep(wait_t.SECOND);
    }
    exec(ns, "/quack/faction/go.js");
}
