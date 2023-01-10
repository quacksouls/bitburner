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
import {
    agriculture, corp, corp_t, tobacco,
} from "/lib/constant/corp.js";
import { io } from "/lib/constant/io.js";
import { cities } from "/lib/constant/location.js";
import { base } from "/lib/constant/misc.js";
import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { Corporation } from "/lib/corporation/corp.js";
import { log } from "/lib/io.js";
import { random_integer } from "/lib/random.js";
import { assert, is_boolean } from "/lib/util.js";

/**
 * Purchase both "Market-TA.I" and "Market-TA.II".
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @return True if we already have both research in the given division or we
 *     have successfully bought both research for the division; false otherwise.
 */
export function buy_market_ta(ns, div) {
    const res = [corp.research.TA_I, corp.research.TA_II];
    const org = new Corporation(ns);
    const has_research = (r) => org.has_research(div, r);
    if (res.every(has_research)) {
        return bool.HAS;
    }
    res.forEach((r) => {
        if (org.has_enough_research_points(div, r)) {
            org.buy_research(div, r);
        }
    });
    return res.every(has_research);
}

/**
 * Purchase a particular research.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division of our corporation.
 * @param name A string representing the name of a research we want to buy.
 */
export async function buy_research(ns, div, name) {
    const org = new Corporation(ns);
    if (org.has_research(div, name)) {
        return;
    }
    while (!org.has_enough_research_points(div, name)) {
        await ns.sleep(wait_t.SECOND);
    }
    while (!org.buy_research(div, name)) {
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * Remove files created by our corporation scripts.
 *
 * @param ns The Netscript API.
 */
export function corp_cleanup(ns) {
    const junk = [corp.AGRI, corp.INVEST, corp.JANI, corp.PREP, corp.TOBA];
    junk.forEach((f) => ns.rm(f, home));
}

/**
 * Create a product for a division.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division of our corporation.
 * @return The name of the product under development.
 */
export function create_product(ns, div) {
    const org = new Corporation(ns);
    assert(org.has_division(div));
    const name = product_name(ns, div);
    assert(!org.has_product(div, name));
    org.create_product(
        div,
        developer_city(ns, div),
        name,
        org.design_investment(),
        org.marketing_investment()
    );
    return name;
}

/**
 * The developer city of a particular division.  This city is responsible for
 * product development.
 *
 * @param div A string representing the name of a division of our corporation.
 * @return The developer city of the given division.
 */
function developer_city(ns, div) {
    const org = new Corporation(ns);
    assert(org.has_division(div));
    switch (div) {
        case corp.industry.TOBACCO:
            return tobacco.DEVELOPER_CITY;
        default:
            // Should never reach here.
            assert(false);
    }
}

/**
 * Discontinue a product.  We choose the product of lowest rating and
 * discontinue that product.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division of our corporation.
 * @return The name of the discontinued product.
 */
export function discontinue_product(ns, div) {
    // Determine the product that has the lowest rating.
    const org = new Corporation(ns);
    let name = "";
    let min_rating = Infinity;
    org.all_products(div).forEach((p) => {
        const rating = org.product_rating(div, p);
        if (min_rating > rating) {
            min_rating = rating;
            name = p;
        }
    });
    // Discontinue the product that has the lowest rating.
    assert(name !== "");
    org.discontinue_product(div, name);
    return name;
}

/**
 * Expand a division by opening offices in other cities.  After opening a new
 * division office, we also purchase a warehouse for that office.
 *
 * @param ns The Netscript API.
 * @param div We want to branch this division into other cities.
 * @return An array of city names, where we have opened new division offices.
 */
export async function expand_city(ns, div) {
    const org = new Corporation(ns);
    const new_office = [];
    for (const ct of cities.all) {
        if (!org.has_division_office(div, ct)) {
            org.expand_city(div, ct);
            while (!org.buy_warehouse(div, ct)) {
                await ns.sleep(wait_t.SECOND);
            }
            new_office.push(ct);
        }
    }
    return new_office;
}

/**
 * Wait for a product to be 100% complete.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param name A string representing the name of a product currently under
 *     development.
 */
export async function finishing_product(ns, div, name) {
    const org = new Corporation(ns);
    while (!org.is_product_complete(div, name)) {
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * Whether a division has all research it needs.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param res An array of names of research we care about.
 * @return True if we have all research available to be purchased;
 *     false otherwise.
 */
export function has_all_research(ns, div, res) {
    assert(res.length > 0);
    const org = new Corporation(ns);
    const available_res = res.filter((r) => org.is_research_available(div, r));
    const has_research = (x) => org.has_research(div, x);
    return available_res.every(has_research);
}

/**
 * Hire a crop of employees for a division.  Use this function when a division
 * is in maintenance mode.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param wait A boolean signifying whether we want to wait to accumulate enough
 *     money to hire employees.  If set to false, then we abort the hiring
 *     process if we do not have sufficient funds to hire an employee.
 */
export async function hire(ns, div, wait) {
    for (const ct of cities.all) {
        const num = hire_increment(div, ct);
        for (const role of Object.values(corp.job)) {
            await hireling(ns, div, ct, num[role], role, wait);
        }
    }
}

/**
 * Hire AdVert.inc to advertise for a division.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 */
export async function hire_advert(ns, div) {
    const org = new Corporation(ns);
    while (!org.hire_advert(div)) {
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * Hire AdVert.inc to advertise for a division, but only do so if it does not
 * cost too much.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 */
export async function hire_advert_frugal(ns, div) {
    const org = new Corporation(ns);
    const max_funds = Math.floor(corp_t.upgrade.COST_MULT * org.profit());
    const cost = Math.ceil(ns.corporation.getHireAdVertCost(div));
    if (cost >= max_funds) {
        return;
    }
    while (!org.hire_advert(div)) {
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * The number of employees to hire for each role in a division.
 *
 * @param div A string representing the name of a division.
 * @param ct A string representing the name of a city.
 * @return An object as follows:
 *     {
 *         Business: Number, // Hire this many for Business role.
 *         Engineer: Number, // Hire this many for Engineer role.
 *         Management: Number, // Hire this many for Management role.
 *         Operations: Number, // Hire this many for Operations role.
 *         "Research & Development": Number, // Hire this many for R&D role.
 *         Training: Number, // Hire this many for Training role.
 *         Unassigned: Number, // Hire this many for Idle role.
 *     }
 */
function hire_increment(div, ct) {
    switch (div) {
        case corp.industry.AGRI:
            return {
                Business: agriculture[ct].hire.stage.n.BUSINESS,
                Engineer: agriculture[ct].hire.stage.n.ENGINEER,
                Management: agriculture[ct].hire.stage.n.MANAGEMENT,
                Operations: agriculture[ct].hire.stage.n.OPERATIONS,
                "Research & Development": agriculture[ct].hire.stage.n.RND,
                Training: agriculture[ct].hire.stage.n.TRAIN,
                Unassigned: agriculture[ct].hire.stage.n.IDLE,
            };
        case corp.industry.TOBACCO:
            return {
                Business: tobacco[ct].hire.stage.n.BUSINESS,
                Engineer: tobacco[ct].hire.stage.n.ENGINEER,
                Management: tobacco[ct].hire.stage.n.MANAGEMENT,
                Operations: tobacco[ct].hire.stage.n.OPERATIONS,
                "Research & Development": tobacco[ct].hire.stage.n.RND,
                Training: tobacco[ct].hire.stage.n.TRAIN,
                Unassigned: tobacco[ct].hire.stage.n.IDLE,
            };
        default:
            // Should never reach here.
            assert(false);
    }
}

/**
 * Hire a bunch of employees for a particular role.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param ct A string representing the name of a city.
 * @param num Hire this many employees.
 * @param job Assign each new employee to this role.
 * @param wait A boolean signifying whether we want to wait to accumulate enough
 *     money to hire an employee.  If set to false, then we abort the hiring
 *     process if we do not have sufficient funds to hire an employee.
 */
async function hireling(ns, div, ct, num, job, wait) {
    assert(num >= 0);
    assert(is_boolean(wait));
    for (let i = 0; i < num; i++) {
        await new_hire(ns, div, ct, job, wait);
    }
}

/**
 * A round of investment offer.
 *
 * @param ns The Netscript API.
 * @param r A string (i.e. word) representing the investment round.  If it is
 *     round 1, pass in the word "one" and so on.
 */
export async function investment_offer(ns, r) {
    // Determine the latest investment round wherein we accepted investment
    // money.  Why not use the attribute below?
    //
    // ns.corporation.getInvestmentOffer().round
    //
    // Corp is rather broken (buggy) at the moment in v2.1.  The value of the
    // above attribute does not seem to persist after you save and quit the
    // game.  Our fix is to use a text file to keep track of the investment
    // round number.
    let latest_round = -1;
    if (ns.fileExists(corp.INVEST)) {
        latest_round = parseInt(ns.read(corp.INVEST), base.DECIMAL);
    } else {
        ns.write(corp.INVEST, "0", io.WRITE);
        latest_round = 0;
    }
    if (to_number(r) !== latest_round + 1) {
        return;
    }
    // Need to wait for our corporation to make a certain amount of profit per
    // second, and have a certain amount of funds.
    log(ns, `Round ${to_number(r)} of investment`);
    const profit_tau = ns.nFormat(corp_t.profit.round[r].N, "$0,0.00a");
    log(ns, `Waiting for sufficient profit: ${profit_tau}/s`);
    const org = new Corporation(ns);
    while (org.profit() < corp_t.profit.round[r].N) {
        await ns.sleep(corp_t.TICK);
    }
    const { funds, shares } = ns.corporation.getInvestmentOffer();
    ns.corporation.acceptInvestmentOffer();
    const fundsf = ns.nFormat(funds, "$0,0.00a");
    const sharesf = ns.nFormat(shares, "0,0.00a");
    log(
        ns,
        `Received ${fundsf} in exchange for ${sharesf} shares of corporation`
    );
    // Keep track of the latest round of investment.
    latest_round++;
    ns.write(corp.INVEST, String(latest_round), io.WRITE);
}

/**
 * Levelling up various upgrades, if it does not cost too much.
 *
 * @param ns The Netscript API.
 * @return An array of the names of the upgrades we have levelled up.  An empty
 *     array if we did not level up any upgrades.
 */
export function level_upgrade(ns) {
    const org = new Corporation(ns);
    const levelled_upg = [];
    for (const upg of Object.values(corp.upgrade)) {
        const max_funds = Math.floor(corp_t.upgrade.COST_MULT * org.profit());
        const cost = Math.ceil(org.upgrade_cost(upg));
        if (cost < max_funds) {
            if (org.level_upgrade(upg)) {
                levelled_upg.push(upg);
            }
        }
    }
    return levelled_upg;
}

/**
 * Purchase various other unlock upgrades.
 *
 * @param ns The Netscript API.
 * @return An array of the names of the unlock upgrades we have purcahsed.  An
 *     empty array if we did not buy any unlock upgrades.
 */
export async function more_unlock_upgrade(ns) {
    const org = new Corporation(ns);
    const unlock_upgrade = [];
    const unlock = [corp.unlock.ACCOUNT, corp.unlock.PPP];
    for (const upg of unlock) {
        if (org.has_unlock_upgrade(upg)) {
            continue;
        }
        while (!org.has_unlock_upgrade(upg)) {
            org.buy_unlock_upgrade(upg);
            await ns.sleep(wait_t.SECOND);
        }
        unlock_upgrade.push(upg);
    }
    return unlock_upgrade;
}

/**
 * Hire an employee for an office.  We want to hire an employee to fill a
 * particular role.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param ct A string representing the name of a city.
 * @param role We want to hire for this role.
 * @param wait A boolean signifying whether we want to wait to accumulate enough
 *     money to hire an employee.  If set to false, then we abort the hiring
 *     process if we do not have sufficient funds to hire an employee.
 */
export async function new_hire(ns, div, ct, role, wait) {
    assert(is_boolean(wait));
    const howmany = 1; // How many times to upgrade.
    const org = new Corporation(ns);
    let success = false;
    if (org.is_at_capacity(div, ct)) {
        success = org.upgrade_office(div, ct, howmany);
        if (!success && wait) {
            while (!org.upgrade_office(div, ct, howmany)) {
                await ns.sleep(corp_t.TICK);
            }
        }
    }
    success = org.new_hire(div, ct, role);
    if (!success && wait) {
        while (!org.new_hire(div, ct, role)) {
            await ns.sleep(corp_t.TICK);
        }
    }
}

/**
 * A random product name.  We should not currently have this product.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @return A string representing the name of a product.
 */
export function product_name(ns, div) {
    const support = [corp.industry.TOBACCO];
    assert(support.includes(div));
    const low = 0;
    let high = low;
    let product = [];
    switch (div) {
        case corp.industry.TOBACCO:
            product = Array.from(tobacco.product);
            high = product.length - 1;
            break;
        default:
            // Should never reach here.
            assert(false);
    }
    const org = new Corporation(ns);
    let i = random_integer(low, high);
    while (org.has_product(div, product[i])) {
        i = random_integer(low, high);
    }
    return product[i];
}

/**
 * Sell a product we have developed in a division.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param name A string representing the name of a product.
 */
export function sell_product(ns, div, name) {
    const org = new Corporation(ns);
    assert(org.is_product_complete(div, name));
    cities.all.forEach((ct) => org.product_sell(div, ct, name));
    org.enable_market_ta(div, bool.IS_PRODUCT, name);
}

/**
 * Setup a research lab within a division.  We need a research lab for a
 * division before can acquire other research for the division.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @return True if we already have a research lab in the given division or we
 *     have successfully setup a research lab for the division; false otherwise.
 */
export function setup_research_lab(ns, div) {
    const res = corp.research.RND_LAB;
    const org = new Corporation(ns);
    if (org.has_research(div, res)) {
        return bool.HAS;
    }
    if (org.has_enough_research_points(div, res)) {
        return org.buy_research(div, res);
    }
    return bool.NOT;
}

/**
 * Purchase the Smart Supply unlock upgrade.  This is a one-time unlockable
 * upgrade.  It applies to the entire corporation and cannot be levelled.
 *
 * @param ns The Netscript API.
 */
export function smart_supply(ns) {
    const org = new Corporation(ns);
    if (!org.has_unlock_upgrade(corp.unlock.SMART)) {
        org.buy_unlock_upgrade(corp.unlock.SMART);
    }
    org.enable_smart_supply();
}

/**
 * Convert a number in words to integer.
 *
 * @param str A word representing a number.  For example, "one" refers to
 *     the integer 1.
 * @return The integer equivalent of the given number.
 */
export function to_number(str) {
    assert(str !== "");
    const round = {
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
    };
    return round[str];
}
