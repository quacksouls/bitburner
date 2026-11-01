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
import { agriculture, corp } from "/quack/lib/constant/corp.js";
import { cities } from "/quack/lib/constant/location.js";
import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { Corporation } from "/quack/lib/corporation/corp.js";
import {
    hire,
    buy_market_ta,
    buy_research,
    has_all_research,
    setup_research_lab,
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
    // We must setup a research lab for the division before we are able to
    // buy other useful research.  Hi-Tech R&D Laboratory costs 5e3
    // research points (and has_enough_research_points requires 2x that =
    // 10e3).  A fresh Agriculture division after prep.js rarely has that
    // many points yet, so we poll here until enough accumulate.  While
    // waiting, keep energy/morale topped up so R&D employees keep
    // producing research points instead of decaying.
    while (!org.has_research(div, corp.research.RND_LAB)) {
        if (org.has_enough_research_points(div, corp.research.RND_LAB)) {
            log(ns, `${div}: buying research: ${corp.research.RND_LAB}`);
            await buy_research(ns, div, corp.research.RND_LAB);
            break;
        }
        org.buy_tea_all();
        org.party_all();
        await ns.sleep(wait_t.MINUTE);
    }
    setup_market_ta(ns, div);
    if (!buy_market_ta(ns, div)) {
        log(ns, `${div}: cannot buy research yet: Market-TA.I, Market-TA.II (will retry next round)`);
        return;
    }
    // Purchase other research we care about.
    for (const r of res) {
        if (!org.has_research(div, r) && org.is_research_available(div, r)) {
            if (org.has_enough_research_points(div, r)) {
                log(ns, `${div}: buying research: ${r}`);
                await buy_research(ns, div, r);
            }
        }
    }
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
