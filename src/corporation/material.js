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
import { Cutil } from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { assert } from "/lib/util.js";

/**
 * Purchase some materials after the first round of investment.  We want to buy
 * these materials:
 *
 * (1) Hardware.  We want an additional 2,675.
 * (2) Robots.  We want a total of 96.
 * (3) AI Cores.  We want an additional 2,445.
 * (4) Real Estate.  We want an additional 119,400.
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
        for (const div of Cutil.all_divisions(ns)) {
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
 * Purchasing some amounts of materials.  This script accepts a command line
 * argument, i.e. a number representing the purchase round.  This round number
 * corresponds to the number of times we have accepted investment money.  Pass
 * in the round number as a word.  For example, if it is round 1, then pass in
 * the string "one".
 *
 * Usage: corporation/material.js [roundNumber]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("sleep");
    // Sanity checks.
    assert(ns.args.length === 1);
    const round_n = ns.args[0];
    assert(Cutil.is_valid_round(round_n));
    // Manage our corporation.
    await material_buy(ns, round_n);
}
