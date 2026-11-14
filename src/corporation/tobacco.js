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

import { bool } from "/quack/lib/constant/bool.js";
import { corp, corp_t, tobacco } from "/quack/lib/constant/corp.js";
import { cities } from "/quack/lib/constant/location.js";
import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { Corporation } from "/quack/lib/corporation/corp.js";
import {
    buy_research,
    create_product,
    discontinue_product,
    expand_city,
    finishing_product,
    has_all_research,
    hire,
    investment_offer,
    more_unlock_upgrade,
    new_hire,
    sell_product,
    smart_supply,
    to_number,
} from "/quack/lib/corporation/util.js";
import { create_file, log } from "/quack/lib/io.js";
import { has_corporation_api } from "/quack/lib/source.js";
import { assert, exec } from "/quack/lib/util.js";

/**
 * Whether the corporation is currently in bonus time.  Bonus time
 * runs many state cycles per real second, so frugal tea/party
 * thresholds (97/95) save money while still pinning morale/energy
 * near max via frequent topping.  In real time, cycles are scarce
 * (~2s each) and natural decay overwhelms the cheap-party finisher,
 * so we use the strict vivacious thresholds (corp_t.employee.ENERGY
 * and MORALE) and the more expensive $1M/emp party to actually
 * recover toward 100.  getBonusTime() returns milliseconds; we use
 * 60s as the "meaningful bonus time" cutoff — see agriculture.js
 * for the full rationale.
 *
 * @param ns The Netscript API.
 * @return True if the corp is currently in bonus time.
 */
function in_bonus_time(ns) {
    return (
        typeof ns.corporation.getBonusTime === "function"
        && ns.corporation.getBonusTime() > 60e3
    );
}

/**
 * Maintain all offices in all divisions for one tick: buy tea and
 * throw parties with bonus-time-aware thresholds (mirroring
 * agriculture.js::research).  Should be called once per corp state
 * cycle (e.g. after `nextUpdate()`) so tea/party tick at the game's
 * natural cadence — extra calls within the same cycle are silently
 * ignored by the game (Actions.ts:222-234, OfficeSpace.setTea /
 * setParty no-op if already pending).
 *
 * @param ns The Netscript API.
 */
function maintain_offices(ns) {
    const inBonus = in_bonus_time(ns);
    const teaThreshold = inBonus ? 97 : corp_t.employee.ENERGY;
    const partyThreshold = inBonus ? 95 : corp_t.employee.MORALE;
    const org = new Corporation(ns);
    let lowestMorale = Infinity;
    for (const d of org.all_divisions()) {
        for (const ct of cities.all) {
            if (!org.has_division_office(d, ct)) continue;
            const o = ns.corporation.getOffice(d, ct);
            if (o.avgMorale < lowestMorale) lowestMorale = o.avgMorale;
        }
    }
    const partyCost = inBonus
        ? lowestMorale < partyThreshold - 5
            ? 1e6
            : 1e5
        : 1e6;
    org.buy_tea_all(teaThreshold);
    org.party_all(partyThreshold, partyCost);
}

/**
 * Wait one corp state cycle.  Prefer nextUpdate() (resolves at the
 * next state boundary) so the loop ticks at the game's natural
 * cadence; fall back to a 1s sleep on older API versions.
 *
 * @param ns The Netscript API.
 */
async function next_cycle(ns) {
    if (typeof ns.corporation.nextUpdate === "function") {
        await ns.corporation.nextUpdate();
    } else {
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * What fraction of the corp's current funds we are willing to spend
 * on a single discretionary hire/upgrade/advert action.
 */
const FRUGAL_FRACTION = 0.2;

/**
 * Buy AdVert.inc advertising rounds to raise the Tobacco division's
 * sales multiplier (awareness), which determines what fraction of
 * produced goods actually sell.  A brand-new Tobacco division starts
 * with sales multiplier ~0.07 (7%), so without AdVert the first
 * products barely sell even at a high rating, and Tobacco profit
 * stays negative while expenses (salaries, warehouse, materials)
 * keep ticking — exactly what the user observed with Gutka: product
 * finished but profit even more negative.
 *
 * Idempotent: only tops up to `maxRounds` total based on
 * `getDivision(div).numAdVerts`, so calling it again later (e.g.
 * enhanced_product_cycle) is safe.  Frugal: each round must cost
 * less than `FRUGAL_FRACTION` of current funds; otherwise stops.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param maxRounds The maximum total AdVert rounds we want for this
 *     division.  AdVert's marginal benefit drops sharply after the
 *     first few rounds (awareness decays to a floor between buys
 *     and the cost scales ~$1B+ per round), so 5 rounds is plenty
 *     before the late game.
 */
async function hire_advert_burst(ns, div, maxRounds) {
    const org = new Corporation(ns);
    let bought = 0;
    let currentRounds;
    try {
        currentRounds = ns.corporation.getDivision(div).numAdVerts ?? 0;
    } catch {
        // Older API without numAdVerts; fall back to 0 and
        // rely on hire_advert's own funds check to stop us.
        currentRounds = 0;
    }
    while (currentRounds < maxRounds) {
        const cost = Math.ceil(ns.corporation.getHireAdVertCost(div));
        const budget = org.funds() * FRUGAL_FRACTION;
        if (cost > budget) {
            log(
                ns,
                `${div}: AdVert round ${currentRounds + 1}/${maxRounds} costs $${cost.toFixed(0)} > ${FRUGAL_FRACTION * 100}% of funds ($${budget.toFixed(0)}); stopping at ${currentRounds} rounds`
            );
            break;
        }
        if (!org.hire_advert(div)) {
            // hire_advert also checks `funds > cost`, so reaching
            // here with a false return means a race or funding
            // drop; safe to break.
            break;
        }
        currentRounds++;
        bought++;
        log(ns, `${div}: bought AdVert round ${currentRounds} (cost $${cost.toFixed(0)})`);
        await ns.sleep(wait_t.SECOND);
    }
    if (bought > 0) {
        log(ns, `${div}: AdVert burst done, now ${currentRounds}/${maxRounds} rounds`);
    }
}

/**
 * Try to push more Engineers and Operations employees into the
 * developer city (Aevum) so the product develops faster.  Product
 * progress per cycle is `marketCycles * 0.01 * prodMult` where
 * `prodMult = (engrProd^0.34 + opProd^0.2) * mgmtFactor`
 * (Product.ts:121).  Adding even a few more Engineers (which have
 * the higher exponent 0.34) meaningfully speeds up development,
 * which in turn reduces the long "profit is negative" wait window.
 *
 * Frugal and non-blocking:
 *   - Uses `bool.NO_WAIT` so the function returns immediately when
 *     the office is at capacity or funds are short, instead of
 *     hanging the loop.
 *   - Only upgrades the office if the upgrade cost is below
 *     `FRUGAL_FRACTION` of current funds.  We do NOT keep waiting
 *     for funds (the previous `bool.WAIT` path in `new_hire` could
 *     hang the script here).
 *   - Caps total Engineers + Operations in the developer city at
 *     `devCap` so we don't bloat salaries indefinitely.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 */
async function boost_developer_city(ns, div) {
    const org = new Corporation(ns);
    const ct = tobacco.DEVELOPER_CITY;
    if (!org.has_division_office(div, ct)) return;
    const office = ns.corporation.getOffice(div, ct);
    // Total production-employee cap for the developer city.  Past
    // this many Engineers + Operations, the marginal speedup is
    // small and salaries keep climbing.
    const devCap = 40;
    const curEng = office.employeeJobs.Engineer ?? 0;
    const curOps = office.employeeJobs.Operations ?? 0;
    if (curEng + curOps >= devCap) return;
    // Prefer Engineers (exponent 0.34 > Operations 0.2).
    const role = curEng <= curOps ? corp.job.ENGINEER : corp.job.OPERATIONS;
    // If office has spare capacity, just hire.
    if (office.numEmployees < office.size) {
        if (org.new_hire(div, ct, role)) {
            log(
                ns,
                `${div}/${ct}: +1 ${role} (now ${office.numEmployees + 1}/${office.size})`
            );
        }
        return;
    }
    // Office at capacity — upgrade only if affordable.
    const howmany = 1;
    const cost = ns.corporation.getOfficeSizeUpgradeCost(div, ct, howmany);
    if (cost > org.funds() * FRUGAL_FRACTION) return;
    if (!org.upgrade_office(div, ct, howmany)) return;
    if (org.new_hire(div, ct, role)) {
        log(
            ns,
            `${div}/${ct}: upgraded office +1 (cost $${cost.toFixed(0)}) and hired 1 ${role}`
        );
    }
}

/**
 * Hire up to `targetTotal` production employees (Engineer + Operations)
 * in the developer city, frugally, up-front before a product starts.
 * Unlike `boost_developer_city` (which adds 1 per call during the
 * wait loop), this blocks until the target is met or funds run out,
 * so the product starts development with a decent prodMult right
 * away.  Uses `bool.NO_WAIT` so it never hangs.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param targetTotal Target total of Engineers + Operations in the
 *     developer city.
 */
async function seed_developer_city(ns, div, targetTotal) {
    const org = new Corporation(ns);
    const ct = tobacco.DEVELOPER_CITY;
    if (!org.has_division_office(div, ct)) return;
    for (;;) {
        const office = ns.corporation.getOffice(div, ct);
        const curEng = office.employeeJobs.Engineer ?? 0;
        const curOps = office.employeeJobs.Operations ?? 0;
        if (curEng + curOps >= targetTotal) return;
        const role = curEng <= curOps ? corp.job.ENGINEER : corp.job.OPERATIONS;
        // If office has spare capacity, hire.
        if (office.numEmployees < office.size) {
            if (!org.new_hire(div, ct, role)) return;
            continue;
        }
        // Office at capacity — upgrade only if affordable.
        const howmany = 1;
        const cost = ns.corporation.getOfficeSizeUpgradeCost(div, ct, howmany);
        if (cost > org.funds() * FRUGAL_FRACTION) {
            log(
                ns,
                `${div}/${ct}: stop seeding at ${curEng + curOps} Eng+Ops (office upgrade $${cost.toFixed(0)} > ${FRUGAL_FRACTION * 100}% of funds)`
            );
            return;
        }
        if (!org.upgrade_office(div, ct, howmany)) return;
    }
}

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
 * Drain Research & Development down to a single token employee per
 * office and reassign everyone else to production/sales roles.
 * Called at the end of `tobacco.js::main`, right before spawning
 * janitor.js, because all wanted research has already been
 * purchased — keeping R&D headcount high would just burn salary
 * for no benefit (no research left to buy, no RP buffer needed).
 *
 * The opposite of the reassign block in `agriculture.js::research`
 * (which pushes employees INTO R&D to maximize RP throughput).
 * Here we push them OUT, into the roles that actually make money:
 * Operations (factory throughput), Engineer (product development
 * speed when the next product is created), Business (sales),
 * Management (prodMult multiplier and office efficiency).
 *
 * A single R&D employee is kept per office as a token so the role
 * is not fully empty (avoiding edge cases in the UI and leaving a
 * seed for any future research purchase).  In the developer city
 * (Aevum), the distribution is Engineer-heavy to maximize
 * `prodMult = (engrProd^0.34 + opProd^0.2) * mgmtFactor`
 * (Product.ts:121) for the next `create_product` call.  In other
 * cities, Operations-heavy for factory throughput (each
 *non-developer city is a production hub that feeds warehouse
* stock which ultimately sells).
*
* Uses `setJobAssignment(div, ct, role, amount)` which writes to
* `employeeNextJobs` applied at the next `process()` cycle.  The
* reassignment is done in two passes:
*   1. Set R&D to 1 (releasing everyone else into Unassigned).
*   2. Set each production role to its target (absorbing from
*      Unassigned).
* If a role target exceeds the number of available employees (e.g.
* office got smaller due to a bug, or totals don't match because
* of employees in Training), the excess employees are left in
* Unassigned — not harmful, just slightly suboptimal.
*
* @param ns The Netscript API.
*/
function redistribute_rnd(ns) {
    const org = new Corporation(ns);
    const div = corp.industry.TOBACCO;
    // Targets per office.  The sum of (Operations + Engineer +
    // Management + Business + 1 R&D) does NOT need to equal
    // numEmployees — any leftover employees stay in Unassigned,
    // which is fine (Unassigned employees contribute nothing but
    // also cost nothing extra).  R&D is pinned to 1.
    const dev_targets = {
        Operations: 10,
        Engineer: 30,
        Management: 10,
        Business: 5,
        "Research & Development": 1,
    };
    const nondev_targets = {
        Operations: 30,
        Engineer: 10,
        Management: 5,
        Business: 10,
        "Research & Development": 1,
    };
    for (const ct of cities.all) {
        if (!org.has_division_office(div, ct)) continue;
        const office = ns.corporation.getOffice(div, ct);
        const isDev = ct === tobacco.DEVELOPER_CITY;
        const targets = isDev ? dev_targets : nondev_targets;
        // Pass 1: drain R&D to 1, releasing everyone else to
        // Unassigned.
        const jobs = office.employeeJobs;
        const curRnd = jobs["Research & Development"] ?? 0;
        let drained = 0;
        if (curRnd > 1) {
            try {
                ns.corporation.setJobAssignment(
                    div,
                    ct,
                    "Research & Development",
                    1
                );
                drained = curRnd - 1;
            } catch {
                // R&D name not accepted by API; skip this office.
                continue;
            }
        }
        // Pass 2: fill each production role up to its target,
        // absorbing from Unassigned.
        const roleOrder = ["Operations", "Engineer", "Management", "Business"];
        let absorbed = 0;
        for (const role of roleOrder) {
            const cur = jobs[role] ?? 0;
            const target = targets[role];
            if (cur >= target) continue;
            const want = target - cur;
            try {
                ns.corporation.setJobAssignment(div, ct, role, target);
                absorbed += want;
            } catch {
                // Role name not accepted; skip.
                continue;
            }
        }
        if (drained > 0 || absorbed > 0) {
            log(
                ns,
                `${div}/${ct}: drained ${drained} from R&D, absorbed ${absorbed} into production${isDev ? " (dev city)" : ""}`
            );
        }
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
    // rating).  Use `has_max_products` (which respects Capacity research)
    // instead of `has_init_max_products` (constant 3) so we don't
    // discontinue prematurely when the cap has been raised to 4 or 5.
    const div = corp.industry.TOBACCO;
    if (has_max_products(ns)) {
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
 * Whether we have reached the maximum number of products for our
 * Tobacco division, taking into account any Capacity research that
 * has been purchased (Capacity.I adds +1 slot, Capacity.II adds
 * another +1, base is 3 — see Division.ts:46-52).  Used by
 * `enhanced_product_cycle` to decide whether we need to discontinue
 * a product before creating a new one.  Earlier this used
 * `has_init_max_products` (constant 3), which caused a bug: after
 * the script purchased Capacity.I/II, `maxProducts` became 5, but
 * `enhanced_product_cycle` still discontinued at length===3 —
 * including discontinue the just-finished product of the previous
 * round, because `discontinue_product` picks the lowest-rating
 * product and a brand-new product starts with a low rating.  The
 * user saw RYO get created, completed, sold, then immediately
 * discontinued at the start of round 5 (still length===3) and a
 * new product with the same name "RYO" created again — an infinite
 * discontinue+recreate loop, wasting dev time and funds.
 *
 * @param ns The Netscript API.
 * @return True if our Tobacco division is at its current max product
 *     capacity (3, 4, or 5 depending on Capacity research).
 */
function has_max_products(ns) {
    const org = new Corporation(ns);
    const div = corp.industry.TOBACCO;
    let cap = corp_t.product.INIT_TAU;
    if (org.has_research(div, corp.research.CAPACITY_I)) cap++;
    if (org.has_research(div, corp.research.CAPACITY_II)) cap++;
    return org.all_products(div).length >= cap;
}

/**
 * Sell any existing Tobacco products that have already finished
 * development but were never put up for sale (desiredSellAmount is
 * null).  This happens when a previous run of the script was killed
 * between `wait_product` (product complete) and `sell_product` (the
 * sellProduct API call), so on the next run the product is sitting in
 * the warehouse with 0 sales, and `product_cycle` short-circuits via
 * `has_init_max_products` (which counts the unfinished/unsold product
 * toward the 3-product cap, so round "one" returns immediately
 * without selling anything).  Without this rescue, the product stays
 * at "Sell (0.000/0.000)" forever and Tobacco revenue is zero while
 * expenses keep ticking.
 *
 * Safe to call repeatedly: only touches products whose
 * desiredSellAmount is null and which are actually complete.
 *
 * @param ns The Netscript API.
 */
function sell_existing_products(ns) {
    const org = new Corporation(ns);
    const div = corp.industry.TOBACCO;
    const products = org.all_products(div);
    if (products.length === 0) return;
    const ct0 = ns.corporation.getDivision(div).cities[0];
    let rescued = 0;
    for (const name of products) {
        if (!org.is_product_complete(div, name)) continue;
        // In Bitburner 3.0+ the Product object returned to scripts has a
        // flat `desiredSellAmount` field (no longer nested under
        // `cityData[ct]`, which is now internal-only — see
        // NetscriptFunctions/Corporation.ts:260-278).  A product that
        // was never put up for sale has `desiredSellAmount === 0`
        // (the default initializer in Product.ts:79 — `0 as number |
        // string`), NOT `null`.  Once `sellProduct` is called with
        // `amt="MAX"`, the field becomes the string `"MAX"`.  So the
        // "needs rescue" signal is any falsy value: 0, "", null, or
        // undefined.  A truthy check skips products that are already
        // on sale.
        const p = ns.corporation.getProduct(div, ct0, name);
        if (p.desiredSellAmount) continue;
        log(ns, `${div}/${name}: rescue-selling existing finished-but-unsold product (desiredSellAmount=${JSON.stringify(p.desiredSellAmount)})`);
        sell_product(ns, div, name);
        rescued++;
    }
    if (rescued > 0) {
        log(ns, `${div}: rescue-sold ${rescued} product(s)`);
    }
}

/**
 * Hire a crop of employees for our Tobacco division.
 *
 * Use `bool.NO_WAIT` so hiring is non-blocking: if the corp cannot
 * afford an office upgrade (to make room for more employees) or
 * cannot afford the hire itself, the call returns immediately and
 * we move on.  Earlier this used `bool.WAIT`, which made
 * `new_hire`'s internal `while (!upgrade_office(...))` /
 * `while (!hireEmployee(...))` loops spin forever with no log when
 * the corp was funds-starved — same bug pattern fixed in
 * `prep.js::upgrade_round_one`, `tobacco.js::upgrade`, and
 * `util.js::more_unlock_upgrade`.  Stage 5 targets (e.g. 100
 * employees in Aevum) require many office size upgrades that can
 * each cost billions; with $82B in funds the script hung silently
 * at "Round 5 of hiring" until the user killed it.
 *
 * @param ns The Netscript API.
 * @param n A string representing the hiring stage.  If it is stage 1 of hiring,
 *     pass in the word "one", and so on.
 */
async function hire_employees(ns, n) {
    log(ns, `Round ${to_number(n)} of hiring`);
    const div = corp.industry.TOBACCO;
    const org = new Corporation(ns);
    let hiredTotal = 0;
    let skippedTotal = 0;
    const roleMap = [
        { key: "BUSINESS", job: corp.job.BUSINESS, counter: "num_business" },
        { key: "ENGINEER", job: corp.job.ENGINEER, counter: "num_engineer" },
        { key: "MANAGEMENT", job: corp.job.MANAGEMENT, counter: "num_management" },
        { key: "OPERATIONS", job: corp.job.OPERATIONS, counter: "num_operations" },
        { key: "RND", job: corp.job.RND, counter: "num_rnd" },
        { key: "TRAIN", job: corp.job.TRAIN, counter: "num_training" },
        { key: "IDLE", job: corp.job.IDLE, counter: "num_idle" },
    ];
    for (const ct of cities.all) {
        if (!org.has_division_office(div, ct)) continue;
        const stage = tobacco[ct].hire.stage[n];
        for (const r of roleMap) {
            const target = stage[r.key];
            let cur = org[r.counter](div, ct);
            for (let i = cur; i < target; i++) {
                await new_hire(ns, div, ct, r.job, bool.NO_WAIT);
                const after = org[r.counter](div, ct);
                if (after > cur) {
                    hiredTotal++;
                    cur = after;
                } else {
                    skippedTotal++;
                }
            }
        }
    }
    log(
        ns,
        `${div}: hired ${hiredTotal}, skipped ${skippedTotal} (insufficient funds or office capacity) for round ${to_number(n)}`
    );
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
    // Top up R&D staffing once so RP starts accumulating.
    await hire(ns, div, bool.NO_WAIT);
    let cycle = 0;
    while (!has_all_research(ns, div, res)) {
        maintain_offices(ns);
        // Strict priority: buy only the highest-priority research in
        // `res` that is still wanted and available.  If that research
        // is not yet affordable, wait — do NOT skip it to buy a
        // cheaper lower-priority one (e.g. DRONE before DRUG), since
        // the `res` array expresses the intended purchase order.
        for (const r of res) {
            if (org.has_research(div, r)) continue;
            if (!org.is_research_available(div, r)) continue;
            if (org.has_enough_research_points(div, r)) {
                log(ns, `${div}: buying research: ${r}`);
                await buy_research(ns, div, r);
            }
            break;
        }
        cycle++;
        if (cycle % 30 === 0) {
            const rp = org.division_research(div);
            let nextTarget = "(none)";
            for (const r of res) {
                if (org.has_research(div, r)) continue;
                if (!org.is_research_available(div, r)) continue;
                nextTarget = r;
                break;
            }
            const targetCost = nextTarget === "(none)"
                ? 0
                : org.research_cost(div, nextTarget);
            const targetNeeded = nextTarget === "(none)"
                ? 0
                : Math.ceil(corp_t.RESEARCH_MULT * targetCost);
            const inBonus = in_bonus_time(ns);
            log(
                ns,
                `${div}: RP ${rp.toFixed(0)}/${targetNeeded} for ${nextTarget} | funds ${org.funds().toFixed(0)} | ${inBonus ? "BONUS" : "real"}`
            );
        }
        await next_cycle(ns);
    }
    log(ns, `${div}: all extra research purchased`);
}

/**
 * The product cycle.  This includes hiring, development, and selling.
 *
 * If a product from a previous (interrupted) run is still in
 * development, this function adopts it and resumes the wait_product
 * phase instead of creating a new product.  This avoids wasting the
 * research time already invested and prevents the script from
 * creating extra products that would push the division past the
 * initial product cap.
 *
 * @param ns The Netscript API.
 * @param n A string representing the product round.  If it is the product in
 *     round 1, pass in the word "one", and so on.
 */
async function product_cycle(ns, n) {
    const div = corp.industry.TOBACCO;
    const org = new Corporation(ns);
    const products = org.all_products(div);
    let resumeName = null;
    for (const p of products) {
        if (!org.is_product_complete(div, p)) {
            resumeName = p;
            break;
        }
    }
    if (resumeName === null && has_init_max_products(ns)) {
        return;
    }
    if (resumeName === null && products.length >= to_number(n)) {
        return;
    }
    log(ns, `Round ${to_number(n)} of product development`);
    await hire_employees(ns, n);
    // Raise the Tobacco division's sales multiplier BEFORE the
    // product is finished so that when it sells, awareness is already
    // up.  A brand-new Tobacco division starts at ~0.07 sales
    // multiplier, capping revenue at a fraction of production no
    // matter the product rating or sell price.  Without AdVert, the
    // first product finishes but Tobacco profit is even more negative
    // than before (extra salaries + materials + warehouse, no
    // revenue).  5 rounds roughly takes the multiplier from 0.07 to
    // 0.4-0.6 and is frugal (each round costs < FRUGAL_FRACTION of
    // funds).
    await hire_advert_burst(ns, div, 5);
    // Seed the developer city (Aevum) with more Engineers/Operations
    // so the product develops faster — prodMult in
    // Product.ts:121 depends on Engineer and Operations production.
    // Target 25 Eng+Ops as a starting point (boost_developer_city
    // below will add more during the wait if affordable).
    await seed_developer_city(ns, div, 25);
    let name;
    if (resumeName) {
        log(ns, `${div}: resuming development of existing product: ${resumeName}`);
        name = resumeName;
    } else {
        name = create_product(ns, div);
        log(ns, `${div}: creating product: ${name}`);
    }
    await upgrade(ns, n);
    log(ns, `${div}: waiting for product to complete: ${name}`);
    await wait_product(ns, div, name);
    // One more AdVert burst before selling, in case awareness
    // decayed during the long product development wait.  Idempotent
    // (caps at the same maxRounds total).
    await hire_advert_burst(ns, div, 5);
    log(ns, `${div}: selling product in all cities: ${name}`);
    sell_product(ns, div, name);
    // Wait a few state cycles and then log how much actually sold
    // in each city.  Without this, the user sees "production already
    // done but not sold" because `actualSellAmount` is computed in
    // the SALE state cycle, not instantaneously when `sellProduct`
    // is called.  A short monitor here surfaces actual sales (and
    // flags any city where nothing is selling due to, e.g., low
    // awareness, smartSupply not feeding the right materials, or
    // warehouse lack of stock).
    await monitor_product_sales(ns, div, name, 5);
}

/**
 * Log the actual sale amount and stock for each city of a finished
 * product across `ticks` state cycles.  This is a diagnostic helper
 * to surface "production done but not selling" situations where
 * the product is sitting in warehouses because:
 *
 *   - awareness (AdVert) is too low → `advertisingFactor` small →
 *     `maxSellPerSecond` small (Division.ts:330-340);
 *   - sell price `MP+10%` is too high vs current demand → low markup
 *     multiplier;
 *   - warehouse is empty (smartSupply not configured, materials not
 *     being bought) → no production happening post-finish.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param name The product name.
 * @param ticks How many state cycles to sample sales over before
 *     returning to the caller.  Each cycle waits `next_cycle`.
 */
async function monitor_product_sales(ns, div, name, ticks) {
    const org = new Corporation(ns);
    for (let i = 0; i < ticks; i++) {
        await next_cycle(ns);
    }
    const divCities = ns.corporation.getDivision(div).cities;
    const sales = [];
    let totalSold = 0;
    let totalStored = 0;
    for (const ct of divCities) {
        // In 3.0+ the Product object returned to scripts has flat
        // per-city fields (the city is the one passed to getProduct).
        // The internal `cityData[ct]` map is no longer exposed — see
        // NetscriptFunctions/Corporation.ts:260-278.
        const p = ns.corporation.getProduct(div, ct, name);
        const sold = p.actualSellAmount ?? 0;
        const stored = p.stored ?? 0;
        totalSold += sold;
        totalStored += stored;
        sales.push(`${ct.slice(0, 4)}:${sold.toFixed(0)}/s,${stored.toFixed(0)}stk`);
    }
    const { revenue, expenses } = ns.corporation.getCorporation();
    log(
        ns,
        `${div}/${name}: after ${ticks} cycles | sold ${totalSold.toFixed(0)}/s, stock ${totalStored.toFixed(0)} | ${sales.join(" ")} | corp rev $${revenue.toFixed(0)}/s, exp $${expenses.toFixed(0)}/s`
    );
}

/**
 * Wait for a product to finish development, but in the meantime
 * maintain the corporation: buy tea + throw parties (with bonus-time
 * aware thresholds, mirroring agriculture.js::research) to keep
 * morale/energy at peak so Engineer/Operations throughput stays
 * high and the product develops faster.  Also log progress
 * periodically so the user knows the script is not stuck.  Earlier
 * this just called finishing_product(), which polls
 * is_product_complete every 1 second with no log — for a product
 * that takes 1-2 minutes of real time (or 10+ in real time without
 * bonus) the user saw "waiting for product to complete: X" and then
 * nothing, while Tobacco profit was negative (no product sold yet,
 * but salaries + warehouse + materials expenses kept ticking).
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param name A string representing the name of the product.
 */
async function wait_product(ns, div, name) {
    const org = new Corporation(ns);
    let cycle = 0;
    let lastPct = -1;
    let noChangeStreak = 0;
    // Number of consecutive 30-cycle checks with no integer progress
    // change after which we declare the product "stuck" and bail out.
    // 10 checks = 300 cycles = ~600s real / ~60s bonus.  Past this
    // point the user is paying salaries + warehouse costs for a
    // product that will never complete (typically because Aevum has
    // 0 Engineers/Operations — Product.ts:109 returns early when
    // engrProd + opProd + mgmtProd <= 0, so progress stays frozen).
    const MAX_NO_CHANGE = 10;
    while (!org.is_product_complete(div, name)) {
        maintain_offices(ns);
        // Every 30 cycles, try to push more Engineers/Operations
        // into the developer city (Aevum) to speed up the product's
        // development.  boost_developer_city is frugal and
        // non-blocking: it just returns if the office is full and
        // the upgrade is not affordable, so the wait loop keeps
        // ticking.
        if (cycle % 30 === 0) {
            await boost_developer_city(ns, div);
            const ct = ns.corporation.getDivision(div).cities[0];
            const p = ns.corporation.getProduct(div, ct, name);
            const pct = Math.floor(p.developmentProgress);
            const profit = org.profit();
            const inBonus = in_bonus_time(ns);
            const ae = ns.corporation.getOffice(div, tobacco.DEVELOPER_CITY);
            const eng = ae.employeeJobs.Engineer ?? 0;
            const ops = ae.employeeJobs.Operations ?? 0;
            const mgmt = ae.employeeJobs.Management ?? 0;
            // Track whether progress improved this check.  We log
            // when progress improved, AND when stuck (so the user
            // can see why development is frozen — typical cause:
            // Aevum has 0 Engineers/Operations, so Product.ts:109
            // returns early with no progress increment).
            const progressed = pct !== lastPct;
            if (progressed) {
                noChangeStreak = 0;
            } else {
                noChangeStreak++;
            }
            lastPct = pct;
            if (noChangeStreak >= MAX_NO_CHANGE) {
                log(
                    ns,
                    `${div}/${name}: STUCK at ${pct}% for ${noChangeStreak * 30} cycles | ${eng}E+${ops}O+${mgmt}M in ${tobacco.DEVELOPER_CITY} | corp profit $${profit.toFixed(0)}/s | funds ${org.funds().toFixed(0)} | ${inBonus ? "BONUS" : "real"} — Aevum needs Engineers/Operations/Mgmt assigned to develop the product; check office assignments in the UI`
                );
                break;
            }
            // Log every progress change, plus a "no progress"
            // heartbeat every 3rd stuck check (so the user sees the
            // script is alive and can diagnose 0E+0O).  3 was chosen
            // to avoid spam — 3 checks = 90 cycles = ~180s real /
            // ~18s bonus, plenty for a "is this stuck?" signal.
            if (progressed || noChangeStreak % 3 === 0) {
                log(
                    ns,
                    `${div}/${name}: ${pct}% | corp profit $${profit.toFixed(0)}/s | funds ${org.funds().toFixed(0)} | ${eng}E+${ops}O in ${tobacco.DEVELOPER_CITY} | ${inBonus ? "BONUS" : "real"}${progressed ? "" : ` (no progress ${noChangeStreak * 30}cyc)`}`
                );
            }
        }
        cycle++;
        await next_cycle(ns);
    }
    log(ns, `${div}/${name}: development complete`);
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
    // Hire one R&D employee per non-developer city up-front (one shot,
    // not per-cycle) so RP starts accumulating.  The developer city
    // (Aevum) is left alone so its Engineers/Operations keep making
    // products.
    const city = cities.all.filter((ct) => ct !== tobacco.DEVELOPER_CITY);
    for (const ct of city) {
        await new_hire(ns, div, ct, corp.job.RND, bool.WAIT);
    }
    let cycle = 0;
    while (!res.every(has_research)) {
        maintain_offices(ns);
        // Try to buy RND_LAB first (prereq for TA.I/TA.II).
        if (!org.has_research(div, lab)) {
            if (org.has_enough_research_points(div, lab)) {
                log(ns, `${div}: buying research: ${lab}`);
                await buy_research(ns, div, lab);
            }
        } else {
            // Buy TA.I and TA.II as RP allow.
            for (const r of res) {
                if (org.has_research(div, r)) continue;
                if (org.has_enough_research_points(div, r)) {
                    log(ns, `${div}: buying research: ${r}`);
                    await buy_research(ns, div, r);
                }
            }
        }
        cycle++;
        if (cycle % 30 === 0) {
            const rp = org.division_research(div);
            let nextTarget = "(none)";
            for (const r of res) {
                if (org.has_research(div, r)) continue;
                nextTarget = r;
                break;
            }
            const targetCost = nextTarget === "(none)"
                ? 0
                : org.research_cost(div, nextTarget);
            const targetNeeded = nextTarget === "(none)"
                ? 0
                : Math.ceil(corp_t.RESEARCH_MULT * targetCost);
            const inBonus = in_bonus_time(ns);
            log(
                ns,
                `${div}: RP ${rp.toFixed(0)}/${targetNeeded} for ${nextTarget} | funds ${org.funds().toFixed(0)} | ${inBonus ? "BONUS" : "real"}`
            );
        }
        await next_cycle(ns);
    }
    log(ns, `${div}: RND_LAB + TA.I + TA.II all purchased`);
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
        "FocusWires",
        "Neural Accelerators",
        "Speech Processor Implants",
        "Nuoptimal Nootropic Injector Implants",
        "Project Insight",
        "Wilson Analytics",
    ];
    log(ns, `Round ${to_number(n)} of upgrades: ${upg.join(", ")}`);
    const focus_lvl = tobacco.upgrade.round[n].FocusWires;
    const neural_lvl = tobacco.upgrade.round[n]["Neural Accelerators"];
    const speech_lvl = tobacco.upgrade.round[n]["Speech Processor Implants"];
    // eslint-disable-next-line max-len
    const injector_lvl = tobacco.upgrade.round[n]["Nuoptimal Nootropic Injector Implants"];
    const insight_lvl = tobacco.upgrade.round[n]["Project Insight"];
    const analytic_lvl = tobacco.upgrade.round[n]["Wilson Analytics"];
    const org = new Corporation(ns);
    // Funds-starvation detection.  Earlier this was a plain
    // `for(;;)` that just kept calling `level_upgrade` every 1s
    // without checking the return value.  `level_upgrade` returns
    // FAILURE silently when funds are below the upgrade cost, so
    // the script hung forever at "Round X of upgrades: ..." with
    // no further log — exactly the "no log" symptom the user saw.
    // Now we track the sum of upgrade levels across all 6 upgrades;
    // if 60 ticks (~60s) pass with no level change, we break out
    // (the corp is funds-starved) and let the rest of the script
    // proceed — the upgrades will be topped up later by
    // janitor.js::level_upgrade once the corp is profitable.
    let noChangeTicks = 0;
    let lastTotalLevel = -1;
    const MAX_NO_CHANGE = 60;
    for (;;) {
        const done =
            org.level(corp.upgrade.FOCUS) >= focus_lvl
            && org.level(corp.upgrade.NEURAL) >= neural_lvl
            && org.level(corp.upgrade.SPEECH) >= speech_lvl
            && org.level(corp.upgrade.INJECTOR) >= injector_lvl
            && org.level(corp.upgrade.INSIGHT) >= insight_lvl
            && org.level(corp.upgrade.ANALYTIC) >= analytic_lvl;
        if (done) break;
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
        const totalLevel =
            org.level(corp.upgrade.FOCUS)
            + org.level(corp.upgrade.NEURAL)
            + org.level(corp.upgrade.SPEECH)
            + org.level(corp.upgrade.INJECTOR)
            + org.level(corp.upgrade.INSIGHT)
            + org.level(corp.upgrade.ANALYTIC);
        if (totalLevel === lastTotalLevel) {
            noChangeTicks++;
        } else {
            noChangeTicks = 0;
            lastTotalLevel = totalLevel;
        }
        if (noChangeTicks >= MAX_NO_CHANGE) {
            log(
                ns,
                `Round ${to_number(n)}: funds-starved, ${noChangeTicks}s with no level change; deferring remaining levels to janitor.js`
            );
            log(
                ns,
                `levels: F${org.level(corp.upgrade.FOCUS)}/${focus_lvl} N${org.level(corp.upgrade.NEURAL)}/${neural_lvl} S${org.level(corp.upgrade.SPEECH)}/${speech_lvl} I${org.level(corp.upgrade.INJECTOR)}/${injector_lvl} P${org.level(corp.upgrade.INSIGHT)}/${insight_lvl} W${org.level(corp.upgrade.ANALYTIC)}/${analytic_lvl} | funds ${org.funds().toFixed(0)}`
            );
            break;
        }
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * Branch out into the Tobacco industry and develop various products.
 *
 * Usage: run quack/corporation/tobacco.js
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
    // Resume support.  The TOBA marker file doubles as a phase
    // checkpoint: each major phase overwrites it with the next
    // phase integer.  On re-run we read it and skip phases that
    // already completed.  Without this the script re-ran round 4
    // every restart — the discontinue+create churn in
    // `enhanced_product_cycle` drops the product count back below
    // the round number, defeating the `length >= to_number(n)`
    // short-circuit in `product_cycle`.
    //
    // Phase values:
    //   10  setup_division + expand_city + smart_supply done
    //   20  sell_existing_products done
    //   30  investment_offer("three") done (or already done)
    //   40  product_cycle("one"/"two"/"three") done
    //   50  investment_offer("four") done, research() done
    //   60  enhanced rounds 4/5/6 done
    //   70  before_going_public done
    //   80  redistribute_rnd done
    //   (rm) final, ready to spawn janitor
    const setPhase = (p) => ns.write(corp.TOBA, String(p), "w");
    let phase = 0;
    if (ns.fileExists(corp.TOBA, home)) {
        const prior = parseInt(ns.read(corp.TOBA), 10);
        if (!isNaN(prior) && prior > 0) {
            phase = prior;
            log(ns, `${corp.TOBA}: resuming from phase ${phase}`);
        }
    }
    if (phase < 10) {
        // Create and manage our Tobacco division.
        create_file(ns, corp.TOBA, "10");
        setup_division(ns);
        const div = corp.industry.TOBACCO;
        const new_office = await expand_city(ns, div);
        smart_supply(ns);
        if (new_office.length > 0) {
            log(ns, `${div}: expanded to these cities: ${new_office.join(", ")}`);
        }
    }
    if (phase < 20) {
        setPhase(20);
        // Rescue any products left over from a previous run that finished
        // development but were never put up for sale (e.g. the previous
        // script was killed during the wait_product phase).  Without this
        // they sit at "Sell (0.000/0.000)" forever and `product_cycle`
        // short-circuits via `has_init_max_products`, so revenue is zero
        // while expenses keep ticking.
        sell_existing_products(ns);
    }
    if (phase < 30) {
        await investment_offer(ns, "three");
        setPhase(30);
    }
    if (phase < 40) {
        await product_cycle(ns, "one");
        await product_cycle(ns, "two");
        await product_cycle(ns, "three");
        setPhase(40);
    }
    if (phase < 50) {
        await investment_offer(ns, "four");
        await research(ns);
        setPhase(50);
    }
    if (phase < 60) {
        const round = ["four", "five", "six"];
        for (const n of round) {
            await enhanced_product_cycle(ns, n);
        }
        setPhase(60);
    }
    if (phase < 70) {
        // Some last minute house keeping.
        await before_going_public(ns);
        setPhase(70);
    }
    if (phase < 80) {
        // Reposition employees: drain R&D down to 1 per office and
        // refill production roles.  With all scientific research
        // already purchased, a large R&D headcount only wastes
        // salary.  See `redistribute_rnd` for the full rationale.
        redistribute_rnd(ns);
        setPhase(80);
    }
    ns.rm(corp.TOBA, home);
    // Spawn janitor.js as the maintenance script.  Use ns.spawn so this script
    // exits first to avoid stacking RAM.
    log(ns, "Spawning /quack/corporation/janitor.js ...");
    ns.spawn("/quack/corporation/janitor.js", 1);
}
