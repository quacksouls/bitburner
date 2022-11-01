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

import { crimes } from "/lib/constant/crime.js";
import { colour } from "/lib/constant/misc.js";
import { wait_t } from "/lib/constant/time.js";
import { log } from "/lib/io.js";
import { has_sleeve_api } from "/lib/source.js";
import { Sleeve } from "/lib/sleeve/cc.js";
import { assert } from "/lib/util.js";

/**
 * Assign sleeves to commit a specific crime.  There are two reasons why we do
 * this:
 *
 * (1) Raise some money.  This is especially important early in a BitNode when
 *     our stats and money are low.  It is likely that we need to raise money to
 *     upgrade the RAM of our home server, thus allowing us to run multiple
 *     scripts at the same time.
 * (2) Lower our karma.  In a BitNode other than BitNode-2: Rise of the
 *     Underworld, our karma must be at -54,000 or lower to meet one of the
 *     requirements for creating a gang.
 *
 * @param ns The Netscript API.
 * @param crime Assign sleeves to commit this crime.
 * @param tau Commit the given crime for this amount of time (in milliseconds).
 *     Must be non-negative integer.
 */
async function commit_crime(ns, crime, tau) {
    assert(tau >= 0);
    log(ns, crime);
    const sleeve = new Sleeve(ns);
    sleeve.all().forEach((i) => ns.sleeve.setToCommitCrime(i, crime));
    await ns.sleep(tau);
}

/**
 * Assign sleeves to synchronize with the consciousness of the player.
 *
 * @param ns The Netscript API.
 * @param tau Synchronize for this amount of time (in milliseconds).  Must be a
 *     positive integer.
 */
async function synchronize(ns, tau) {
    assert(tau > 0);
    log(ns, "Synchronize");
    const sleeve = new Sleeve(ns);
    sleeve.synchronize();
    await ns.sleep(tau);
}

/**
 * Manage our sleeves.
 *
 * @param ns The Netscript API.
 */
async function update(ns) {
    await commit_crime(ns, crimes.KILL, 10 * wait_t.MINUTE);
    await synchronize(ns, wait_t.MINUTE);
}

/**
 * Assign sleeves to commit crimes as a means of earning money and lower karma.
 *
 * Usage: run sleeve/money.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    if (!has_sleeve_api(ns)) {
        log(ns, "No access to Sleeve API", colour.RED);
        return;
    }
    for (;;) {
        await update(ns);
    }
}
