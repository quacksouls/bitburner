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

import { home, home_t } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { exec } from "/quack/lib/util.js";

/**
 * Start a load chain for studying at a university.  A script in the chain would
 * likely use functions from the Singularity API.  Each function from this API
 * tends to use a huge amount of RAM.
 *
 * Usage: run quack/chain/study.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Try to free up some RAM on home server so we can run the scripts below.
    // await hram_suspend(ns);
    // Assume our home server has limited RAM.  The server cannot run multiple
    // scripts at the same time.  Load a sleeve script and let it run until
    // completion.  Then start another script.
    const pid = exec(ns, "/quack/sleeve/study.js");
    while (ns.isRunning(pid)) {
        await ns.sleep(wait_t.SECOND);
    }
    exec(ns, "/quack/singularity/study.js");
    if (ns.getServer(home).maxRam >= home_t.RAM_HIGH) {
        exec(ns, "/quack/gang/program.js");
    }
    // hram_resume(ns);
}
