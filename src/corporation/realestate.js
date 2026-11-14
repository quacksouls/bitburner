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

/**
 * Maintenance-mode script for a Real Estate division.
 *
 * Assumes the corp already exists and the "RealEstate" division has
 * already been expanded (offices + warehouses in all 6 cities) and
 * has Hi-Tech R&D Laboratory + Market-TA.I + Market-TA.II research
 * purchased (run a setup script similar to go.js/prep.js first, or
 * expand manually in the UI).  If a prerequisite is missing, the
 * script attempts a one-shot setup; if the setup fails (insufficient
 * funds), it logs and exits.
 *
 * Real Estate industry (IndustryData.ts:187-209):
 *   startingCost: 600e9 ($600B)
 *   product: name "Property", verb "Develop"
 *   produced materials: ["Real Estate"]
 *   required materials: Metal 5, Plants 1, Water 2, Hardware 4
 *   makesMaterials: true (also a producer of the Real Estate material)
 *   makesProducts: true (can build Properties)
 *
 * Each maintenance iteration:
 *   1. Check division exists; if not, try to expand into RealEstate
 *      (costs $600B).  If we cannot afford it, exit.
 *   2. Ensure offices + warehouses exist in all 6 cities (expand any
 *      missing ones).
 *   3. Ensure Smart Supply is on (leftovers option for each material).
 *   4. Hire initial 3 employees per office if office is empty.
 *   5. If at max products (3 base, +1 Capacity.I, +1 Capacity.II),
 *      discontinue the lowest-rated product to make room.
 *   6. Create a new Property (random name from the pool below).
 *   7. Wait for development to complete, logging progress every 30s.
 *      Bail out (STUCK) if progress is unchanged for 5 minutes.
 *   8. Sell the property at MP+10% with Market-TA automatic pricing.
 *   9. Buy AdVert.frugal (frugal, only when profit/second supports it).
 *  10. Wait for offices to become vivacious, then sleep 10 minutes
 *      before the next iteration.
 *
 * This script is a standalone maintenance loop — it does not chain
 * to or from tobacco.js / janitor.js.  Run it directly:
 *   run /quack/corporation/realestate.js
 */

import { bool } from "/quack/lib/constant/bool.js";
import { corp, corp_t } from "/quack/lib/constant/corp.js";
import { cities } from "/quack/lib/constant/location.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { Corporation } from "/quack/lib/corporation/corp.js";
import { log } from "/quack/lib/io.js";
import { has_corporation_api } from "/quack/lib/source.js";
import { assert } from "/quack/lib/util.js";

const DIV = corp.industry.LAND;
const DEV_CITY = "Aevum";
const SELL_PRICE = "MP+10%";
const SELL_AMOUNT = "MAX";
const RESEARCH_NEEDED = [
    corp.research.RND_LAB,
    corp.research.TA_I,
    corp.research.TA_II,
    corp.research.CAPACITY_I,
    corp.research.CAPACITY_II,
];
const PROPERTY_NAMES = [
    "Avalon", "Brookside", "CedarPark", "DelMar", "Eastview", "Fairmont",
    "GardenHill", "Highland", "IvyLane", "JadeCourt", "KingsRow", "Lakeview",
    "MapleGrove", "Northgate", "Oakridge", "PineCrest", "QuailHollow",
    "Riverbend", "Sunset", "ThetaPark",
];

/**
 * Whether the corp can afford to start (or expand into) the Real
 * Estate division.  Starting cost is $600B; we want a comfortable
 * margin beyond that for offices + warehouses + hiring.
 *
 * @param ns The Netscript API.
 * @return True if the corp has at least $1T in funds (heuristic).
 */
function can_afford_realestate(ns) {
    const org = new Corporation(ns);
    return org.funds() >= 1e12;
}

/**
 * Expand the Real Estate division if it doesn't currently exist.
 * Costs $600B to expand into the industry.  Logs and exits if the
 * corp cannot afford the upfront cost.
 *
 * @param ns The Netscript API.
 */
function setup_division(ns) {
    const org = new Corporation(ns);
    if (org.has_division(DIV)) return;
    if (!can_afford_realestate(ns)) {
        log(
            ns,
            `${DIV}: cannot afford to expand (need $1T, have $${org.funds().toFixed(0)}); run go.js/prep.js first or expand manually in the UI`
        );
        ns.exit();
    }
    log(ns, `${DIV}: expanding into Real Estate industry (cost $600B)`);
    ns.corporation.expandIndustry(corp.industry.LAND, DIV);
}

/**
 * Open offices + warehouses in any cities where the division is
 * missing them.  Idempotent.
 *
 * @param ns The Netscript API.
 */
async function expand_offices(ns) {
    const org = new Corporation(ns);
    const newOffices = [];
    for (const ct of cities.all) {
        if (!org.has_division_office(DIV, ct)) {
            try {
                ns.corporation.expandCity(DIV, ct);
                while (!ns.corporation.hasWarehouse(DIV, ct)) {
                    ns.corporation.purchaseWarehouse(DIV, ct);
                    await ns.sleep(wait_t.SECOND);
                }
                newOffices.push(ct);
            } catch (e) {
                log(ns, `${DIV}/${ct}: cannot expand office (${e.message || e})`);
            }
        }
    }
    if (newOffices.length > 0) {
        log(ns, `${DIV}: opened new offices in ${newOffices.join(", ")}`);
    }
}

/**
 * Enable Smart Supply with the "leftovers" option for each material
 * in each city, if Smart Supply has been unlocked.  Idempotent.
 *
 * @param ns The Netscript API.
 */
function enable_smart_supply(ns) {
    const org = new Corporation(ns);
    const SMART = corp.unlock.SMART;
    if (!org.has_unlock_upgrade(SMART)) {
        try {
            ns.corporation.purchaseUnlock(SMART);
        } catch {
            // Cannot afford yet; skip.
            return;
        }
    }
    try {
        ns.corporation.setSmartSupply(DIV, true);
    } catch {
        // Already on or no offices.
    }
    for (const ct of cities.all) {
        if (!org.has_division_office(DIV, ct)) continue;
        for (const mat of ["Metal", "Plants", "Water", "Hardware"]) {
            try {
                ns.corporation.setSmartSupplyOption(DIV, ct, mat, "leftovers");
            } catch {
                // Material not accepted; skip.
            }
        }
    }
}

/**
 * Hire one employee in each role in each office where the office is
 * empty (0 employees).  This seed the office so production/research
 * can begin; further hiring is left to the maintenance loop's
 * budget.  Idempotent.
 *
 * @param ns The Netscript API.
 */
function initial_hire(ns) {
    const org = new Corporation(ns);
    for (const ct of cities.all) {
        if (!org.has_division_office(DIV, ct)) continue;
        const office = ns.corporation.getOffice(DIV, ct);
        if (office.numEmployees > 0) continue;
        const roles = ["Operations", "Engineer", "Business"];
        for (const role of roles) {
            try {
                ns.corporation.hireEmployee(DIV, ct, role);
            } catch {
                // Office at capacity or no funds; skip.
            }
        }
    }
}

/**
 * How many products the Real Estate division currently has.
 *
 * @param ns The Netscript API.
 * @return Integer count of products.
 */
function current_products(ns) {
    const org = new Corporation(ns);
    if (!org.has_division(DIV)) return 0;
    return org.all_products(DIV).length;
}

/**
 * The current max product slot count for the Real Estate division,
 * accounting for any Capacity research owned.
 *
 * @param ns The Netscript API.
 * @return Integer max product slots (3, 4, or 5).
 */
function max_product_slots(ns) {
    const org = new Corporation(ns);
    let cap = corp_t.product.INIT_TAU;
    if (org.has_research(DIV, corp.research.CAPACITY_I)) cap++;
    if (org.has_research(DIV, corp.research.CAPACITY_II)) cap++;
    return cap;
}

/**
 * Pick a random product name from the pool that the division does
 * not already have.  Returns null if all names are in use.
 *
 * @param ns The Netscript API.
 * @return A string product name, or null.
 */
function next_product_name(ns) {
    const org = new Corporation(ns);
    const used = new Set(org.all_products(DIV));
    const available = PROPERTY_NAMES.filter((n) => !used.has(n));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

/**
 * Wait for a product to finish development, polling every 1s and
 * logging progress every 30 cycles.  Mirrors the stuck-detection
 * logic in tobacco.js::wait_product so the script does not hang
 * silently if the developer city has 0 Engineers/Operations.
 *
 * @param ns The Netscript API.
 * @param name The product name to wait on.
 */
async function wait_product(ns, name) {
    const org = new Corporation(ns);
    let cycle = 0;
    let lastPct = -1;
    let noChangeStreak = 0;
    const MAX_STUCK_CHECKS = 10;
    while (!org.is_product_complete(DIV, name)) {
        if (cycle % 30 === 0) {
            const ct = ns.corporation.getDivision(DIV).cities[0];
            const p = ns.corporation.getProduct(DIV, ct, name);
            const pct = Math.floor(p.developmentProgress);
            const office = ns.corporation.getOffice(DIV, DEV_CITY);
            const eng = office.employeeJobs.Engineer ?? 0;
            const ops = office.employeeJobs.Operations ?? 0;
            const mgmt = office.employeeJobs.Management ?? 0;
            const progressed = pct !== lastPct;
            if (progressed) {
                noChangeStreak = 0;
            } else {
                noChangeStreak++;
            }
            lastPct = pct;
            if (noChangeStreak >= MAX_STUCK_CHECKS) {
                log(
                    ns,
                    `${DIV}/${name}: STUCK at ${pct}% for ${noChangeStreak * 30}s | ${eng}E+${ops}O+${mgmt}M in ${DEV_CITY} — assign Engineers/Operations/Mgmt to ${DEV_CITY} office in the UI to develop the product`
                );
                return;
            }
            if (progressed || noChangeStreak % 3 === 0) {
                log(
                    ns,
                    `${DIV}/${name}: ${pct}% | ${eng}E+${ops}O in ${DEV_CITY}${progressed ? "" : ` (no progress ${noChangeStreak * 30}s)`}`
                );
            }
        }
        cycle++;
        await ns.sleep(wait_t.SECOND);
    }
    log(ns, `${DIV}/${name}: development complete`);
}

/**
 * Sell a finished product in all cities at MP+10% with Market-TA
 * enabled (if TA research has been purchased).  Asserts the product
 * is complete; if not (e.g. wait_product bailed out due to STUCK),
 * the caller should skip the sell step rather than assert-failing.
 *
 * @param ns The Netscript API.
 * @param name The product name to sell.
 */
function sell_product(ns, name) {
    const org = new Corporation(ns);
    if (!org.is_product_complete(DIV, name)) {
        log(ns, `${DIV}/${name}: not complete; skip sell`);
        return;
    }
    for (const ct of cities.all) {
        if (!org.has_division_office(DIV, ct)) continue;
        ns.corporation.sellProduct(DIV, ct, name, SELL_AMOUNT, SELL_PRICE, false);
    }
    if (org.has_research(DIV, corp.research.TA_I)) {
        ns.corporation.setProductMarketTA1(DIV, name, true);
    }
    if (org.has_research(DIV, corp.research.TA_II)) {
        ns.corporation.setProductMarketTA2(DIV, name, true);
    }
}

/**
 * Buy a single AdVert round if affordable.  Uses a frugal threshold
 * (max 20% of corp funds per round); if funds are below that, skip.
 *
 * @param ns The Netscript API.
 */
function hire_advert_frugal(ns) {
    const org = new Corporation(ns);
    if (!org.has_division(DIV)) return;
    const FRUGAL_FRACTION = 0.2;
    let cost;
    try {
        cost = Math.ceil(ns.corporation.getHireAdVertCost(DIV));
    } catch {
        return;
    }
    const budget = org.funds() * FRUGAL_FRACTION;
    if (cost > budget) {
        log(
            ns,
            `${DIV}: AdVert cost $${cost.toFixed(0)} > ${FRUGAL_FRACTION * 100}% of funds ($${budget.toFixed(0)}); skipping`
        );
        return;
    }
    try {
        ns.corporation.hireAdVert(DIV);
        log(ns, `${DIV}: hired AdVert round (cost $${cost.toFixed(0)})`);
    } catch (e) {
        log(ns, `${DIV}: AdVert hire failed (${e.message || e})`);
    }
}

/**
 * Discontinue the lowest-rating product in the division, if there
 * is more than one product.  Used when we are at max product slots
 * and want to make room for a new (potentially higher-rating)
 * product.
 *
 * @param ns The Netscript API.
 * @return The name of the discontinued product, or null.
 */
function discontinue_lowest(ns) {
    const org = new Corporation(ns);
    const products = org.all_products(DIV);
    if (products.length === 0) return null;
    let lowestName = null;
    let lowestRating = Infinity;
    const ct = ns.corporation.getDivision(DIV).cities[0];
    for (const name of products) {
        const p = ns.corporation.getProduct(DIV, ct, name);
        const rating = p.rating ?? 0;
        if (rating < lowestRating) {
            lowestRating = rating;
            lowestName = name;
        }
    }
    if (lowestName === null) return null;
    ns.corporation.discontinueProduct(DIV, lowestName);
    return lowestName;
}

/**
 * Hire a single employee for a given role in each office that has
 * spare capacity.  Non-blocking — skips if office is full or funds
 * are insufficient.  Used by the maintenance loop to gradually grow
 * headcount without hanging.
 *
 * @param ns The Netscript API.
 * @param role The role to hire for.
 */
function hire_one_per_office(ns, role) {
    const org = new Corporation(ns);
    if (!org.has_division(DIV)) return;
    let hired = 0;
    for (const ct of cities.all) {
        if (!org.has_division_office(DIV, ct)) continue;
        const office = ns.corporation.getOffice(DIV, ct);
        if (office.numEmployees >= office.size) continue;
        try {
            ns.corporation.hireEmployee(DIV, ct, role);
            hired++;
        } catch {
            // No funds or office full; skip silently.
        }
    }
    if (hired > 0) {
        log(ns, `${DIV}: hired ${hired} ${role} across offices`);
    }
}

/**
 * Ensure the developer city (Aevum) has at least 10 Engineers and 10
 * Operations so the next product develops at a reasonable speed
 * (Product.ts:121 — prodMult depends on engrProd^0.34 + opProd^0.2).
 * Hires into Aevum only; if the office is at capacity, no upgrade
 * is attempted (frugal — manual upgrade in UI if needed).
 *
 * @param ns The Netscript API.
 */
function seed_dev_city(ns) {
    const org = new Corporation(ns);
    if (!org.has_division_office(DIV, DEV_CITY)) return;
    const office = ns.corporation.getOffice(DIV, DEV_CITY);
    const eng = office.employeeJobs.Engineer ?? 0;
    const ops = office.employeeJobs.Operations ?? 0;
    const hires = [];
    if (eng < 10 && office.numEmployees < office.size) {
        const want = Math.min(10 - eng, office.size - office.numEmployees);
        for (let i = 0; i < want; i++) {
            try {
                ns.corporation.hireEmployee(DIV, DEV_CITY, "Engineer");
                hires.push("E");
            } catch {
                break;
            }
        }
    }
    const office2 = ns.corporation.getOffice(DIV, DEV_CITY);
    if (ops < 10 && office2.numEmployees < office2.size) {
        const want = Math.min(10 - ops, office2.size - office2.numEmployees);
        for (let i = 0; i < want; i++) {
            try {
                ns.corporation.hireEmployee(DIV, DEV_CITY, "Operations");
                hires.push("O");
            } catch {
                break;
            }
        }
    }
    if (hires.length > 0) {
        log(
            ns,
            `${DIV}/${DEV_CITY}: seeded ${hires.filter((r) => r === "E").length}E + ${hires.filter((r) => r === "O").length}O`
        );
    }
}

/**
 * One maintenance iteration: hire a few employees, discontinue
 * lowest if at max, create a new Property, wait for it, sell it,
 * buy AdVert if affordable, then wait for offices to be vivacious.
 *
 * @param ns The Netscript API.
 */
async function update(ns) {
    const org = new Corporation(ns);
    log(
        ns,
        `${DIV}: maintenance cycle | funds $${org.funds().toFixed(0)} | products ${current_products(ns)}/${max_product_slots(ns)} | profit $${org.profit().toFixed(0)}/s`
    );
    if (!org.has_division(DIV)) {
        log(ns, `${DIV}: division missing; run setup first`);
        return;
    }
    seed_dev_city(ns);
    hire_one_per_office(ns, "Operations");
    hire_one_per_office(ns, "Engineer");
    const cap = max_product_slots(ns);
    if (current_products(ns) >= cap) {
        const name = discontinue_lowest(ns);
        if (name) log(ns, `${DIV}: discontinued lowest-rating product: ${name}`);
    }
    if (current_products(ns) >= cap) {
        log(ns, `${DIV}: still at max products after discontinue; skip this cycle`);
        return;
    }
    const name = next_product_name(ns);
    if (name === null) {
        log(ns, `${DIV}: all property names in use; discontinue manually`);
        return;
    }
    const investD = Math.max(1, Math.floor(org.funds() * corp_t.INVEST_MULT));
    const investM = Math.max(1, Math.floor(org.funds() * corp_t.INVEST_MULT));
    log(ns, `${DIV}/${name}: developing Property (invest $${
        investD.toFixed(0)
    } design / $${investM.toFixed(0)} marketing)`);
    try {
        ns.corporation.makeProduct(DIV, DEV_CITY, name, investD, investM);
    } catch (e) {
        log(ns, `${DIV}/${name}: makeProduct failed (${e.message || e})`);
        return;
    }
    await wait_product(ns, name);
    sell_product(ns, name);
    hire_advert_frugal(ns);
    log(ns, `${DIV}: waiting for each office to be vivacious`);
    await org.vivacious_office();
}

/**
 * Run the Real Estate maintenance loop forever.
 *
 * Usage: run /quack/corporation/realestate.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    ns.disableLog("sleep");
    assert(has_corporation_api(ns));
    const org = new Corporation(ns);
    assert(org.has_corp());
    assert(org.has_office_warehouse_api());
    setup_division(ns);
    await expand_offices(ns);
    enable_smart_supply(ns);
    initial_hire(ns);
    if (!org.has_research(DIV, corp.research.RND_LAB)) {
        log(
            ns,
            `${DIV}: warning — Hi-Tech R&D Laboratory research not purchased; product development will be slow and Market-TA auto-pricing will not work until TA.I/TA.II are owned.  Consider running a setup script (go.js/prep.js pattern) or buying RND_LAB + TA.I + TA.II manually in the Corporation UI.`
        );
    }
    let cycle = 0;
    for (;;) {
        cycle++;
        log(ns, `=== realestate maintenance cycle ${cycle} ===`);
        await update(ns);
        log(ns, `sleeping 10 minutes before next maintenance cycle`);
        await ns.sleep(10 * wait_t.MINUTE);
    }
}
