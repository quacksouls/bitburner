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
import { Corporation } from "/lib/corporation/corp.js";
import { to_number } from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { has_corporation_api } from "/lib/source.js";
import { assert } from "/lib/util.js";

/**
 * Whether each warehouse has been upgraded for this round.
 *
 * @param ns The Netscript API.
 * @param n A string representing the investment round number.
 * @return True if each warehouse is upgraded to a given storage capacity.
 */
function all_warehouses_upgraded(ns, n) {
    const target = corp_t.warehouse.round[n].SIZE;
    const org = new Corporation(ns);
    for (const div of org.all_divisions()) {
        const not_upgraded = (c) => org.warehouse_capacity(div, c) < target;
        if (cities.all.some(not_upgraded)) {
            return false;
        }
    }
    return true;
}

/**
 * The first round of hiring after accepting the first investment offer.
 *
 * @param ns The Netscript API.
 */
async function hire_round_one(ns) {
    const stage = ["one", "two", "three", "four", "five", "six"];
    for (const s of stage) {
        await hire_round_one_stage(ns, s);
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
async function hire_round_one_stage(ns, n) {
    assert(n !== "");
    log(ns, `Stage ${to_number(n)} of hiring`);
    const org = new Corporation(ns);
    const current = corp_t.hire.stage[n].NOW;
    const role = corp_t.hire.stage[n].ROLE;
    for (const div of org.all_divisions()) {
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
            await new_hire(ns, div, ct, role);
            const prefix = `${div}: ${ct}`;
            const msg = `hired 1 employee and assigned to ${role}`;
            log(ns, `${prefix}: ${msg}`);
        }
    }
}

/**
 * A round of investment offer.
 *
 * @param ns The Netscript API.
 * @param r A string (i.e. word) representing the investment round.
 */
async function investment_offer(ns, r) {
    if (ns[corp.API].getInvestmentOffer().round !== to_number(r)) {
        return;
    }
    // Need to wait for our corporation to make a certain amount of profit per
    // second, and have a certain amount of funds.
    log(ns, `Round ${to_number(r)} of investment`);
    const funds_tau = ns.nFormat(corp_t.funds.round[r].N, "$0,0.00a");
    const profit_tau = ns.nFormat(corp_t.profit.round[r].N, "$0,0.00a");
    log(ns, `Waiting for sufficient funds: ${funds_tau}`);
    log(ns, `Waiting for sufficient profit: ${profit_tau}/s`);
    const org = new Corporation(ns);
    while (
        org.funds() < corp_t.funds.round[r].N
        || org.profit() < corp_t.profit.round[r].N
    ) {
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
}

/**
 * Upgrade the warehouse of each division in each city.
 *
 * @param ns The Netscript API.
 * @param n A string representing the investment round number.
 */
async function level_up_storage(ns, n) {
    log(ns, "Upgrading the storage capacity of each warehouse");
    while (!all_warehouses_upgraded(ns, n)) {
        upgrade_warehouse(ns, n);
        await ns.sleep(corp_t.TICK);
    }
    const size = ns.nFormat(corp_t.warehouse.round[n].SIZE, "0,00.00a");
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
        corp_t.material.ai.buy.round[n].N,
        corp_t.material.chemical.buy.round[n].N,
        corp_t.material.drug.buy.round[n].N,
        corp_t.material.energy.buy.round[n].N,
        corp_t.material.food.buy.round[n].N,
        corp_t.material.hardware.buy.round[n].N,
        corp_t.material.land.buy.round[n].N,
        corp_t.material.metal.buy.round[n].N,
        corp_t.material.plant.buy.round[n].N,
        corp_t.material.robot.buy.round[n].N,
        corp_t.material.water.buy.round[n].N,
    ];
    for (let i = 0; i < material.length; i++) {
        const org = new Corporation(ns);
        for (const div of org.all_divisions()) {
            for (const ct of cities.all) {
                const max = org.material_qty(div, ct, material[i]) + amount[i];
                if (org.material_qty(div, ct, material[i]) >= max) {
                    continue;
                }
                const prefix = `${div}: ${ct}`;
                const amt = ns.nFormat(amount[i], "0,00.00a");
                log(ns, `${prefix}: Buying ${amt} units of ${material[i]}`);
                await org.material_buy(div, ct, material[i], amount[i]);
            }
        }
    }
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
async function new_hire(ns, div, ct, role) {
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
    log(ns, "Waiting for each office to be vivacious");
    const org = new Corporation(ns);
    await org.vivacious_office();
}

/**
 * Round 2 in preparing our corporation.  Perform these tasks in order:
 *
 * (1) Upgrade the storage capacity of warehouses.
 *
 * @param ns The Netscript API.
 */
// async function round_two(ns) {
//     const script = [
//         "/corporation/invest.js",
//         "/corporation/storage.js",
//         "/corporation/material.js",
//     ];
//     for (const s of script) {
//         await run_task(ns, s, "two");
//     }
//     log(ns, "Waiting for each office to be vivacious");
//     await Cutil.vivacious_office(ns);
// }

/**
 * Execute a given script and wait for it to complete.
 *
 * @param ns The Netscript API.
 * @param script We want to execute this script.
 * @param arg Run the given script using this argument.
 */
// async function run_task(ns, script, arg) {
//     const nthread = 1;
//     ns.exec(script, home, nthread, arg);
//     while (ns.isRunning(script, home, arg)) {
//         await ns.sleep(wait_t.SECOND);
//     }
// }

/**
 * Round 1 of miscellaneous upgrades.  Level up various upgrades to a desired
 * level.
 *
 * @param ns The Netscript API.
 */
async function upgrade_round_one(ns) {
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
    const target = corp_t.warehouse.round[n].SIZE;
    const howmany = 1;
    org.all_divisions().forEach((div) => {
        cities.all.forEach((ct) => {
            if (org.warehouse_capacity(div, ct) < target) {
                org.upgrade_warehouse(div, ct, howmany);
            }
        });
    });
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
    assert(org.has_corp(ns));
    assert(org.has_office_warehouse_api(ns));
    // Various rounds of preparation.
    await round_one(ns);
    // await round_two(ns);
}
