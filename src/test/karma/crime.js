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
 * The gain in each stat.
 *
 * @param ns The Netscript API.
 * @param start An object following the format of the function player_stat().  Values of various stats before some action.
 * @param end An object following the format of the function player_stat().  Values of various stats after some action.
 * @param d The divisor.  Each gained stat is divided by this number to result in an average.  For example, if d
 *     represents the number of minutes, then the result means the gain per minute.
 * @return An object following the format of the function player_stat().  Gained values of various stats.
 */
function gained_stats(ns, start, end, d) {
    const denom = Math.floor(d);
    assert(denom > 0);
    return {
        agility: (end.agility - start.agility) / denom,
        defense: (end.defense - start.defense) / denom,
        dexterity: (end.dexterity - start.dexterity) / denom,
        karma: (end.karma - start.karma) / denom,
        money: (end.money - start.money) / denom,
        strength: (end.strength - start.strength) / denom,
    };
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
 * Various stats of the player.
 *
 * @param ns The Netscript API.
 * @return An object as follows:
 *
 *     {
 *         agility: // The player's agility.
 *         defense: // The player's defense.
 *         dexterity: // The player's dexterity.
 *         karma: // The player's karma.
 *         money: // The player's money.
 *         strength: // The player's strength.
 *     }
 */
function player_stat(ns) {
    return {
        agility: ns.getPlayer().exp.agility,
        defense: ns.getPlayer().exp.defense,
        dexterity: ns.getPlayer().exp.dexterity,
        karma: karma(ns),
        money: ns.getPlayer().money,
        strength: ns.getPlayer().exp.strength,
    };
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
    // Commit the given crime and calculate the stat gain per minute.
    const crime = ns.args[0];
    const start = player_stat(ns);
    const minute = 60;
    const n = 24;
    const howlong = n * wait_t.HOUR;
    await commit_crime(ns, crime, howlong);
    const end = player_stat(ns);
    const divisor = n * minute;
    const gain = gained_stats(ns, start, end, divisor);
    ns.tprint(`Crime: ${crime}`);
    ns.tprint(`Duration: ${n} hours`);
    ns.tprint("Stat gain per minute.");
    ns.tprint(`Agility: ${gain.agility}`);
    ns.tprint(`Defense: ${gain.defense}`);
    ns.tprint(`Dexterity: ${gain.dexterity}`);
    ns.tprint(`Karma: ${gain.karma}`);
    ns.tprint(`Money: ${gain.money}`);
    ns.tprint(`Strength: ${gain.strength}`);
}
