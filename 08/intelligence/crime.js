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
import { all_crimes } from "/lib/constant.js";
import { Time } from "/lib/time.js";
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
    const t = new Time();
    const time = n * t.minute();
    const focus = true;
    ns.singularity.commitCrime(c, focus);
    await ns.sleep(time);
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
    let crime = all_crimes();
    while (crime.length > 0) {
        const c = greatest_chance(ns, crime)[0];
        await commit_crime(ns, c);
        crime = crime.filter(a => a != c);
    }
}

/**
 * Choose a crime that has the highest chance of success.
 *
 * @param ns The Netscript API.
 * @param crime An array of crime names.
 * @return An array of strings, where each element is the name of a crime.
 *     If the array has multiple elements, then all crimes in the array have
 *     the same chance of success.
 */
function greatest_chance(ns, crime) {
    assert(crime.length > 0);
    let max = 0;
    const chance = new Map();
    const million = 10 ** 6;
    for (const c of crime) {
        // We want to avoid floating point numbers when we compare the chance
        // of success of various crimes.  Convert the probability of success to
        // an integer.
        const prob = ns.singularity.getCrimeChance(c);
        const n = Math.round(prob * million);
        if (max < n) {
            max = n;
        }
        if (chance.has(n)) {
            const crime_name = chance.get(n);
            crime_name.push(c);
            chance.set(n, crime_name);
            continue;
        }
        const crime_name = [c];
        chance.set(n, crime_name);
    }
    return chance.get(max);
}

/**
 * Determine the amount of Intelligence XP gained from crime.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    await commit_all_crimes(ns);
}
