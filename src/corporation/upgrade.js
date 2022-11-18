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

import { corp, corp_t } from "/lib/constant/corp.js";
import { Corporation } from "/lib/corporation/corp.js";
import { Cutil } from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { assert } from "/lib/util.js";

/**
 * Round 1 of miscellaneous upgrade.  Level up various upgrades by 1 level.
 *
 * @param ns The Netscript API.
 */
function round_one_upgrade(ns) {
    const lvl = corp_t.upgrade.round.one.LEVEL;
    const org = new Corporation(ns);
    if (org.level(corp.upgrade.FACTORY) < lvl) {
        org.level_upgrade(corp.upgrade.FACTORY);
    }
    if (org.level(corp.upgrade.STORAGE) < lvl) {
        org.level_upgrade(corp.upgrade.STORAGE);
    }
}

/**
 * Round 1 of miscellaneous upgrades.  Level up various upgrades to a desired
 * level.
 *
 * @param ns The Netscript API.
 */
async function round_one(ns) {
    const upg = [corp.upgrade.FACTORY, corp.upgrade.STORAGE];
    log(ns, `Level up these upgrades: ${upg.join(", ")}`);
    const lvl = corp_t.upgrade.round.one.LEVEL;
    for (;;) {
        const org = new Corporation(ns);
        if (
            org.level(corp.upgrade.FACTORY) >= lvl
            && org.level(corp.upgrade.STORAGE) >= lvl
        ) {
            break;
        }
        round_one_upgrade(ns);
        await ns.sleep(corp_t.TICK);
    }
    const org = new Corporation(ns);
    const lvl_factory = org.level(corp.upgrade.FACTORY);
    const lvl_storage = org.level(corp.upgrade.STORAGE);
    log(ns, `Upgraded ${corp.upgrade.FACTORY} to level ${lvl_factory}`);
    log(ns, `Upgraded ${corp.upgrade.STORAGE} to level ${lvl_storage}`);
}

/**
 * Miscellaneous upgrades.  This script accepts a command line argument, i.e. a
 * number representing the upgrade round.  This round number corresponds to the
 * number of times we have accepted investment money.  Pass in the round number
 * as a word.  For example, if it is round 1, then pass in the string "one".
 *
 * Usage: corporation/upgrade.js [roundNumber]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Sanity checks.
    assert(ns.args.length === 1);
    const round_n = ns.args[0];
    assert(Cutil.is_valid_round(round_n));
    // Level up various upgrades.
    if (round_n === "one") {
        await round_one(ns);
    }
}
