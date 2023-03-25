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
import { log } from "/quack/lib/io.js";
import { exec } from "/quack/lib/util.js";

/**
 * Start a load chain for raising money.
 *
 * Usage: run quack/chain/money.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    while (
        ns.isRunning("/quack/go-low.js", home)
        || ns.isRunning("/quack/go-mid.js", home)
        || ns.isRunning("/quack/go-high.js", home)
    ) {
        await ns.sleep(wait_t.SECOND);
    }

    // Assume our home server has limited RAM.  The server cannot run multiple
    // scripts at the same time.  Load a sleeve script and let it run until
    // completion.  Then start another script.
    let pid = exec(ns, "/quack/sleeve/money.js");
    while (ns.isRunning(pid)) {
        await ns.sleep(wait_t.SECOND);
    }

    // See whether any Coding Contracts have appeared and solve them.
    const script = "/quack/cct/solver.js";
    if (!ns.isRunning(script, home)) {
        log(ns, "Solve Coding Contracts to raise some money");
        pid = exec(ns, script);
        await ns.sleep(10 * wait_t.SECOND);
        ns.kill(pid);
    }

    // Now launch the main script for raising money.
    exec(ns, "/quack/singularity/money.js");
}
