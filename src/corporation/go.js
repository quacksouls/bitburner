/**
 * Copyright (C) 2022--2023 Duck McSouls
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

import { agriculture, corp, corp_t } from "/quack/lib/constant/corp.js";
import { cities } from "/quack/lib/constant/location.js";
import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { Corporation } from "/quack/lib/corporation/corp.js";
import {
    corp_cleanup,
    expand_city,
    smart_supply,
} from "/quack/lib/corporation/util.js";
import { error, log } from "/quack/lib/io.js";
import { has_corporation_api } from "/quack/lib/source.js";
import { exec_chain } from "/quack/lib/util.js";

/**
 * Format a number as compact currency (e.g. $1.23B).  Replaces ns.nFormat
 * which was removed in Bitburner 3.0.0.
 */
const fmtMoney = (n) =>
    `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n)}`;

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
 * Hire 3 employees for each new office in each city.  For each office, assign
 * an employee to each of the following positions: Business, Engineer, and
 * Operations.
 *
 * @param ns The Netscript API.
 */
function initial_hire(ns) {
    const org = new Corporation(ns);
    const div = corp.industry.AGRI;
    cities.all.forEach((ct) => {
        org.initial_hire(div, ct);
        log(ns, `${div}: ${ct}: hired ${corp_t.office.INIT_HIRE} employees`);
    });
}

/**
 * Add some levels to various upgrades.
 *
 * @param ns The Netscript API.
 */
async function initial_level_upgrade(ns) {
    const org = new Corporation(ns);
    const upgrade = [
        corp.upgrade.FOCUS,
        corp.upgrade.NEURAL,
        corp.upgrade.SPEECH,
        corp.upgrade.INJECTOR,
        corp.upgrade.FACTORY,
    ];
    for (let i = 0; i < corp_t.upgrade.INIT_LEVEL; i++) {
        for (const upg of upgrade) {
            log(ns, `Level up ${upg} (level ${org.level(upg)} -> ${org.level(upg) + 1}); cost ${fmtMoney(org.upgrade_cost(upg))}`);
            while (!org.level_upgrade(upg)) {
                await ns.sleep(wait_t.SECOND);
            }
        }
    }
    log(ns, `Level up these upgrades: ${upgrade.join(", ")}`);
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
    const material = [
        corp.material.AI,
        corp.material.HARDWARE,
        corp.material.LAND,
    ];
    const amount = [
        agriculture.material.ai.buy.INIT,
        agriculture.material.hardware.buy.INIT,
        agriculture.material.land.buy.INIT,
    ];
    const div = corp.industry.AGRI;
    log(ns, `Purchasing materials: ${material.join(", ")}`);
    for (let i = 0; i < material.length; i++) {
        const org = new Corporation(ns);
        for (const ct of cities.all) {
            const have = org.material_qty(div, ct, material[i]);
            const need = amount[i] - have;
            if (need > 0) {
                log(ns, `${div}/${ct}: buy ${need}x ${material[i]} (have ${have}/${amount[i]})`);
                await org.material_buy(div, ct, material[i], amount[i]);
            }
        }
    }
}

/**
 * The initial selling of materials.
 *
 * @param ns The Netscript API.
 */
function initial_material_sell(ns) {
    const org = new Corporation(ns);
    const div = corp.industry.AGRI;
    cities.all.forEach((ct) => {
        agriculture.material.sold.forEach((mat) => {
            org.material_initial_sell(div, ct, mat);
        });
    });
}

/**
 * Probably resume from where we left off before a soft reset.
 *
 * @param ns The Netscript API.
 * @return True if we resume from where we left off; false otherwise.
 */
function resume(ns) {
    let is_resume = false;
    if (ns.fileExists(corp.PREP, home)) {
        exec_chain(ns, "/quack/corporation/prep.js");
        is_resume = true;
    }
    if (ns.fileExists(corp.AGRI, home)) {
        exec_chain(ns, "/quack/corporation/agriculture.js");
        is_resume = true;
    }
    if (ns.fileExists(corp.TOBA, home)) {
        exec_chain(ns, "/quack/corporation/tobacco.js");
        is_resume = true;
    }
    if (ns.fileExists(corp.JANI, home)) {
        exec_chain(ns, "/quack/corporation/janitor.js");
        is_resume = true;
    }
    return is_resume;
}

/**
 * The initial setup of our corporation.  First, we branch into agriculture.
 *
 * @param ns The Netscript API.
 */
async function stage_one(ns) {
    const org = new Corporation(ns);
    const div = corp.industry.AGRI;
    log(ns, `=== Stage one: division ${div} ===`);
    log(ns, `Funds: ${fmtMoney(org.funds())}`);
    if (org.has_division(div)) {
        log(ns, `${div}: division already exists; skip stage_one`);
        return;
    }
    log(ns, `Expanding into industry: ${div}`);
    org.expand_industry(div);
    log(ns, `Created new division: ${div}`);
    const new_office = await expand_city(ns, div);
    log(ns, `${div}: expanded to ${new_office.join(", ")}`);
    log(ns, `Upgrading warehouses to initial size...`);
    cities.all.forEach((ct) => {
        if (org.has_division_office(div, ct)) {
            org.warehouse_init_upgrade(div, ct);
        }
    });
    log(ns, `Enabling Smart Supply (with leftovers option)...`);
    smart_supply(ns);
    log(ns, `Hiring initial employees (3 per office)...`);
    initial_hire(ns);
    log(ns, `Setting initial sell orders for materials...`);
    initial_material_sell(ns);
    log(ns, `Levelling up initial upgrades (FocusWires, Neural, Speech, Injector, Factory)...`);
    await initial_level_upgrade(ns);
    log(ns, `Buying initial materials (AI Cores, Hardware, Real Estate)...`);
    await initial_material_buy(ns);
    log(ns, `=== Stage one complete. Funds: ${fmtMoney(org.funds())} ===`);
}

/**
 * The initial creation of our corporation.  We also perform various tasks
 * related to the early management of the corporation.
 *
 * Usage: run quack/corporation/go.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    ns.disableLog("corporation.createCorporation");
    log(ns, "go.js starting");
    // Sanity check.
    if (!has_corporation_api(ns)) {
        error(ns, "No access to Corporation API");
        return;
    }
    // Clean up any stale marker files from a previous run so resume() does
    // not false-positive against leftover .txt files.
    corp_cleanup(ns);
    if (resume(ns)) {
        log(ns, "Resumed from a previous script; exit go.js");
        return;
    }
    // Create our corporation.  If we do not have access to the Office and
    // Warehouse APIs, then we cannot automate the early stages of our
    // corporation.  We want to automate as much of the game as possible.
    // Without the above APIs, quit the script as soon as possible.
    await create_corp(ns);
    const org = new Corporation(ns);
    log(ns, `Office API? ${org.has_unlock_upgrade(corp.unlock.OFFICE)}`);
    log(ns, `Warehouse API? ${org.has_unlock_upgrade(corp.unlock.WAREHOUSE)}`);
    if (!org.has_office_warehouse_api()) {
        error(ns, "No access to Warehouse and/or Office APIs");
        log(ns, "You need to purchase these unlock upgrades in the Corporation UI (or via API).");
        return;
    }
    // Early management of our corporation.
    await stage_one(ns);
    log(ns, "Waiting for each office to be vivacious");
    await org.vivacious_office();
    // Next script in the load chain.
    log(ns, "Vivacious! Spawning /quack/corporation/prep.js ...");
    exec_chain(ns, "/quack/corporation/prep.js");
}
