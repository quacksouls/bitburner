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

import { corp_t } from "/lib/constant/corp.js";
import { cities } from "/lib/constant/location.js";
import { Office } from "/lib/corporation/office.js";
import { Cutil } from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { assert } from "/lib/util.js";

/**
 * Hire an employee for an office.  We want to hire an employee to fill a
 * particular role.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param ct A string representing the name of a city.
 * @param role We want to hire for this role.
 */
async function new_hire(ns, div, ct, role) {
    const howmany = 1; // How many times to upgrade.
    const office = new Office(ns);
    if (Cutil.is_at_capacity(ns, div, ct)) {
        while (!office.upgrade(div, ct, howmany)) {
            await ns.sleep(corp_t.TICK);
        }
    }
    while (!office.new_hire(div, ct, role)) {
        await ns.sleep(corp_t.TICK);
    }
}

/**
 * A round of hiring.  We want to hire 1 employee for each office, in a
 * particular role.  We want to fill the following positions:
 *
 * (1) Operations
 * (2) Engineer
 * (3) Business
 * (4) Management
 *
 * @param ns The Netscript API.
 * @param n Which stage of hiring is this?  This is not the same as the
 *     investment round.  Must be a word representing the hiring round.  For
 *     example, if this is stage 1 of hiring, then pass in "one".  If it is
 *     stage 2 of hiring, then pass in "two", and so on.
 */
async function round_one_hire(ns, n) {
    assert(n !== "");
    log(ns, `Stage ${Cutil.to_number(n)} of hiring`);
    const office = new Office(ns);
    const current = corp_t.hire.stage[n].NOW;
    const role = corp_t.hire.stage[n].ROLE;
    for (const div of Cutil.all_divisions(ns)) {
        for (const ct of cities.all) {
            // Sanity check the current number of employees in the given role.
            switch (role) {
                case "Operations":
                    if (office.num_operations(div, ct) > current) {
                        continue;
                    }
                    break;
                case "Engineer":
                    if (office.num_engineer(div, ct) > current) {
                        continue;
                    }
                    break;
                case "Business":
                    if (office.num_business(div, ct) > current) {
                        continue;
                    }
                    break;
                case "Management":
                    if (office.num_management(div, ct) > current) {
                        continue;
                    }
                    break;
                default:
                    // Should never reach here.
                    assert(false);
            }
            // Hire an employee for the role.
            await new_hire(ns, div, ct, role);
            const prefix = `${div}: ${ct}`;
            const msg = `hired 1 employee and assigned to ${role}`;
            log(ns, `${prefix}: ${msg}`);
        }
    }
}

/**
 * The first round of hiring after accepting the first investment offer.
 *
 * @param ns The Netscript API.
 */
async function round_one(ns) {
    const stage = ["one", "two", "three", "four", "five", "six"];
    for (const s of stage) {
        await round_one_hire(ns, s);
        await ns.sleep(corp_t.TICK);
    }
}

/**
 * A round of hiring.  This script accepts a command line argument, i.e. a
 * number representing the hiring stage.  This hiring stage number, or round
 * number, corresponds to the number of times we have accepted investment money.
 * Pass in the round number as a word.  For example, if it is round 1, then pass
 * in the string "one".
 *
 * Usage: corporation/hire.js [roundNumber]
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
    // Hire new employees.
    if (round_n === "one") {
        await round_one(ns);
    }
}
