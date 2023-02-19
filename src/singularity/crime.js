/**
 * Copyright (C) 2022--2023 Duck McSouls
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

import { bool } from "/quack/lib/constant/bool.js";
import { crimes, crimes_t } from "/quack/lib/constant/crime.js";
import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";
import { assert } from "/quack/lib/util.js";

/**
 * Commit some other crime to earn some income.  We also want to lower our
 * karma so that we can create a gang at some later time.
 *
 * @param ns The Netscript API.
 * @param threshold Continue committing crimes as long as our money is less
 *     than this amount.
 */
async function commit_other_crime(ns, threshold) {
    assert(threshold > 0);
    log(
        ns,
        `Commit homicide to raise money to ${ns.nFormat(threshold, "$0,0.00a")}`
    );
    ns.singularity.commitCrime(crimes.KILL, bool.FOCUS);
    while (ns.getServerMoneyAvailable(home) < threshold) {
        await ns.sleep(wait_t.SECOND);
    }
    ns.singularity.stopAction();
}

/**
 * Whether our combat stats are at least a given threshold.
 *
 * @param ns The Netscript API.
 * @return True if our combat stats are each at least crimes_t.MUG;
 *     false otherwise.
 */
function has_mug_threshold(ns) {
    const stat = ns.getPlayer().skills;
    return (
        stat.agility >= crimes_t.MUG
        && stat.defense >= crimes_t.MUG
        && stat.dexterity >= crimes_t.MUG
        && stat.strength >= crimes_t.MUG
    );
}

/**
 * Whether our Dexterity and Agility stats are at least a given threshold.
 *
 * @param ns The Netscript API.
 * @return True if our Dexterity and Agility stats are each at least
 *   crimes_t.SHOP; false otherwise.
 */
function has_shoplift_threshold(ns) {
    const stat = ns.getPlayer().skills;
    return stat.agility >= crimes_t.SHOP && stat.dexterity >= crimes_t.SHOP;
}

/**
 * Mug someone a few times to raise all our combat stats, i.e. Strength,
 * Defense, Dexterity, Agility.
 *
 * @param ns The Netscript API.
 */
async function mug_someone(ns) {
    log(ns, "Mug someone to raise money and combat stats");
    const stat = ns.singularity.getCrimeStats(crimes.MUG);
    const time = crimes_t.n * stat.time;
    ns.singularity.commitCrime(crimes.MUG, bool.FOCUS);
    if (!has_mug_threshold(ns)) {
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}

/**
 * Shoplift a few times to raise our Dexterity and Agility stats.
 *
 * @param ns The Netscript API.
 */
async function shoplift(ns) {
    log(ns, "Shoplift to raise money, and Dexterity and Agility stats");
    const stat = ns.singularity.getCrimeStats(crimes.SHOP);
    const time = crimes_t.n * stat.time;
    ns.singularity.commitCrime(crimes.SHOP, bool.FOCUS);
    if (!has_shoplift_threshold(ns)) {
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}

/**
 * Commit various crimes to supplement our income.  Early in the game when our
 * funds are limited, crimes can be a source of income to help us
 * purchase/upgrade our Hacknet farm or purchase various servers with small
 * amounts of RAM.  Committing crimes is also the best way to lower our karma.
 * If we have already destroyed at least BN2.1, then we can form a gang in
 * other BitNodes.  However, in BitNodes other than BN2.x we must decrease our
 * karma to -54,000 or lower as a pre-requisite for creating a gang.  This
 * constant is taken from the file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/Constants.ts
 *
 * The script accepts a command line argument:
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
    await mug_someone(ns);
    await commit_other_crime(ns, threshold);
}
