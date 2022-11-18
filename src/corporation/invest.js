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
import { Cutil } from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { assert } from "/lib/util.js";

/**
 * A round of investment offer.
 *
 * @param ns The Netscript API.
 * @param r A string (i.e. word) representing the investment round.
 */
async function investment_offer(ns, r) {
    // Need to wait for our corporation to make a certain amount of profit per
    // second, and have a certain amount of funds.
    const funds_tau = ns.nFormat(corp_t.funds.round[r].N, "$0,0.00a");
    const profit_tau = ns.nFormat(corp_t.profit.round[r].N, "$0,0.00a");
    log(ns, `Waiting for sufficient funds: ${funds_tau}`);
    log(ns, `Waiting for sufficient profit: ${profit_tau}/s`);
    while (
        Cutil.funds(ns) < corp_t.funds.round[r].N
        || Cutil.profit(ns) < corp_t.profit.round[r].N
    ) {
        await ns.sleep(corp_t.TICK);
    }
    const { funds, round, shares } = ns[corp.API].getInvestmentOffer();
    if (round !== Cutil.to_number(r)) {
        return;
    }
    ns[corp.API].acceptInvestmentOffer();
    const fundsf = ns.nFormat(funds, "$0,0.00a");
    const sharesf = ns.nFormat(shares, "0,0.00a");
    log(ns, `Round ${round} of investment`);
    log(
        ns,
        `Received ${fundsf} in exchange for ${sharesf} shares of corporation`
    );
}

/**
 * A round of investment offer.  This script accepts a command line argument,
 * i.e. a number representing the round of investment.  Pass in the round number
 * as a word.  For example, if it is round 1, then pass in the string "one".
 *
 * Usage: corporation/invest.js [roundNumber]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Sanity checks.
    assert(ns.args.length === 1);
    const round_n = ns.args[0];
    assert(Cutil.is_valid_round(round_n));
    // Accept investment money.
    await investment_offer(ns, round_n);
}
