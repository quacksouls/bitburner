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
import { wait_t } from "/lib/constant/time.js";
import { Office } from "/lib/corporation/office.js";
import { Cutil } from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { has_corporation_api } from "/lib/source.js";
import { assert } from "/lib/util.js";

/**
 * The first round of hiring after accepting the first investment offer.  We
 * want to hire 1 employee for each office, in the role of Management.
 *
 * We currently have employees in these roles:
 *
 * (1) Operations x 1
 * (2) Engineer x 1
 * (3) Business x 1
 *
 * After this round of hiring, each office should have the following roster:
 *
 * (1) Operations x 1
 * (2) Engineer x 1
 * (3) Business x 1
 * (4) Management x 1
 *
 * @param ns The Netscript API.
 */
async function first_hire_round(ns) {
    const office = new Office(ns);
    for (const div of Cutil.all_divisions(ns)) {
        for (const ct of cities.all) {
            assert(office.num_operations(div, ct) >= 1);
            assert(office.num_engineer(div, ct) >= 1);
            assert(office.num_business(div, ct) >= 1);
            if (office.num_management(div, ct) > 0) {
                continue;
            }
            const job = corp.job.MANAGEMENT;
            await new_hire(ns, div, ct, job);
            const prefix = `${div}: ${ct}`;
            const msg = `hired 1 employee and assigned to ${job}`;
            log(ns, `${prefix}: ${msg}`);
        }
    }
}

/**
 * The first round of investment.
 *
 * @param ns The Netscript API.
 * @return A number representing the investment round.
 */
async function first_investor_round(ns) {
    // Need to wait for our corporation to make a certain amount of profit per
    // second, and have a certain amount of funds.
    const funds_tau = ns.nFormat(corp_t.funds.VERY_LOW, "$0,0.00a");
    const profit_tau = ns.nFormat(corp_t.profit.VERY_LOW, "$0,0.00a");
    log(ns, `Waiting for sufficient funds: ${funds_tau}`);
    log(ns, `Waiting for sufficient profit: ${profit_tau}/s`);
    while (
        Cutil.funds(ns) < corp_t.funds.VERY_LOW
        || Cutil.profit(ns) < corp_t.profit.VERY_LOW
    ) {
        await ns.sleep(corp_t.TICK);
    }
    const { funds, round, shares } = ns[corp.API].getInvestmentOffer();
    if (round !== 1) {
        return round;
    }
    ns[corp.API].acceptInvestmentOffer();
    const fundsf = ns.nFormat(funds, "$0,0.00a");
    const sharesf = ns.nFormat(shares, "0,0.00a");
    log(ns, `Round ${round} of investment`);
    log(
        ns,
        `Received ${fundsf} in exchange for ${sharesf} shares of corporation`
    );
    return round;
}

/**
 * A round of hiring for each office.  For each office, we want to hire an
 * employee to fill a particular role.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param ct A string representing the name of a city.
 * @param role We want to hire for this role.
 */
async function new_hire(ns, div, ct, role) {
    const howmany = 1; // How many times to upgrade.
    const office = new Office(ns);
    if (Cutil.is_at_capacity(ns, div, ct)) {
        while (!office.upgrade(div, ct, howmany)) {
            await ns.sleep(wait_t.SECOND);
        }
    }
    while (!office.new_hire(div, ct, role)) {
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * The first round of investment.
 *
 * Usage: corporation/invest1.js
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
    const round = await first_investor_round(ns);
    if (round !== 1) {
        return;
    }
    await first_hire_round(ns);
}
