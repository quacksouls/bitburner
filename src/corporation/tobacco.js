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
import { cities } from "/lib/constant/location.js";
import { wait_t } from "/lib/constant/time.js";
import { Corporation } from "/lib/corporation/corp.js";
import { expand_city, new_hire, to_number } from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { has_corporation_api } from "/lib/source.js";
import { assert } from "/lib/util.js";

/**
 * Hire a crop of employees for our Tobacco division.
 *
 * @param ns The Netscript API.
 * @param n A string representing the hiring stage.  If it is stage 1 of hiring,
 *     pass in the word "one", and so on.
 */
async function hire(ns, n) {
    log(ns, `Round ${to_number(n)} of hiring`);
    const div = corp.industry.TOBACCO;
    while (is_short_staffed(ns, n)) {
        for (const ct of cities.all) {
            const org = new Corporation(ns);
            const obj = corp_t.tobacco[ct].hire.stage[n];
            if (org.num_business(div, ct) < obj.BUSINESS) {
                await new_hire(ns, div, ct, corp.job.BUSINESS);
                continue;
            }
            if (org.num_engineer(div, ct) < obj.ENGINEER) {
                await new_hire(ns, div, ct, corp.job.ENGINEER);
                continue;
            }
            if (org.num_management(div, ct) < obj.MANAGEMENT) {
                await new_hire(ns, div, ct, corp.job.MANAGEMENT);
                continue;
            }
            if (org.num_operations(div, ct) < obj.OPERATIONS) {
                await new_hire(ns, div, ct, corp.job.OPERATIONS);
                continue;
            }
            if (org.num_rnd(div, ct) < obj.RND) {
                await new_hire(ns, div, ct, corp.job.RND);
                continue;
            }
            if (org.num_training(div, ct) < obj.TRAIN) {
                await new_hire(ns, div, ct, corp.job.TRAIN);
                continue;
            }
            if (org.num_idle(div, ct) < obj.IDLE) {
                await new_hire(ns, div, ct, corp.job.IDLE);
                continue;
            }
            await ns.sleep(wait_t.SECOND);
        }
    }
}

/**
 * Whether an office of our Tobacco division is short-staffed.
 *
 * @param ns The Netscript API.
 * @param n A string representing the hiring stage.  If it is stage 1 of hiring,
 *     pass in the word "one", and so on.
 * @return True if the given office is short-staffed; false otherwise.
 *
 */
function is_short_staffed(ns, n) {
    const org = new Corporation(ns);
    const div = corp.industry.TOBACCO;
    for (const ct of cities.all) {
        const obj = corp_t.tobacco[ct].hire.stage[n];
        if (
            org.num_business(div, ct) < obj.BUSINESS
            || org.num_engineer(div, ct) < obj.ENGINEER
            || org.num_management(div, ct) < obj.MANAGEMENT
            || org.num_operations(div, ct) < obj.OPERATIONS
            || org.num_rnd(div, ct) < obj.RND
            || org.num_training(div, ct) < obj.TRAIN
            || org.num_idle(div, ct) < obj.IDLE
        ) {
            return true;
        }
    }
    return false;
}

/**
 * Setup our Tobacco division.
 *
 * @param ns The Netscript API.
 */
function setup_division(ns) {
    const org = new Corporation(ns);
    const ind = corp.industry.TOBACCO;
    if (org.has_division(ind)) {
        return;
    }
    org.expand_industry(ind);
    log(ns, `Created new division: ${ind}`);
}

/**
 * Branch out into the Tobacco industry and develop a product.
 *
 * Usage: run corporation/tobacco.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("sleep");
    // Sanity checks.
    const org = new Corporation(ns);
    assert(has_corporation_api(ns));
    assert(org.has_corp(ns));
    assert(org.has_office_warehouse_api(ns));
    // Create and manage our Tobacco division.
    setup_division(ns);
    const div = corp.industry.TOBACCO;
    const new_office = await expand_city(ns, div);
    log(ns, `${div}: expanded to these cities: ${new_office.join(", ")}`);
    await hire(ns, "one");
}
