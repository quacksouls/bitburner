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
import { Corporation } from "/lib/corporation/corp.js";
import { Cutil } from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { has_corporation_api } from "/lib/source.js";
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
 */
async function material_buy(ns) {
    const org = new Corporation(ns);
    const material = [
        corp.material.AI,
        corp.material.HARDWARE,
        corp.material.LAND,
        corp.material.ROBOT,
    ];
    const amount = [
        corp_t.material.ai.buy.round.one.N,
        corp_t.material.hardware.buy.round.one.N,
        corp_t.material.land.buy.round.one.N,
        corp_t.material.robot.buy.round.one.N,
    ];
    for (let i = 0; i < material.length; i++) {
        const amt = ns.nFormat(amount[i], "0,00.00a");
        log(ns, `Buying ${amt} units of ${material[i]}`);
        await org.material_buy(material[i], amount[i]);
    }
}

/**
 * Purchasing materials after the first round of investment.
 *
 * Usage: corporation/material1.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Sanity check.
    assert(has_corporation_api(ns));
    assert(Cutil.has_corp(ns));
    assert(Cutil.has_office_warehouse_api(ns));
    // Manage our corporation.
    await material_buy(ns);
}
