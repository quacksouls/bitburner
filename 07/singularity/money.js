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

import { home } from "/lib/constant.js";
import { Money } from "/lib/money.js";
import { Time } from "/lib/time.js";

/**
 * Chain load the next scripts.  The script "/singularity/daemon.js" determines
 * whether we should be hacking the w0r1d_d43m0n server.  It terminates if the
 * conditions are not met for the server to appear in the game world.  The
 * script "/singularity/program.js" attempts to purchase port opener programs.
 *
 * @param ns The Netscript API.
 */
function load_chain(ns) {
    const script = ["/singularity/daemon.js", "/singularity/program.js"];
    const nthread = 1;
    for (const s of script) {
        ns.exec(s, home, nthread);
    }
}

/**
 * Commit crimes to raise some money as well earn negative karma.
 *
 * Usage: run singularity/money.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Commit crime to raise some money.
    const m = new Money();
    const threshold = 5 * m.million();
    if (ns.getServerMoneyAvailable(home) > threshold) {
        load_chain(ns);
        return;
    }
    const crime_script = "/singularity/crime.js";
    const nthread = 1;
    ns.exec(crime_script, home, nthread, threshold);
    // Wait for the crime script to end.
    const t = new Time();
    const time = 10 * t.second();
    while (ns.scriptRunning(crime_script, home)) {
        await ns.sleep(time);
    }
    load_chain(ns);
}
