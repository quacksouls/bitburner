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

import { corp, tobacco } from "/lib/constant/corp.js";
import { cities } from "/lib/constant/location.js";
import { wait_t } from "/lib/constant/time.js";
import { Corporation } from "/lib/corporation/corp.js";
import {
    expand_city,
    new_hire,
    smart_supply,
    to_number,
} from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { has_corporation_api } from "/lib/source.js";
import { assert } from "/lib/util.js";

/**
 * Create a product.
 *
 * @param ns The Netscript API.
 * @param n A string representing the creation round.  If it is round 1 of
 *     product development, pass in the word "one", and so on.
 */
function create_product(ns, n) {
    const name = tobacco.product[n].NAME;
    const org = new Corporation(ns);
    const div = corp.industry.TOBACCO;
    if (!org.has_product(div, name)) {
        log(ns, `Creating product ${to_number(n)}: ${name}`);
        org.create_product(
            div,
            tobacco.DEVELOPER_CITY,
            name,
            tobacco.product[n].INVEST_DESIGN,
            tobacco.product[n].INVEST_MARKETING
        );
    }
}

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
    const done = {
        Aevum: false,
        Chongqing: false,
        Ishima: false,
        "New Tokyo": false,
        "Sector-12": false,
        Volhaven: false,
    };
    const is_done = (ct) => done[ct];
    while (!cities.all.every(is_done)) {
        for (const ct of cities.all) {
            if (done[ct]) {
                continue;
            }
            const org = new Corporation(ns);
            const obj = tobacco[ct].hire.stage[n];
            if (org.num_business(div, ct) < obj.BUSINESS) {
                await new_hire(ns, div, ct, corp.job.BUSINESS);
            }
            if (org.num_engineer(div, ct) < obj.ENGINEER) {
                await new_hire(ns, div, ct, corp.job.ENGINEER);
            }
            if (org.num_management(div, ct) < obj.MANAGEMENT) {
                await new_hire(ns, div, ct, corp.job.MANAGEMENT);
            }
            if (org.num_operations(div, ct) < obj.OPERATIONS) {
                await new_hire(ns, div, ct, corp.job.OPERATIONS);
            }
            if (org.num_rnd(div, ct) < obj.RND) {
                await new_hire(ns, div, ct, corp.job.RND);
            }
            if (org.num_training(div, ct) < obj.TRAIN) {
                await new_hire(ns, div, ct, corp.job.TRAIN);
            }
            if (org.num_idle(div, ct) < obj.IDLE) {
                await new_hire(ns, div, ct, corp.job.IDLE);
            }
            done[ct] = !is_short_staffed(ns, ct, n);
            await ns.sleep(wait_t.SECOND);
        }
    }
}

/**
 * Whether an office of our Tobacco division is short-staffed.
 *
 * @param ns The Netscript API.
 * @param ct A string representing the name of a city.
 * @param n A string representing the hiring stage.  If it is stage 1 of hiring,
 *     pass in the word "one", and so on.
 * @return True if our Tobacco office in the given city is short-staffed;
 *     false otherwise.
 */
function is_short_staffed(ns, ct, n) {
    const org = new Corporation(ns);
    const div = corp.industry.TOBACCO;
    const obj = tobacco[ct].hire.stage[n];
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
    return false;
}

/**
 * Setup our Tobacco division.
 *
 * @param ns The Netscript API.
 */
function setup_division(ns) {
    const org = new Corporation(ns);
    const div = corp.industry.TOBACCO;
    if (org.has_division(div)) {
        return;
    }
    org.expand_industry(div);
    log(ns, `Created new division: ${div}`);
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
    smart_supply(ns);
    log(ns, `${div}: expanded to these cities: ${new_office.join(", ")}`);
    await hire(ns, "one");
    create_product(ns, "one");
}
