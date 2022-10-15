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

import { bool } from "/lib/constant/bool.js";
import { crimes } from "/lib/constant/crime.js";
import { wait_t } from "/lib/constant/time.js";
import { assert } from "/lib/util.js";

/**
 * Commit a crime for a given amount of time.
 *
 * @param ns The Netscript API.
 * @param crime A string representing the name of a crime.  We want to commit
 *     this crime.
 * @param howlong The amount of time in milliseconds.  We want to commit the
 *     given crime for this amount of time.
 */
async function commit_crime(ns, crime, howlong) {
    // Sanity checks.
    assert(is_valid_crime(crime));
    assert(howlong > 0);
    // Commit the given crime.
    const end_time = Date.now() + howlong;
    ns.singularity.commitCrime(crime, bool.FOCUS);
    while (Date.now() < end_time) {
        await ns.sleep(wait_t.MILLISECOND);
    }
    ns.singularity.stopAction();
}

/**
 * Whether the given crime is valid.
 *
 * @param crime A string representing the name of a crime.
 * @return true if the given crime is valid; false otherwise.
 */
function is_valid_crime(crime) {
    return Object.values(crimes).includes(crime);
}

/**
 * The player's karma.  This is an Easter egg, buried in the source code of the
 * game.  Refer to this file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/NetscriptFunctions/Extra.ts
 *
 * @param ns The Netscript API.
 */
function karma(ns) {
    return ns.heart.break();
}

/**
 * Information on how to use this script.
 *
 * @param ns The Netscript API.
 */
function usage(ns) {
    const msg = "Usage: run test/karma/crime.js [crime]\n\n"
        + "crime -- (string) The name of a crime.";
    ns.tprint(msg);
}

/**
 * Commit a crime for a period of time, currently default to 24 hours.  Then
 * calculate the amount of negative karma earned per minute.  This script
 * accepts a command line argument.
 *
 * Usage: run test/karma/crime.js [crime]
 * Example: run test/karma/crime.js "shoplift"
 */
export async function main(ns) {
    // Sanity check.
    if (ns.args.length !== 1) {
        usage(ns);
        return;
    }
    // Commit the given crime.
    const crime = ns.args[0];
    const minute = 60;
    const n = 24;
    const howlong = n * wait_t.HOUR;
    const karma_start = karma(ns);
    await commit_crime(ns, crime, howlong);
    const karma_end = karma(ns);
    const karma_earned = karma_end - karma_start;
    const kpm = karma_earned / (n * minute);
    ns.tprint(`Crime: ${crime}`);
    ns.tprint(`Duration: ${n} hours`);
    ns.tprint(`Total karma: ${karma_earned}`);
    ns.tprint(`Karma per minute: ${kpm}`);
}
