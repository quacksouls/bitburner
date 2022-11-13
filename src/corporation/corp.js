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
import { log } from "/lib/io.js";
import { has_corporation_api } from "/lib/source.js";

/**
 * Create a corporation.
 *
 * @param ns The Netscript API.
 */
async function create_corp(ns) {
    const org = new Corporation(ns);
    if (org.has_corp()) {
        log(ns, "Manage a corporation");
        return;
    }
    while (!org.create()) {
        await ns.sleep(wait_t.DEFAULT);
    }
    log(ns, "Create and manage a corporation");
}

/**
 * Expand our divisions by opening offices in other cities.
 *
 * @param ns The Netscript API.
 */
function expand_city(ns) {
    const org = new Corporation(ns);
    for (const div of org.all_divisions()) {
        cities.all.forEach((ct) => {
            if (!org.has_division_office(div, ct)) {
                org.expand_city(div, ct);
                org.buy_warehouse(div, ct);
            }
            org.warehouse_init_upgrade(div, ct);
        });
    }
}

/**
 * Expand into other industries.
 *
 * @param ns The Netscript API.
 */
function expand_industry(ns) {
    const org = new Corporation(ns);
    org.expand_industry();
}

/**
 * Whether we have access to the Office and Warehouse APIs.  We have permanent
 * access to these APIs after we have destroyed BN3.3.
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
        cities.all.forEach((ct) => org.initial_hire(div, ct));
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
 * The initial setup of our corporation.
 *
 * @param ns The Netscript API.
 */
async function stage_one(ns) {
    expand_industry(ns);
    expand_city(ns);
    unlock_upgrade(ns);
    initial_hire(ns);
    hire_advert(ns);
    initial_material_sell(ns);
    initial_level_upgrade(ns);
    await initial_material_buy(ns);
}

/**
 * Purchase an unlock upgrade.  This is a one-time unlockable upgrade.  It
 * applies to the entire corporation and cannot be levelled.
 *
 * @param ns The Netscript API.
 */
function unlock_upgrade(ns) {
    const org = new Corporation(ns);
    if (!org.has_unlock_upgrade(corp.unlock.SMART)) {
        org.buy_unlock_upgrade(corp.unlock.SMART);
        org.enable_smart_supply();
    }
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
}
