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

import {
    intelligence, intelligence_gain_per_minute
} from "/intelligence/util.js";
import { bool } from "/lib/constant/bool.js";
import { crimes } from "/lib/constant/crime.js";
import { wait_t } from "/lib/constant/time.js";
import { greatest_chance } from "/lib/singularity/crime.js";
import { assert } from "/lib/util.js";

/**
 * Commit a crime for one hour.
 *
 * @param ns The Netscript API.
 * @param c We want to commit this crime.
 */
async function commit_crime(ns, c) {
    assert(c.length > 0);
    const before = intelligence(ns);
    const n = 60;
    ns.singularity.commitCrime(c, bool.FOCUS);
    await ns.sleep(wait_t.HOUR);
    ns.singularity.stopAction();
    const after = intelligence(ns);
    const action = "Commit crime: " + c;
    intelligence_gain_per_minute(ns, before, after, action, n);
}

/**
 * Commit various crimes.
 *
 * @param ns The Netscript API.
 */
async function commit_all_crimes(ns) {
    let crime = Array.from(Object.values(crimes));
    while (crime.length > 0) {
        const c = greatest_chance(ns, crime)[0];
        await commit_crime(ns, c);
        crime = crime.filter(a => a != c);
    }
}

/**
 * Determine the amount of Intelligence XP gained from crime.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    await commit_all_crimes(ns);
}
