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

import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";

/**
 * Start a load chain for raising money.
 *
 * Usage: run chain/money.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Assume our home server has limited RAM.  The server cannot run multiple
    // scripts at the same time.  Load a sleeve script and let it run until
    // completion.  Then start another script.
    let script = "/sleeve/crime.js";
    const nthread = 1;
    const pid = ns.exec(script, home, nthread);
    while (ns.isRunning(pid)) {
        await ns.sleep(wait_t.SECOND);
    }
    script = "/singularity/money.js";
    ns.exec(script, home, nthread);
}
