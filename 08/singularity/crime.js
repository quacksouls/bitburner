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

import { crimes, home } from "/lib/constant/misc.js";
import { greatest_chance } from "/lib/singularity/crime.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Choose which crime to commit.  We want to commit the crime that has the
 * highest chance of success.  If there are multiple crimes with the same
 * highest chance of success, choose the crime that takes the shortest amount
 * of time to complete.  In case there are multiple crimes that have the same
 * highest chance of success, and takes the same amount of time, choose a
 * crime that has the highest reward.
 *
 * @param ns The Netscript API.
 * @return A string representing the name of a crime.
 */
function choose_crime(ns) {
    const exclude = new Set(["mug someone", "shoplift"]);
    let crime = crimes.filter(c => !exclude.has(c));
    crime = greatest_chance(ns, crime);
    crime = lowest_time(ns, crime);
    return highest_reward(ns, crime);
}

/**
 * Commit a crime to earn some income.
 *
 * @param ns The Netscript API.
 * @param threshold Continue committing crimes as long as our money is less
 *     than this amount.
 */
async function commit_crime(ns, threshold) {
    assert(threshold > 0);
    const t = new Time();
    const time = t.second();
    const crime = choose_crime(ns);
    const focus = true;
    ns.singularity.commitCrime(crime, focus);
    while (ns.getServerMoneyAvailable(home) < threshold) {
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}

/**
 * Choose a crime that results in the highest reward.
 *
 * @param ns The Netscript API.
 * @param crime An array of crime names.
 * @return The name of a crime that results in the highest reward.
 */
function highest_reward(ns, crime) {
    // Sanity checks.
    assert(crime.length > 0);
    if (1 == crime.length) {
        return crime[0];
    }
    // Determine a crime that results in the highest reward.
    let max_reward = 0;
    let max_crime = "";
    for (const c of crime) {
        const stat = ns.singularity.getCrimeStats(c);
        if (max_reward < stat.money) {
            max_reward = stat.money;
            max_crime = c;
        }
    }
    assert(max_crime.length > 0);
    return max_crime;
}

/**
 * Choose a crime that requires the lowest amount of time to complete.
 *
 * @param ns The Netscript API.
 * @param crime An array of crime names.
 * @return An array of crime names.  If the array has multiple elements, then
 *     all crimes in the array require the same amount of time to complete.
 */
function lowest_time(ns, crime) {
    // Sanity checks.
    assert(crime.length > 0);
    if (1 == crime.length) {
        return crime;
    }
    // Determine which crimes require the least amount of time to complete.
    const time = new Map();
    let min = Infinity;
    for (const c of crime) {
        const stat = ns.singularity.getCrimeStats(c);
        const t = stat.time;
        if (min > t) {
            min = t;
        }
        if (time.has(t)) {
            const crime_name = time.get(t);
            crime_name.push(c);
            time.set(t, crime_name);
            continue;
        }
        const crime_name = [c];
        time.set(t, crime_name);
    }
    return time.get(min);
}

/**
 * Shoplift a few times to raise our combat stats.
 *
 * @param ns The Netscript API.
 */
async function shoplift(ns) {
    const crime = "shoplift";
    const stat = ns.singularity.getCrimeStats(crime);
    // We want to shoplift this many times.
    const max = 20;
    const time = max * stat.time;
    const focus = true;
    ns.singularity.commitCrime(crime, focus);
    await ns.sleep(time);
    ns.singularity.stopAction();
}

/**
 * Commit various crimes to supplement our income.  Early in the game when our
 * funds are limited, crimes can be a source of income to help us
 * purchase/upgrade our Hacknet farm or purchase various servers with small
 * amounts of RAM.  The script accepts a command line argument:
 *
 * (1) threshold := As long as our income is less than this threshold, continue
 *     to commit crimes to raise our income.
 *
 * Assume that our home server has 32GB RAM.  Try to keep the RAM cost of this
 * script as low as possible.  Do not add anything to the script unless
 * absolutely necessary.
 *
 * Usage: run singularity/crime.js [threshold]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Sanity checks.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    const threshold = Math.floor(ns.args[0]);
    assert(threshold > 0);
    // Commit crimes as long as our funds is less than the given threshold.
    await shoplift(ns);
    await commit_crime(ns, threshold);
}
