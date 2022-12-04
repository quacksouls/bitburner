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
import { corp, corp_t, tobacco } from "/lib/constant/corp.js";
import { cities } from "/lib/constant/location.js";
import { wait_t } from "/lib/constant/time.js";
import { Corporation } from "/lib/corporation/corp.js";
import {
    buy_research,
    create_product,
    discontinue_product,
    expand_city,
    finishing_product,
    has_all_research,
    hire,
    hire_advert,
    investment_offer,
    more_unlock_upgrade,
    new_hire,
    sell_product,
    smart_supply,
    to_number,
} from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { has_corporation_api } from "/lib/source.js";
import { assert, exec } from "/lib/util.js";

/**
 * Everything we need to do before taking our corporation to public.
 *
 * @param ns The Netscript API.
 */
async function before_going_public(ns) {
    await more_research(ns);
    const unlock_upg = await more_unlock_upgrade(ns);
    if (unlock_upg.length > 0) {
        const div = corp.industry.TOBACCO;
        log(ns, `${div}: bought unlock upgrade(s): ${unlock_upg.join(", ")}`);
    }
}

/**
 * An enhanced product cycle.  In this cycle, we discontinue the product of
 * lowest rating and develop a new product of higher rating.
 *
 * @param ns The Netscript API.
 * @param n A string representing the product round.  If it is the product in
 *     round 1, pass in the word "one", and so on.
 */
async function enhanced_product_cycle(ns, n) {
    // If we have developed the maximum number of products, then we must
    // discontinue a product to make room for a new product (possibly of higher
    // rating).
    const div = corp.industry.TOBACCO;
    if (has_init_max_products(ns)) {
        const name = discontinue_product(ns, div);
        log(ns, `${div}: discontinued a product: ${name}`);
    }
    await product_cycle(ns, n);
    log(ns, `${div}: waiting for each office to be vivacious`);
    const org = new Corporation(ns);
    await org.vivacious_office();
}

/**
 * Whether we have reached the maximum number of products for our Tobacco
 * division.  The product capacity of the division is assumed to be at the
 * initial level.
 *
 * @param ns The Netscript API.
 * @return True if our Tobacco division has the maximum number of products, at
 *     the initial capacity; false otherwise.
 */
function has_init_max_products(ns) {
    const org = new Corporation(ns);
    const div = corp.industry.TOBACCO;
    return org.all_products(div).length === corp_t.product.INIT_TAU;
}

/**
 * Hire a crop of employees for our Tobacco division.
 *
 * @param ns The Netscript API.
 * @param n A string representing the hiring stage.  If it is stage 1 of hiring,
 *     pass in the word "one", and so on.
 */
async function hire_employees(ns, n) {
    log(ns, `Round ${to_number(n)} of hiring`);
    const div = corp.industry.TOBACCO;
    for (const ct of cities.all) {
        const org = new Corporation(ns);
        const nbusiness = tobacco[ct].hire.stage[n].BUSINESS;
        const nengineer = tobacco[ct].hire.stage[n].ENGINEER;
        const nmanagement = tobacco[ct].hire.stage[n].MANAGEMENT;
        const noperations = tobacco[ct].hire.stage[n].OPERATIONS;
        const nrnd = tobacco[ct].hire.stage[n].RND;
        const ntrain = tobacco[ct].hire.stage[n].TRAIN;
        const nidle = tobacco[ct].hire.stage[n].IDLE;
        for (let i = org.num_business(div, ct); i < nbusiness; i++) {
            await new_hire(ns, div, ct, corp.job.BUSINESS, bool.WAIT);
        }
        for (let i = org.num_engineer(div, ct); i < nengineer; i++) {
            await new_hire(ns, div, ct, corp.job.ENGINEER, bool.WAIT);
        }
        for (let i = org.num_management(div, ct); i < nmanagement; i++) {
            await new_hire(ns, div, ct, corp.job.MANAGEMENT, bool.WAIT);
        }
        for (let i = org.num_operations(div, ct); i < noperations; i++) {
            await new_hire(ns, div, ct, corp.job.OPERATIONS, bool.WAIT);
        }
        for (let i = org.num_rnd(div, ct); i < nrnd; i++) {
            await new_hire(ns, div, ct, corp.job.RND, bool.WAIT);
        }
        for (let i = org.num_training(div, ct); i < ntrain; i++) {
            await new_hire(ns, div, ct, corp.job.TRAIN, bool.WAIT);
        }
        for (let i = org.num_idle(div, ct); i < nidle; i++) {
            await new_hire(ns, div, ct, corp.job.IDLE, bool.WAIT);
        }
    }
}

/**
 * Purchase various other research.
 *
 * @param ns The Netscript API.
 */
async function more_research(ns) {
    const res = [
        // Employee research
        corp.research.BREW,
        corp.research.PARTY,
        corp.research.DRUG,
        corp.research.INJECT,
        corp.research.JUICE,
        corp.research.JOY,
        corp.research.OVERCLOCK,
        corp.research.STIMULATE,
        // Division research
        corp.research.DRONE,
        corp.research.DRONE_ASSEMBLY,
        corp.research.DRONE_TRANSPORT,
        corp.research.ASSEMBLER,
        corp.research.CAPACITY_I,
        corp.research.CAPACITY_II,
        corp.research.FULCRUM,
    ];
    const div = corp.industry.TOBACCO;
    const org = new Corporation(ns);
    for (;;) {
        if (has_all_research(ns, div, res)) {
            return;
        }
        log(ns, `${div}: expand the research unit of each office`);
        await hire(ns, div, bool.NO_WAIT);
        for (const r of res) {
            if (
                !org.has_research(div, r)
                && org.is_research_available(div, r)
            ) {
                if (org.has_enough_research_points(div, r)) {
                    log(ns, `${div}: buying research: ${r}`);
                    await buy_research(ns, div, r);
                }
            }
        }
        await ns.sleep(5 * wait_t.MINUTE);
    }
}

/**
 * The product cycle.  This includes hiring, development, and selling.
 *
 * @param ns The Netscript API.
 * @param n A string representing the product round.  If it is the product in
 *     round 1, pass in the word "one", and so on.
 */
async function product_cycle(ns, n) {
    if (has_init_max_products(ns)) {
        return;
    }
    log(ns, `Round ${to_number(n)} of product development`);
    await hire_employees(ns, n);
    const div = corp.industry.TOBACCO;
    const name = create_product(ns, div);
    log(ns, `${div}: creating product: ${name}`);
    await upgrade(ns, n);
    log(ns, `${div}: waiting for product to complete: ${name}`);
    await finishing_product(ns, div, name);
    await hire_advert(ns, div);
    log(ns, `${div}: selling product in all cities: ${name}`);
    sell_product(ns, div, name);
    await ns.sleep(corp_t.TICK);
}

/**
 * Purchase various research.
 *
 * @param ns The Netscript API.
 */
async function research(ns) {
    const lab = corp.research.RND_LAB;
    const res = [lab, corp.research.TA_I, corp.research.TA_II];
    const div = corp.industry.TOBACCO;
    const org = new Corporation(ns);
    const has_research = (x) => org.has_research(div, x);
    const city = cities.all.filter((ct) => ct !== tobacco.DEVELOPER_CITY);
    const wait_interval = 10 * wait_t.MINUTE;
    for (;;) {
        // Do we have all the required research yet?
        if (res.every(has_research)) {
            return;
        }
        // Expand the research unit of each city other than the developer city.
        for (const ct of city) {
            await new_hire(ns, div, ct, corp.job.RND, bool.WAIT);
            await ns.sleep(wait_t.MINUTE);
        }
        // We must first buy/setup a research facility.
        if (!org.has_research(div, lab)) {
            if (org.has_enough_research_points(div, lab)) {
                log(ns, `${div}: buying research: ${lab}`);
                await buy_research(ns, div, lab);
            }
            await ns.sleep(wait_interval);
            continue;
        }
        // Next, buy the Market TA research.
        const candidate = res.filter((r) => !org.has_research(div, r));
        for (const r of candidate) {
            if (org.has_enough_research_points(div, r)) {
                log(ns, `${div}: buying research: ${r}`);
                await buy_research(ns, div, r);
            }
        }
        await ns.sleep(wait_interval);
    }
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
 * Levelling up various upgrades.
 *
 * @param ns The Netscript API.
 * @param n A string representing the upgrade round.  If it is round 1 of
 *     upgrade, pass in the word "one", and so on.
 */
async function upgrade(ns, n) {
    const upg = [
        "DreamSense",
        "FocusWires",
        "Neural Accelerators",
        "Speech Processor Implants",
        "Nuoptimal Nootropic Injector Implants",
        "Project Insight",
        "Wilson Analytics",
    ];
    log(ns, `Round ${to_number(n)} of upgrades: ${upg.join(", ")}`);
    const dream_lvl = tobacco.upgrade.round[n].DreamSense;
    const focus_lvl = tobacco.upgrade.round[n].FocusWires;
    const neural_lvl = tobacco.upgrade.round[n]["Neural Accelerators"];
    const speech_lvl = tobacco.upgrade.round[n]["Speech Processor Implants"];
    // eslint-disable-next-line max-len
    const injector_lvl = tobacco.upgrade.round[n]["Nuoptimal Nootropic Injector Implants"];
    const insight_lvl = tobacco.upgrade.round[n]["Project Insight"];
    const analytic_lvl = tobacco.upgrade.round[n]["Wilson Analytics"];
    const org = new Corporation(ns);
    for (;;) {
        // Have we levelled up enough?
        if (
            org.level(corp.upgrade.DREAM) >= dream_lvl
            && org.level(corp.upgrade.FOCUS) >= focus_lvl
            && org.level(corp.upgrade.NEURAL) >= neural_lvl
            && org.level(corp.upgrade.SPEECH) >= speech_lvl
            && org.level(corp.upgrade.INJECTOR) >= injector_lvl
            && org.level(corp.upgrade.INSIGHT) >= insight_lvl
            && org.level(corp.upgrade.ANALYTIC) >= analytic_lvl
        ) {
            break;
        }
        // Level up various upgrades.
        if (org.level(corp.upgrade.DREAM) < dream_lvl) {
            org.level_upgrade(corp.upgrade.DREAM);
        }
        if (org.level(corp.upgrade.FOCUS) < focus_lvl) {
            org.level_upgrade(corp.upgrade.FOCUS);
        }
        if (org.level(corp.upgrade.NEURAL) < neural_lvl) {
            org.level_upgrade(corp.upgrade.NEURAL);
        }
        if (org.level(corp.upgrade.SPEECH) < speech_lvl) {
            org.level_upgrade(corp.upgrade.SPEECH);
        }
        if (org.level(corp.upgrade.INJECTOR) < injector_lvl) {
            org.level_upgrade(corp.upgrade.INJECTOR);
        }
        if (org.level(corp.upgrade.INSIGHT) < insight_lvl) {
            org.level_upgrade(corp.upgrade.INSIGHT);
        }
        if (org.level(corp.upgrade.ANALYTIC) < analytic_lvl) {
            org.level_upgrade(corp.upgrade.ANALYTIC);
        }
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * Branch out into the Tobacco industry and develop various products.
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
    assert(org.has_corp());
    assert(org.has_office_warehouse_api());
    // Create and manage our Tobacco division.
    setup_division(ns);
    const div = corp.industry.TOBACCO;
    const new_office = await expand_city(ns, div);
    smart_supply(ns);
    if (new_office.length > 0) {
        log(ns, `${div}: expanded to these cities: ${new_office.join(", ")}`);
    }
    await product_cycle(ns, "one");
    await product_cycle(ns, "two");
    await product_cycle(ns, "three");
    await investment_offer(ns, "three");
    await research(ns);
    const round = ["four", "five", "six"];
    for (const n of round) {
        await enhanced_product_cycle(ns, n);
    }
    // Some last minute house keeping.
    await before_going_public(ns);
    exec(ns, "/corporation/janitor.js");
}
