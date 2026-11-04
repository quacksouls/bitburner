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
import { agriculture, corp, corp_t } from "/quack/lib/constant/corp.js";
import { cities } from "/quack/lib/constant/location.js";
import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { Corporation } from "/quack/lib/corporation/corp.js";
import {
    hire,
    buy_market_ta,
    buy_research,
    has_all_research,
} from "/quack/lib/corporation/util.js";
import { create_file, log } from "/quack/lib/io.js";
import { has_corporation_api } from "/quack/lib/source.js";
import { assert } from "/quack/lib/util.js";

/**
 * Develop the research unit in each office.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param res An array of names of research we care about.
 */
async function research(ns, div, res) {
    log(ns, `${div}: expand the research unit of each office`);
    await hire(ns, div, bool.NO_WAIT);
    // Ensure each office has at least one R&D employee; without R&D
    // body, research points do not accumulate.  Prefer to reassign an
    // existing employee from another role rather than hiring a new one
    // (which costs salary and may push the office past capacity,
    // triggering an expensive office upgrade).  Preference order for
    // the donor role: Unassigned > Operations > Engineer > Management >
    // Business (i.e. take from where we have the most slack first).
    const org = new Corporation(ns);
    const donorRoles = [
        "Unassigned",
        "Operations",
        "Engineer",
        "Management",
        "Business",
    ];
    cities.all.forEach((ct) => {
        if (!org.has_division_office(div, ct)) return;
        const office = ns.corporation.getOffice(div, ct);
        const rndCount = office.employeeJobs["Research & Development"] ?? 0;
        if (rndCount > 0) return;
        // Try to take 1 employee from a donor role that has spare
        // employees, in preference order.  setJobAssignment sets the
        // total count for that role (not a delta), so we decrement the
        // donor's count by 1 and increment R&D by 1.
        for (const role of donorRoles) {
            const count = office.employeeJobs[role] ?? 0;
            if (count > 0) {
                ns.corporation.setJobAssignment(div, ct, role, count - 1);
                ns.corporation.setJobAssignment(
                    div, ct, "Research & Development", rndCount + 1
                );
                log(ns, `${div}/${ct}: reassigned 1 ${role} -> Research & Development`);
                return;
            }
        }
        // No donor available (office empty or all in Training/Intern);
        // as a last resort, hire directly into R&D.
        try {
            ns.corporation.hireEmployee(div, ct, "Research & Development");
            log(ns, `${div}/${ct}: hired 1 employee directly into Research & Development`);
        } catch {
            // Office at capacity or no funds; skip this office.
        }
    });
    // Single maintenance + research-buying loop.  Earlier this only
    // wrapped the wait for Hi-Tech R&D Laboratory: once RND_LAB was
    // bought the loop exited, ran setup_market_ta/buy_market_ta once,
    // returned to main() which slept 10 minutes, then repeated.  In
    // the 10-minute gap (and during the wait for TA.I/TA.II RP) NO
    // tea/party was bought, so morale/energy slowly decayed to the
    // minEmployeeDecay floor of 10 (OfficeSpace.ts:106).  Now the loop
    // stays alive as long as we still have research to buy in `res`,
    // buying tea/party every state cycle so R&D throughput stays at
    // peak and morale/energy are pinned near 100 the whole time.
    //
    // A "state cycle" is 10 game cycles = ~2s real, ~200ms in bonus
    // time.  nextUpdate() resolves at the next state boundary.  The
    // game enforces one tea and one party per office per state cycle
    // (Actions.ts:222-234), so calling each cycle is exactly the right
    // cadence — extra calls are silently ignored.
    //
    // Thresholds adapt to bonus time:
    //
    // - BONUS TIME (getBonusTime() > 60s): many cycles per real second
    //   absorb wider oscillation, so frugal thresholds (97 tea / 95
    //   party) save money across thousands of cycles while keeping
    //   morale/energy in the 95-99 band — good enough for R&D throughput
    //   (prodBase = morale*energy*1e-4, so 95/95 is ~90% of 100/100).
    //
    // - REAL TIME: cycles are scarce (~2s each) and the natural decay
    //   (perfMult=0.998 when no interns, OfficeSpace.ts:77-110)
    //   overwhelms the cheap-party finisher ($100k/emp = mult 1.01 ≈
    //   +0.6 morale/cycle).  If we used 97/95 here the office would
    //   drift to 95-97 and the +0.6 finisher could not recover it to
    //   100 — morale/energy would "not climb".  Using the strict
    //   vivacious thresholds (corp_t.employee.ENERGY=99.998 /
    //   MORALE=100) buys tea/party every cycle that morale/energy is
    //   not maxed, which is what actually pins the office at 100 and
    //   recovers it from a deep crash (e.g. morale=10 → 100 in ~10-15
    //   cycles = ~20-30s real).  Cost is bounded by the small cycle
    //   count.  Party cost is always $1M/emp (mult 1.1, +~8
    //   morale/cycle) in real time so recovery is fast.
    //
    // getBonusTime() returns MILLISECONDS (NetscriptDefinitions.d.ts
    // ~10722).  Use 60s as the "we have meaningful bonus time" cutoff.
    while (!has_all_research(ns, div, res)) {
        const inBonus =
            typeof ns.corporation.getBonusTime === "function" &&
            ns.corporation.getBonusTime() > 60e3;
        const teaThreshold = inBonus ? 97 : corp_t.employee.ENERGY;
        const partyThreshold = inBonus ? 95 : corp_t.employee.MORALE;
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
        // Try to buy any affordable research we still want.  RND_LAB
        // must come first (other research has it as prerequisite); once
        // owned, try buy_market_ta (TA.I + TA.II) and then any other
        // research in `res` whose prerequisites are satisfied.
        if (!org.has_research(div, corp.research.RND_LAB)) {
            if (org.has_enough_research_points(div, corp.research.RND_LAB)) {
                log(ns, `${div}: buying research: ${corp.research.RND_LAB}`);
                await buy_research(ns, div, corp.research.RND_LAB);
            }
        } else {
            // Enable market TA toggles on sold materials (idempotent;
            // only toggles on when the research is owned).
            setup_market_ta(ns, div);
            buy_market_ta(ns, div);
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
        }
        // Sleep until the next corp state cycle so tea/party/research
        // purchases tick at the game's natural cadence.
        if (typeof ns.corporation.nextUpdate === "function") {
            await ns.corporation.nextUpdate();
        } else {
            await ns.sleep(wait_t.SECOND);
        }
    }
    // After the loop, all research in `res` is owned.  Apply the
    // market-TA toggles one final time to be safe (idempotent).
    setup_market_ta(ns, div);
}

/**
 * Enable both versions of Market TA for all materials sold by the given
 * division.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 */
function setup_market_ta(ns, div) {
    const org = new Corporation(ns);
    const res = [corp.research.TA_I, corp.research.TA_II];
    const has_research = (r) => org.has_research(div, r);
    if (res.some(has_research)) {
        cities.all.forEach((ct) => {
            agriculture.material.sold.forEach((mat) => {
                org.enable_market_ta(div, bool.NOT_PRODUCT, mat, ct);
            });
        });
    }
}

/**
 * Develop our Agriculture division.
 *
 * Usage: run quack/corporation/agriculture.js
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
    // The research we care about.
    create_file(ns, corp.AGRI, ns.getScriptName());
    const res = [
        // Top priority.
        // The research corp.research.RND_LAB should be handled by the function
        // setup_research_lab().
        corp.research.RND_LAB,
        // The next 2 research should be handled by the function
        // buy_market_ta().
        corp.research.TA_I,
        corp.research.TA_II,
        // Employee research.
        corp.research.BREW,
        corp.research.PARTY,
        corp.research.DRUG,
        corp.research.INJECT,
        corp.research.JUICE,
        corp.research.OVERCLOCK,
        corp.research.STIMULATE,
        // Division research.
        corp.research.DRONE,
        corp.research.DRONE_ASSEMBLY,
        corp.research.DRONE_TRANSPORT,
        corp.research.ASSEMBLER,
        corp.research.CAPACITY_I,
        corp.research.CAPACITY_II,
        corp.research.FULCRUM,
    ];
    // Develop our research unit so we can buy all research we care about.
    const div = corp.industry.AGRI;
    for (;;) {
        if (has_all_research(ns, div, res)) {
            break;
        }
        await research(ns, div, res);
        await ns.sleep(10 * wait_t.MINUTE);
    }
    log(ns, `${div}: all research units fully developed`);
    ns.rm(corp.AGRI, home);
    // Spawn the next script in the load chain.  Use ns.spawn so this script
    // exits before tobacco.js starts (avoids stacking RAM across chain).
    log(ns, "Spawning /quack/corporation/tobacco.js ...");
    ns.spawn("/quack/corporation/tobacco.js", 1);
}
