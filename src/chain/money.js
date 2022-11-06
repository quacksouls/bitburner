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
import { log } from "/lib/io.js";
import { exec, hram_resume, hram_suspend } from "/lib/util.js";

/**
 * Start a load chain for raising money.
 *
 * Usage: run chain/money.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Try to free up some RAM on home server so we can run the scripts below.
    await hram_suspend(ns);
    // Assume our home server has limited RAM.  The server cannot run multiple
    // scripts at the same time.  Load a sleeve script and let it run until
    // completion.  Then start another script.
    let pid = exec(ns, "/sleeve/money.js");
    while (ns.isRunning(pid)) {
        await ns.sleep(wait_t.SECOND);
    }
    // See whether any Coding Contracts have appeared and solve them.
    const script = "/cct/solver.js";
    if (!ns.isRunning(script, home)) {
        log(ns, "Solve Coding Contracts to raise some money");
        const ntry = 3;
        for (let i = 0; i < ntry; i++) {
            pid = exec(ns, script);
            await ns.sleep(wait_t.DEFAULT);
            ns.kill(pid);
        }
    }
    // Now launch the main script for raising money.
    exec(ns, "/singularity/money.js");
    hram_resume(ns);
}
