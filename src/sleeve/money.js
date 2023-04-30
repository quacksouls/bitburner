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

import { crimes } from "/quack/lib/constant/crime.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { error, log } from "/quack/lib/io.js";
import { has_sleeve_api } from "/quack/lib/source.js";
import {
    all_sleeves,
    has_mug_threshold,
    has_shoplift_threshold,
} from "/quack/lib/sleeve/util.js";

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
 * @param {NS} ns The Netscript API.
 */
async function commit_crimes(ns) {
    // Shoplift.
    log(ns, crimes.SHOP);
    all_sleeves(ns).forEach((i) => ns.sleeve.setToCommitCrime(i, crimes.SHOP));
    while (!has_shoplift_threshold(ns)) {
        await ns.sleep(wait_t.SECOND);
    }

    // Mugging people.
    log(ns, crimes.MUG);
    all_sleeves(ns).forEach((i) => ns.sleeve.setToCommitCrime(i, crimes.MUG));
    while (!has_mug_threshold(ns)) {
        await ns.sleep(wait_t.SECOND);
    }

    // Homicide.
    log(ns, crimes.KILL);
    all_sleeves(ns).forEach((i) => ns.sleeve.setToCommitCrime(i, crimes.KILL));
}

/**
 * Assign sleeves to commit crimes as a means of earning some money in the early
 * stages of a BitNode.
 *
 * Usage: run quack/sleeve/money.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    ns.disableLog("sleep");
    if (!has_sleeve_api(ns)) {
        error(ns, "No access to Sleeve API");
        return;
    }
    log(ns, "Sleeves commit crimes to raise money");
    await commit_crimes(ns);
}
