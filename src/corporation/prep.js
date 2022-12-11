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
import { agriculture, corp, corp_t } from "/lib/constant/corp.js";
import { cities } from "/lib/constant/location.js";
import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { Corporation } from "/lib/corporation/corp.js";
import {
    investment_offer,
    new_hire,
    to_number,
} from "/lib/corporation/util.js";
import { create_file, log } from "/lib/io.js";
import { has_corporation_api } from "/lib/source.js";
import { assert, exec } from "/lib/util.js";

/**
 * Whether each warehouse has been upgraded for this round.
 *
 * @param ns The Netscript API.
 * @param n A string representing the investment round number.
 * @return True if each warehouse is upgraded to a given storage capacity.
 */
function all_warehouses_upgraded(ns, n) {
    const target = agriculture.warehouse.round[n].SIZE;
    const org = new Corporation(ns);
    const div = corp.industry.AGRI;
    const is_upgraded = (c) => org.warehouse_capacity(div, c) >= target;
    return cities.all.every(is_upgraded);
}

/**
 * The first round of hiring after accepting the first investment offer.
 *
 * @param ns The Netscript API.
 */
async function hire_round_one(ns) {
    log(ns, "Round 1 of hiring");
    const stage = ["one", "two", "three", "four", "five", "six"];
    for (const s of stage) {
        await hire_round_one_stage(ns, s);
        await ns.sleep(wait_t.SECOND);
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
async function hire_round_one_stage(ns, n) {
    assert(n !== "");
    log(ns, `Stage ${to_number(n)} of hiring`);
    const org = new Corporation(ns);
    const current = agriculture.hire.stage[n].NOW;
    const role = agriculture.hire.stage[n].ROLE;
    const div = corp.industry.AGRI;
    for (const ct of cities.all) {
        // Sanity check the current number of employees in the given role.
        switch (role) {
            case "Operations":
                if (org.num_operations(div, ct) > current) {
                    continue;
                }
                break;
            case "Engineer":
                if (org.num_engineer(div, ct) > current) {
                    continue;
                }
                break;
            case "Business":
                if (org.num_business(div, ct) > current) {
                    continue;
                }
                break;
            case "Management":
                if (org.num_management(div, ct) > current) {
                    continue;
                }
                break;
            default:
                // Should never reach here.
                assert(false);
        }
        // Hire an employee for the role.
        await new_hire(ns, div, ct, role, bool.WAIT);
        const prefix = `${div}: ${ct}`;
        const msg = `hired 1 employee and assigned to ${role}`;
        log(ns, `${prefix}: ${msg}`);
    }
}

/**
 * Upgrade the warehouse of each division in each city.
 *
 * @param ns The Netscript API.
 * @param n A string representing the investment round number.
 */
async function level_up_storage(ns, n) {
    log(ns, `Round ${to_number(n)} of warehouse upgrade`);
    while (!all_warehouses_upgraded(ns, n)) {
        upgrade_warehouse(ns, n);
        await ns.sleep(wait_t.SECOND);
    }
    const size = ns.nFormat(agriculture.warehouse.round[n].SIZE, "0,00.00a");
    log(ns, `New storage capacity of each warehouse: ${size}`);
}

/**
 * Purchase some materials.  We want to buy some or all of these materials:
 *
 * (1) AI Cores
 * (2) Chemicals
 * (3) Drugs
 * (4) Energy
 * (5) Food
 * (7) Hardware
 * (8) Real Estate
 * (9) Metal
 * (10) Plants
 * (11) Robots
 * (12) Water
 *
 * @param ns The Netscript API.
 * @param n A string representing the round number.  This is the same as the
 *     investment round number.
 */
async function material_buy(ns, n) {
    log(ns, `Round ${to_number(n)} of material purchase`);
    const material = [
        corp.material.AI,
        corp.material.CHEMICAL,
        corp.material.DRUG,
        corp.material.ENERGY,
        corp.material.FOOD,
        corp.material.HARDWARE,
        corp.material.LAND,
        corp.material.METAL,
        corp.material.PLANT,
        corp.material.ROBOT,
        corp.material.WATER,
    ];
    const amount = [
        agriculture.material.ai.buy.round[n].N,
        agriculture.material.chemical.buy.round[n].N,
        agriculture.material.drug.buy.round[n].N,
        agriculture.material.energy.buy.round[n].N,
        agriculture.material.food.buy.round[n].N,
        agriculture.material.hardware.buy.round[n].N,
        agriculture.material.land.buy.round[n].N,
        agriculture.material.metal.buy.round[n].N,
        agriculture.material.plant.buy.round[n].N,
        agriculture.material.robot.buy.round[n].N,
        agriculture.material.water.buy.round[n].N,
    ];
    const target = [
        agriculture.material.ai.buy.round[n].TARGET,
        agriculture.material.chemical.buy.round[n].TARGET,
        agriculture.material.drug.buy.round[n].TARGET,
        agriculture.material.energy.buy.round[n].TARGET,
        agriculture.material.food.buy.round[n].TARGET,
        agriculture.material.hardware.buy.round[n].TARGET,
        agriculture.material.land.buy.round[n].TARGET,
        agriculture.material.metal.buy.round[n].TARGET,
        agriculture.material.plant.buy.round[n].TARGET,
        agriculture.material.robot.buy.round[n].TARGET,
        agriculture.material.water.buy.round[n].TARGET,
    ];
    assert(material.length === amount.length);
    assert(material.length === target.length);
    const div = corp.industry.AGRI;
    for (let i = 0; i < material.length; i++) {
        const org = new Corporation(ns);
        for (const ct of cities.all) {
            if (org.material_qty(div, ct, material[i]) >= target[i]) {
                continue;
            }
            const prefix = `${div}: ${ct}`;
            const amt = ns.nFormat(amount[i], "0,00.00a");
            log(ns, `${prefix}: Buying ${amt} units of ${material[i]}`);
            await org.material_buy(div, ct, material[i], amount[i]);
        }
    }
}

/**
 * Round 1 in preparing our corporation.  Perform these tasks in order:
 *
 * (1) Accept investment money.
 * (2) Hire new employees.
 * (3) Level up various upgrades.
 * (4) Upgrade the storage capacity of warehouses.
 * (5) Purchase materials.
 *
 * @param ns The Netscript API.
 */
async function round_one(ns) {
    await investment_offer(ns, "one");
    await hire_round_one(ns);
    await upgrade_round_one(ns);
    await level_up_storage(ns, "one");
    await material_buy(ns, "one");
}

/**
 * Round 2 in preparing our corporation.  Perform these tasks in order:
 *
 * (1) Accept investment money.
 * (2) Upgrade the storage capacity of warehouses.
 * (3) Purchase materials.
 *
 * @param ns The Netscript API.
 */
async function round_two(ns) {
    await investment_offer(ns, "two");
    await level_up_storage(ns, "two");
    await material_buy(ns, "two");
}

/**
 * Round 1 of miscellaneous upgrades.  Level up various upgrades to a desired
 * level.
 *
 * @param ns The Netscript API.
 */
async function upgrade_round_one(ns) {
    log(ns, "Round 1 of levelling upgrades");
    const upg = [corp.upgrade.FACTORY, corp.upgrade.STORAGE];
    log(ns, `Level up these upgrades: ${upg.join(", ")}`);
    const lvl = corp_t.upgrade.round.one.LEVEL;
    const org = new Corporation(ns);
    for (;;) {
        if (
            org.level(corp.upgrade.FACTORY) >= lvl
            && org.level(corp.upgrade.STORAGE) >= lvl
        ) {
            break;
        }
        upgrade_round_one_level_up(ns);
        await ns.sleep(corp_t.TICK);
    }
    const lvl_factory = org.level(corp.upgrade.FACTORY);
    const lvl_storage = org.level(corp.upgrade.STORAGE);
    log(ns, `Upgraded ${corp.upgrade.FACTORY} to level ${lvl_factory}`);
    log(ns, `Upgraded ${corp.upgrade.STORAGE} to level ${lvl_storage}`);
}

/**
 * Round 1 of miscellaneous upgrade.  Level up various upgrades by 1 level.
 *
 * @param ns The Netscript API.
 */
function upgrade_round_one_level_up(ns) {
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
 * Upgrade the storage capacity of each warehouse.
 *
 * @param ns The Netscript API.
 * @param n A string representing the investment round number.
 */
function upgrade_warehouse(ns, n) {
    const org = new Corporation(ns);
    const target = agriculture.warehouse.round[n].SIZE;
    const howmany = 1;
    const div = corp.industry.AGRI;
    const is_under_capacity = (ct) => org.warehouse_capacity(div, ct) < target;
    cities.all
        .filter((ct) => is_under_capacity(ct))
        .forEach((ct) => org.upgrade_warehouse(div, ct, howmany));
}

/**
 * Prepare our corporation after the initial setup.  We iterate over the
 * following cycle:
 *
 * (1) Accept investment money.
 * (2) Hire employees.
 * (3) Level up.
 * (4) Upgrade storage.
 * (5) Buy materials.
 *
 * Usage: run corporation/prep.js
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
    // Various rounds of preparation.
    create_file(ns, corp.PREP, ns.getScriptName());
    await round_one(ns);
    await round_two(ns);
    log(ns, "Waiting for each office to be vivacious");
    await org.vivacious_office();
    // Next scripts in the load chain.
    exec(ns, "/corporation/agriculture.js");
    exec(ns, "/corporation/tobacco.js");
    ns.rm(corp.PREP, home);
}
