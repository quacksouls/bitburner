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

import { all_crimes, home } from "/lib/constant.js";
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
    const crimes = all_crimes().filter(c => !exclude.has(c));
    let crime = greatest_chance(ns, crimes);
    crime = lowest_time(ns, crime);
    return highest_reward(ns, crime);
}

/**
 * Commit a crime to earn some income.
 *
 * @param ns The Netscript API.
 */
async function commit_crime(ns) {
    const crime = choose_crime(ns);
    const t = new Time();
    const time = t.second();
    ns.singularity.commitCrime(crime);
    while (ns.singularity.isBusy()) {
        await ns.sleep(time);
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
 * @param threshold Raise our money to at least this threshold.
 */
async function shoplift(ns, threshold) {
    const max = 20;
    const t = new Time();
    const time = t.second();
    for (let i = 0; i < max; i++) {
        ns.singularity.commitCrime("shoplift");
        while (ns.singularity.isBusy()) {
            await ns.sleep(time);
        }
        const money = ns.getServerMoneyAvailable(home);
        if (money >= threshold) {
            return;
        }
    }
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
 * Usage: run singularity/crime.js [threshold]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    ns.disableLog("sleep");
    const threshold = Math.floor(ns.args[0]);
    assert(threshold > 0);
    // Commit crimes as long as our funds is less than the given threshold.
    await shoplift(ns, threshold);
    const t = new Time();
    const time = t.second();
    while (ns.getServerMoneyAvailable(home) < threshold) {
        await commit_crime(ns);
        await ns.sleep(time);
    }
}
