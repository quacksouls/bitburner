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
import { agriculture, corp } from "/lib/constant/corp.js";
import { cities } from "/lib/constant/location.js";
import { wait_t } from "/lib/constant/time.js";
import { Corporation } from "/lib/corporation/corp.js";
import { hire, buy_research } from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { has_corporation_api } from "/lib/source.js";
import { assert } from "/lib/util.js";

/**
 * Whether a division has all research it needs.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param res An array of names of research we care about.
 * @return True if we have all the given research; false otherwise.
 */
function has_all_research(ns, div, res) {
    assert(res.length > 0);
    const org = new Corporation(ns);
    const has_research = (x) => org.has_research(div, x);
    return res.every(has_research);
}

/**
 * Develop the research unit in each office.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param res An array of names of research we care about.
 */
async function research(ns, div, res) {
    log(ns, `${div}: expand the research unit of each office`);
    await hire(ns, div);
    // Purchase one research we do not have.
    const org = new Corporation(ns);
    for (const r of res) {
        if (!org.has_research(div, r)) {
            if (org.has_enough_research_points(div, r)) {
                log(ns, `${div}: buying research: ${r}`);
                await buy_research(ns, div, r);
                if (r === corp.research.TA_I || r === corp.research.TA_II) {
                    cities.all.forEach((ct) => {
                        agriculture.material.sold.forEach((mat) => {
                            org.enable_market_ta(
                                div,
                                bool.NOT_PRODUCT,
                                mat,
                                ct
                            );
                        });
                    });
                }
            }
            return;
        }
    }
}

/**
 * Develop our Agriculture division.
 *
 * Usage: run corporation/agriculture.js
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
    const res = [
        // Top priority.
        corp.research.RND_LAB,
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
        await ns.sleep(5 * wait_t.MINUTE);
    }
    log(ns, `${div}: all research units fully developed`);
}