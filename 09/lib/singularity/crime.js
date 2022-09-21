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

// Miscellaneous helper functions related to crime.

import { bool } from "/lib/constant/bool.js";
import { crimes } from "/lib/constant/crime.js";
import { home } from "/lib/constant/server.js";
import { Player } from "/lib/player.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Commit various crimes to raise our income to a given threshold.
 *
 * @param ns The Netscript API.
 * @param threshold Continue to commit crime as long as our income is below
 *     this threshold.
 */
export async function commit_crime(ns, threshold) {
    assert(threshold > 0);
    const script = "/singularity/crime.js";
    const nthread = 1;
    ns.exec(script, home, nthread, threshold);
    const t = new Time();
    const time = 5 * t.second();
    let money = ns.getServerMoneyAvailable(home);
    while ((money < threshold) || ns.singularity.isBusy()) {
        await ns.sleep(time);
        money = ns.getServerMoneyAvailable(home);
    }
    ns.singularity.stopAction();
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
export function greatest_chance(ns, crime) {
    assert(crime.length > 0);
    let max = 0;
    const chance = new Map();
    const million = 1e6;
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
 * Accumulate negative karma.  Stop when our negative karma is at or lower than
 * a given threshold.
 *
 * @param ns The Netscript API.
 * @param threshold We want our negative karma to be at or lower than this
 *     threshold.  Must be a negative integer.
 * @param crime The crime we must carry out to lower our karma.
 *     Either "shoplift" or "homicide".
 * @param nkill If crime := "homicide", then we must also provide the target
 *     number of people to kill.  Pass in 0 if the crime is not homicide.  Pass
 *     in Infinity if we care only about lowering our karma and not about the
 *     number of people killed.  Must be a non-negative integer.
 */
export async function lower_karma(ns, threshold, crime, nkill) {
    // Sanity checks.
    assert(threshold < 0);
    assert((crimes.SHOP == crime) || (crimes.KILL == crime));
    assert(nkill >= 0);
    // Relocate to raise Intelligence XP.
    ns.singularity.goToLocation("The Slums");
    // Shoplift.  Use the ceiling function to convert the karma value to an
    // integer.  It is safer to compare integers than it is to compare floating
    // point numbers.
    const t = new Time();
    const time = t.second();
    const player = new Player(ns);
    if (crimes.SHOP == crime) {
        ns.singularity.commitCrime(crime, bool.FOCUS);
        while (Math.ceil(player.karma()) > threshold) {
            await ns.sleep(time);
        }
        ns.singularity.stopAction();
        assert(Math.ceil(player.karma()) < 0);
        assert(Math.ceil(player.karma()) <= threshold);
        return;
    }
    // Homicide.
    assert(crimes.KILL == crime);
    assert(nkill > 0);
    ns.singularity.commitCrime(crime, bool.FOCUS);
    while (
        (Math.ceil(player.karma()) > threshold)
            || (player.nkill() < nkill)
    ) {
        await ns.sleep(time);
    }
    assert(Math.ceil(player.karma()) < 0);
    assert(Math.ceil(player.karma()) <= threshold);
    assert(player.nkill() >= nkill);
}
