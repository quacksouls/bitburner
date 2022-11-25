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
 * Wait for a product to be 100% complete.
 *
 * @param ns The Netscript API.
 * @param n A string representing the product round.  If it is the product in
 *     round 1, pass in the word "one", and so on.
 */
async function finishing_product(ns, n) {
    const div = corp.industry.TOBACCO;
    const name = tobacco.product[n].NAME;
    log(ns, `${div}: waiting for product to complete: ${name}`);
    const org = new Corporation(ns);
    while (!org.is_product_complete(div, name)) {
        await ns.sleep(wait_t.SECOND);
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
            await new_hire(ns, div, ct, corp.job.BUSINESS);
        }
        for (let i = org.num_engineer(div, ct); i < nengineer; i++) {
            await new_hire(ns, div, ct, corp.job.ENGINEER);
        }
        for (let i = org.num_management(div, ct); i < nmanagement; i++) {
            await new_hire(ns, div, ct, corp.job.MANAGEMENT);
        }
        for (let i = org.num_operations(div, ct); i < noperations; i++) {
            await new_hire(ns, div, ct, corp.job.OPERATIONS);
        }
        for (let i = org.num_rnd(div, ct); i < nrnd; i++) {
            await new_hire(ns, div, ct, corp.job.RND);
        }
        for (let i = org.num_training(div, ct); i < ntrain; i++) {
            await new_hire(ns, div, ct, corp.job.TRAIN);
        }
        for (let i = org.num_idle(div, ct); i < nidle; i++) {
            await new_hire(ns, div, ct, corp.job.IDLE);
        }
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
    log(ns, `Round ${to_number(n)} of product development`);
    await hire(ns, n);
    create_product(ns, n);
    await upgrade(ns, n);
    await finishing_product(ns, n);
    sell_product(ns, n);
}

/**
 * Sell a product we have developed in our Tobacco division.
 *
 * @param ns The Netscript API.
 * @param n A string representing the product round.  If it is the product in
 *     round 1, pass in the word "one", and so on.
 */
function sell_product(ns, n) {
    const div = corp.industry.TOBACCO;
    const name = tobacco.product[n].NAME;
    const org = new Corporation(ns);
    log(ns, `${div}: selling product in all cities: ${name}`);
    cities.all.forEach((ct) => org.product_sell(div, ct, name));
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
    ];
    log(ns, `Round ${to_number(n)} of upgrades: ${upg.join(", ")}`);
    const dream_lvl = tobacco.upgrade.round[n].DreamSense;
    const focus_lvl = tobacco.upgrade.round[n].FocusWires;
    const neural_lvl = tobacco.upgrade.round[n]["Neural Accelerators"];
    const speech_lvl = tobacco.upgrade.round[n]["Speech Processor Implants"];
    // eslint-disable-next-line max-len
    const injector_lvl = tobacco.upgrade.round[n]["Nuoptimal Nootropic Injector Implants"];
    const insight_lvl = tobacco.upgrade.round[n]["Project Insight"];
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
        await ns.sleep(wait_t.SECOND);
    }
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
    if (new_hire.length > 0) {
        log(ns, `${div}: expanded to these cities: ${new_office.join(", ")}`);
    }
    await product_cycle(ns, "one");
    await product_cycle(ns, "two");
    await product_cycle(ns, "three");
}
