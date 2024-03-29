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
    // We must setup a research lab for the division before we are able to buy
    // other useful research.
    if (!setup_research_lab(ns, div)) {
        log(ns, `${div}: unable to setup research lab`);
        return;
    }
    setup_market_ta(ns, div);
    if (!buy_market_ta(ns, div)) {
        log(ns, `${div}: cannot buy research: Market-TA.I, Market-TA.II`);
        return;
    }
    // Purchase other research we care about.
    const org = new Corporation(ns);
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
        corp.research.JOY,
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
}
