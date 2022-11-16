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
import { colour } from "/lib/constant/misc.js";
import { wait_t } from "/lib/constant/time.js";
import { Corporation } from "/lib/corporation/corp.js";
import { Cutil } from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { has_corporation_api } from "/lib/source.js";
import { assert } from "/lib/util.js";

/**
 * Create a corporation.
 *
 * @param ns The Netscript API.
 */
async function create_corp(ns) {
    const org = new Corporation(ns);
    if (Cutil.has_corp(ns)) {
        log(ns, "Manage a corporation");
        return;
    }
    while (!org.create()) {
        await ns.sleep(wait_t.DEFAULT);
    }
    log(ns, "Create and manage a corporation");
}

/**
 * Expand a division by opening offices in other cities.
 *
 * @param ns The Netscript API.
 * @param div We want to branch this division into other cities.
 */
function expand_city(ns, div) {
    const org = new Corporation(ns);
    cities.all.forEach((ct) => {
        if (!org.has_division_office(div, ct)) {
            org.expand_city(div, ct);
            org.buy_warehouse(div, ct);
            log(ns, `${div}: expanded to ${ct}`);
        }
        org.warehouse_init_upgrade(div, ct);
    });
}

/**
 * The first round of hiring after accepting the first investment offer.  We
 * want to hire 1 employee for each office, in the role of Management.
 *
 * We currently have employees in these roles:
 *
 * (1) Operations x 1
 * (2) Engineer x 1
 * (3) Business x 1
 *
 * After this round of hiring, each office should have the following roster:
 *
 * (1) Operations x 1
 * (2) Engineer x 1
 * (3) Business x 1
 * (4) Management x 1
 *
 * @param ns The Netscript API.
 */
async function first_hire_round(ns) {
    const org = new Corporation(ns);
    for (const div of org.all_divisions()) {
        for (const ct of cities.all) {
            if (org.num_management(div, ct) < 1) {
                assert(org.office_size(div, ct) === corp_t.office.INIT_HIRE);
                await new_hire(ns, div, ct, corp.job.MANAGEMENT);
            }
        }
    }
}

/**
 * The first round of investment.
 *
 * @param ns The Netscript API.
 */
async function first_investor_round(ns) {
    // Need to wait for our corporation to make a certain amount of profit per
    // second, and have a certain amount of funds.
    const funds_tau = ns.nFormat(corp_t.funds.VERY_LOW, "$0,0.00a");
    const profit_tau = ns.nFormat(corp_t.profit.VERY_LOW, "$0,0.00a");
    log(ns, `Waiting for sufficient funds: ${funds_tau}`);
    log(ns, `Waiting for sufficient profit: ${profit_tau}/s`);
    const org = new Corporation(ns);
    while (
        org.funds() < corp_t.funds.VERY_LOW
        || org.profit() < corp_t.profit.VERY_LOW
    ) {
        await ns.sleep(corp_t.TICK);
    }
    const { funds, round, shares } = ns[corp.API].getInvestmentOffer();
    if (round !== 1) {
        return;
    }
    ns[corp.API].acceptInvestmentOffer();
    const fundsf = ns.nFormat(funds, "$0,0.00a");
    const sharesf = ns.nFormat(shares, "0,0.00a");
    log(ns, `Round ${round} of investment`);
    log(
        ns,
        `Received ${fundsf} in exchange for ${sharesf} shares of corporation`
    );
}

/**
 * Whether we have access to the Office and Warehouse APIs.  We have permanent
 * access to these APIs after we have destroyed BN3.3.
 *
 * @param ns The Netscript API.
 */
function has_office_warehouse_api(ns) {
    const org = new Corporation(ns);
    return (
        org.has_unlock_upgrade(corp.unlock.OFFICE)
        && org.has_unlock_upgrade(corp.unlock.WAREHOUSE)
    );
}

/**
 * Hire AdVert.inc to advertise for our company.
 *
 * @param ns The Netscript API.
 */
function hire_advert(ns) {
    const org = new Corporation(ns);
    org.all_divisions().forEach((div) => org.hire_advert(div));
}

/**
 * Hire 3 employees for each new office in each city.  For each office, assign
 * an employee to each of the following positions: Business, Engineer, and
 * Operations.
 *
 * @param ns The Netscript API.
 */
function initial_hire(ns) {
    const org = new Corporation(ns);
    for (const div of org.all_divisions()) {
        cities.all.forEach((ct) => {
            org.initial_hire(div, ct);
            log(
                ns,
                `${div}: ${ct}: hired ${corp_t.office.INIT_HIRE} employees`
            );
        });
    }
}

/**
 * Add some levels to various upgrades.
 *
 * @param ns The Netscript API.
 */
function initial_level_upgrade(ns) {
    const org = new Corporation(ns);
    const upgrade = [
        corp.upgrade.FOCUS,
        corp.upgrade.NEURAL,
        corp.upgrade.SPEECH,
        corp.upgrade.INJECTOR,
        corp.upgrade.FACTORY,
    ];
    for (let i = 0; i < corp_t.upgrade.INIT_LEVEL; i++) {
        upgrade.forEach((upg) => org.level_upgrade(upg));
    }
    log(ns, `Level up the following upgrades: ${upgrade.join(", ")}`);
}

/**
 * The initial purchase of these materials:
 *
 * (1) Hardware.  We want a total of 125.
 * (2) AI Cores.  We want a total of 75.
 * (3) Real Estate.  We want a total of 27k.
 *
 * @param ns The Netscript API.
 */
async function initial_material_buy(ns) {
    const org = new Corporation(ns);
    const material = [
        corp.material.AI,
        corp.material.HARDWARE,
        corp.material.LAND,
    ];
    const amount = [
        corp_t.material.ai.buy.INIT,
        corp_t.material.hardware.buy.INIT,
        corp_t.material.land.buy.INIT,
    ];
    for (let i = 0; i < material.length; i++) {
        await org.material_buy(material[i], amount[i]);
    }
}

/**
 * The initial selling of materials.
 *
 * @param ns The Netscript API.
 */
function initial_material_sell(ns) {
    const org = new Corporation(ns);
    for (const div of org.all_divisions()) {
        cities.all.forEach((ct) => {
            org.material_initial_sell(div, ct, corp.material.FOOD);
            org.material_initial_sell(div, ct, corp.material.PLANT);
        });
    }
}

/**
 * A round of hiring for each office.  For each office, we want to hire an
 * employee to fill a particular role.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param ct A string representing the name of a city.
 * @param role We want to hire for this role.
 */
async function new_hire(ns, div, ct, role) {
    const howmany = 1; // How many times to upgrade.
    const org = new Corporation(ns);
    if (org.is_at_capacity(div, ct)) {
        while (!org.upgrade_office(div, ct, howmany)) {
            await ns.sleep(wait_t.SECOND);
        }
    }
    while (!org.new_hire(div, ct, role)) {
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * Purchase the Smart Supply unlock upgrade.  This is a one-time unlockable
 * upgrade.  It applies to the entire corporation and cannot be levelled.
 *
 * @param ns The Netscript API.
 */
function smart_supply(ns) {
    const org = new Corporation(ns);
    if (!org.has_unlock_upgrade(corp.unlock.SMART)) {
        org.buy_unlock_upgrade(corp.unlock.SMART);
        org.enable_smart_supply();
    }
}

/**
 * The initial setup of our corporation.  First, we branch into agriculture.
 *
 * @param ns The Netscript API.
 */
async function stage_one(ns) {
    const org = new Corporation(ns);
    if (org.has_division(corp.industry.AGRI)) {
        return;
    }
    org.expand_industry(corp.industry.AGRI);
    log(ns, `Created new division: ${corp.industry.AGRI}`);
    expand_city(ns, corp.industry.AGRI);
    smart_supply(ns);
    initial_hire(ns);
    hire_advert(ns);
    initial_material_sell(ns);
    initial_level_upgrade(ns);
    await initial_material_buy(ns);
}

/**
 * Waiting for each office to be vivacious.
 *
 * @param ns The Netscript API.
 */
async function vivacious_office(ns) {
    log(ns, "Waiting for each office to be vivacious");
    const org = new Corporation(ns);
    for (const div of org.all_divisions()) {
        const vivacious = (c) => org.is_vivacious(div, c);
        while (!cities.all.every(vivacious)) {
            await ns.sleep(wait_t.SECOND);
        }
    }
    log(ns, "Each office is vivacious");
}

/**
 * Create and manage a corporation.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Sanity check.
    if (!has_corporation_api(ns)) {
        log(ns, "No access to Corporation API", colour.RED);
        return;
    }
    // Create our corporation.  If we do not have access to the Office and
    // Warehouse APIs, then we cannot automate the early stages of our
    // corporation.  We want to automate as much of the game as possible.
    // Without the above APIs, quit the script as soon as possible.
    await create_corp(ns);
    if (!has_office_warehouse_api(ns)) {
        log(ns, "No access to Warehouse and/or Office APIs", colour.RED);
        return;
    }
    // Manage our corporation.
    await stage_one(ns);
    await vivacious_office(ns);
    await first_investor_round(ns);
    await first_hire_round(ns);
}
