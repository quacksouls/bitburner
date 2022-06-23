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

import { assert, log_cct_failure } from "./libbnr.js";

/**
 * The maximum profit to be made when we are restricted to at most 1
 * transaction.  The algorithm is similar to Kadane's algorithm.  However, we
 * must keep track of the minimum price as well as the maximum profit.
 * Essentially, we want to buy low and sell high, but we are restricted to one
 * transaction.  This means we are restricted by these rules:
 *
 * (1) Only one buy action.
 * (2) Only one sell action.
 * (3) Must first buy before we can sell.
 *
 * Refer to the following for more details:
 *
 * https://betterprogramming.pub/dynamic-programming-interview-questions-how-to-maximize-stock-profits-8ed4966c2206
 *
 * @param price An array where price[i] represents the price of a stock on
 *     day i.  All prices are for the same stock.
 * @return The maximum profit we can make, assuming at most 1 transaction.
 *     Return 0 if no profit can be made.
 */
function maximize_profit(price) {
    assert(price.length > 0);
    let max_profit = 0;
    let min_price = price[0];
    // Must start on the second day.  On the first day, we have only one
    // price value so the minimum of one value is that value itself.
    for (let i = 1; i < price.length; i++) {
        // We need to keep track of the minimum price.  Let mp be the minimum
        // price so far.  If the price on day i is lower than mp, we set mp to
        // to the new minimum price.  Otherwise, we move to the price on the
        // next day.
        min_price = Math.min(min_price, price[i]);
        // Why do we need to keep track of the minimum price so far?  Let mp be
        // the minimum price up to and including day i.  Let price[i] be the
        // price on day i.  The profit pf is defined as the price on day i
        // minus the running minimium price:
        //
        // pf := price[i] - mp
        //
        // Here, the minimum price mp occurs during one of the days from the
        // first to the current day, i.e. mp is one of the price values
        //
        // price[0], price[1], ..., price[i]
        //
        // If we were to buy the stock on some day j (0 <= j <= i) at the
        // minimum price of mp, we can sell the stock on day i to make a profit
        // of pf.  The following can happen:
        //
        // (1) mp < price[i].  We make a profit pf.  Let mpf be the maximum
        //     profit we can make on day i.  We compare the profit pf on day i
        //     to the maximum profit mpf we can make on day i.  If mpf < pf,
        //     then we adjust our maximum profit so far to the value of pf.
        //     Otherwise, we keep the value of mpf as is.  The maximum profit
        //     we can make so far is the maximum of mpf and pf.
        // (2) mp = price[i].  We break even.  No loss, no profit.
        // (3) mp > price[i].  We make a loss because we are selling our stock
        //     at a price lower than when we bought the stock.  Our minimum
        //     price should be adjusted to the price on day i.  The minimum
        //     price so far is the minimum of mp and price[i].
        //
        max_profit = Math.max(max_profit, price[i] - min_price);
    }
    return max_profit;
}

/**
 * Algorithmic Stock Trader I: You are given an array of numbers representing
 * stock prices, where the i-th element represents the stock price on day i.
 * Determine the maximum possible profit you can earn using at most one
 * transaction (i.e. you can buy and sell the stock once).  If no profit can
 * be made, then the answer should be 0.  Note that you must buy the stock
 * before you can sell it.
 *
 * This is similar, but not identical, to the problem
 * "Subarray with Maximum Sum".
 *
 * Usage: run trader.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The host name of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const array = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(
        maximize_profit(array), cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/trader.txt";
        const data = "[" + array.join(",") + "]";
        await log_cct_failure(ns, log, cct, host, data);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
