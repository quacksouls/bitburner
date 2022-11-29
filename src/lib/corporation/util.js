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

import { corp, corp_t, tobacco } from "/lib/constant/corp.js";
import { io } from "/lib/constant/io.js";
import { cities } from "/lib/constant/location.js";
import { base } from "/lib/constant/misc.js";
import { wait_t } from "/lib/constant/time.js";
import { Corporation } from "/lib/corporation/corp.js";
import { log } from "/lib/io.js";
import { random_integer } from "/lib/random.js";
import { assert } from "/lib/util.js";

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
    // ns[corp.API].getInvestmentOffer().round
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
    const { funds, shares } = ns[corp.API].getInvestmentOffer();
    ns[corp.API].acceptInvestmentOffer();
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
 * Hire an employee for an office.  We want to hire an employee to fill a
 * particular role.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param ct A string representing the name of a city.
 * @param role We want to hire for this role.
 */
export async function new_hire(ns, div, ct, role) {
    const howmany = 1; // How many times to upgrade.
    const org = new Corporation(ns);
    if (org.is_at_capacity(div, ct)) {
        while (!org.upgrade_office(div, ct, howmany)) {
            await ns.sleep(corp_t.TICK);
        }
    }
    while (!org.new_hire(div, ct, role)) {
        await ns.sleep(corp_t.TICK);
    }
}

/**
 * A random Tobacco product name.  We should not currently have this product.
 *
 * @param ns The Netscript API.
 * @return A string representing the name of a Tobacco product.
 */
export function tobacco_product_name(ns) {
    const low = 0;
    const high = tobacco.product.length - 1;
    const org = new Corporation(ns);
    let i = random_integer(low, high);
    while (org.has_product(corp.industry.TOBACCO, tobacco.product[i])) {
        i = random_integer(low, high);
    }
    return tobacco.product[i];
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
    };
    return round[str];
}
