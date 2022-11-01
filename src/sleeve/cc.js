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
import { cc_t } from "/lib/constant/sleeve.js";
import { wait_t } from "/lib/constant/time.js";
import { log } from "/lib/io.js";
import { Player } from "/lib/player.js";
import { has_sleeve_api } from "/lib/source.js";
import { Sleeve } from "/lib/sleeve/cc.js";
import { assert } from "/lib/util.js";

/**
 * Purchase Augmentations and install them on our sleeves.
 *
 * @param ns The Netscript API.
 */
function buy_augmentation(ns) {
    const player = new Player(ns);
    const sleeve = new Sleeve(ns);
    sleeve.all().forEach((i) => {
        const [name, cost] = sleeve.cheapest_augment(i);
        if (player.money() > cc_t.COST_MULT * cost) {
            sleeve.buy_augment(i, name);
        }
    });
}

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
 * Retrain the combat stats of our sleeves.
 *
 * @param ns The Netscript API.
 */
async function retrain(ns) {
    // Train Dexterity and Agility by shoplift.
    const sleeve = new Sleeve(ns);
    let trainee = sleeve.all().filter((i) => !sleeve.has_shoplift_threshold(i));
    sleeve.shoplift(trainee);
    while (!sleeve.graduate_shoplift(trainee)) {
        await ns.sleep(wait_t.SECOND);
    }
    // Train combat stats by mugging people.
    trainee = sleeve.all().filter((i) => !sleeve.has_mug_threshold(i));
    sleeve.mug(trainee);
    while (!sleeve.graduate_mug(trainee)) {
        await ns.sleep(wait_t.SECOND);
    }
    sleeve.homicide(sleeve.all());
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
 * Manage our sleeves via an update loop.
 *
 * @param ns The Netscript API.
 */
async function update(ns) {
    buy_augmentation(ns);
    await retrain(ns);
    await commit_crime(ns, crimes.KILL, 10 * wait_t.MINUTE);
    await synchronize(ns, wait_t.MINUTE);
}

/**
 * Mange our sleeves.
 *
 * Usage: run sleeve/cc.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Less verbose log.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Sanity check.
    if (!has_sleeve_api(ns)) {
        log(ns, "No access to Sleeve API", colour.RED);
        return;
    }
    // The update loop.
    for (;;) {
        await update(ns);
    }
}