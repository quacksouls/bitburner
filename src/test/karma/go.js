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

import { MyArray } from "/lib/array.js";
import { bool } from "/lib/constant/bool.js";
import { crimes } from "/lib/constant/crime.js";
import { gang_t } from "/lib/constant/gang.js";
import { base } from "/lib/constant/misc.js";
import { cc_t } from "/lib/constant/sleeve.js";
import { wait_t } from "/lib/constant/time.js";
import { has_sleeve_api } from "/lib/source.js";
import { assert, to_minute, to_second } from "/lib/util.js";

/**
 * The gain in each stat.
 *
 * @param start An object following the format of the function player_stat().
 *     Values of various stats before some action.
 * @param end An object following the format of the function player_stat().
 *     Values of various stats after some action.
 * @param d The denominator.  Each gained stat is divided by this number to
 *     result in an average.  For example, if d represents the number of
 *     minutes, then the result means the gain per minute.
 * @return An object following the format of the function player_stat().
 *     Gained values of various stats.
 */
function gained_stats(start, end, d) {
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
 * The player's current karma value.
 *
 * @param ns The Netscript API.
 * @return Our current karma.
 */
function karma(ns) {
    return ns.heart.break();
}

/**
 * Commit homicide to lower karma.
 *
 * @param ns The Netscript API.
 * @param nsleeve The number of sleeves to use.
 */
async function lower_karma(ns, nsleeve) {
    const time = 500 * wait_t.MILLISECOND;
    ns.singularity.commitCrime(crimes.KILL, bool.FOCUS);
    sleeves_commit_crimes(ns, nsleeve);
    while (karma(ns) > gang_t.KARMA) {
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
    sleeves_idle(ns, nsleeve);
}

/**
 * Various stats of the player.
 *
 * @param ns The Netscript API.
 * @return An object as follows:
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
 * Various sanity checks on the number of sleeves to use.
 *
 * @param ns The Netscript API.
 * @param nsleeve The number of sleeves to use.
 */
function sanity_check(ns, nsleeve) {
    assert(nsleeve >= 0 && nsleeve <= cc_t.MAX_SLEEVE);
    if (nsleeve === 0) {
        assert(!has_sleeve_api(ns));
    } else {
        assert(has_sleeve_api(ns));
        assert(nsleeve === ns.sleeve.getNumSleeves());
    }
}

/**
 * Assign all sleeves to commit homicide.
 *
 * @param ns The Netscript API.
 * @param nsleeve The number of sleeves to use.
 */
function sleeves_commit_crimes(ns, nsleeve) {
    if (nsleeve === 0) {
        return;
    }
    const homicide = (idx) => ns.sleeve.setToCommitCrime(idx, crimes.KILL);
    MyArray.sequence(nsleeve).forEach(homicide);
}

/**
 * Assign all sleeves to the idle state.
 *
 * @param ns The Netscript API.
 * @param nsleeve The number of sleeves to use.
 */
function sleeves_idle(ns, nsleeve) {
    if (nsleeve === 0) {
        return;
    }
    const idle = (idx) => ns.sleeve.setToSynchronize(idx);
    MyArray.sequence(nsleeve).forEach(idle);
}

/**
 * How long does it take to lower karma to -54,000?  Lower karma without using
 * sleeves.  This script accepts a command line argument:
 *
 * (1) nSleeve := The number of sleeves to use.  We can use at most 8 sleeves.
 *
 * Usage: run test/karma/go.js [nSleeve]
 * Example: run test/karma/go.js 3
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Sanity checks.
    assert(ns.args.length > 0);
    const nsleeve = parseInt(ns.args[0], base.DECIMAL);
    sanity_check(ns, nsleeve);
    // Data before commiting crime.
    const start = player_stat(ns);
    const time_start = Date.now();
    // Commit crime.
    await lower_karma(ns, nsleeve);
    // Data after committing crime.
    const duration = Date.now() - time_start;
    const time_fmt = ns.nFormat(to_second(duration), "00:00:00");
    const end = player_stat(ns);
    const gain = gained_stats(start, end, to_minute(duration));
    ns.tprint(`Crime: ${crimes.KILL}`);
    ns.tprint(`Duration: ${time_fmt}`);
    ns.tprint("Stat gain per minute.");
    ns.tprint(`Agility: ${gain.agility}`);
    ns.tprint(`Defense: ${gain.defense}`);
    ns.tprint(`Dexterity: ${gain.dexterity}`);
    ns.tprint(`Karma: ${gain.karma}`);
    ns.tprint(`Money: ${gain.money}`);
    ns.tprint(`Strength: ${gain.strength}`);
}
