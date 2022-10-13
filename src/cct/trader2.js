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

import { log_cct_failure, print_error, print_success } from "/lib/cct.js";
import { assert } from "/lib/util.js";

/**
 * The maximum profit that can be obtained if we are allowed to make an
 * unlimited number of transactions.  Each transaction is a pair of buy/sell.
 * A stock must first be bought before it can be sold.
 *
 * We have already solved the case where we are allowed to make at most one
 * transaction.  The basic idea boils down to finding two days i and j, where
 * i < j and price[i] < price[j], such that the difference price[j] - price[i]
 * is as large as possible.
 *
 * Let's reuse the above idea.  Let mp be the running maximum profit.  Given
 * two consecutive days i and i + 1, we have three cases:
 *
 * (1) price[i] < price[i+1].  We can make a profit if we buy on day i and
 *     sell the next day.  Add that profit to our running profit mp.
 * (2) price[i] = price[i+1].  We break even.  No need to add the difference
 *     price[i+1] - price[i] to our running profit mp because the difference
 *     is zero.
 * (3) price[i] > price[i+1].  We make a loss.  Do not buy on day i and sell
 *     the next day.
 *
 * The edge case is when i is the last day.  We should not buy the stock on
 * the last day because we won't be able to sell it the next day.
 *
 * @param price An array where price[i] is the price of a stock on day i.
 * @return The maximum profit to be made, provided we are allowed to make
 *     as many transactions as we want.  Return 0 if no profits can be made.
 */
function maximize_profit(price) {
    // Sanity checks.
    assert(price.length > 0);
    // If the price array has only one value, we can buy on the first day.
    // However, we won't be able to sell at all.  Therefore the maximum profit
    // should be zero.
    if (price.length === 1) {
        return 0;
    }
    // Keep track of the running maximum profit by considering the price
    // difference between consecutive days.
    assert(price.length >= 2);
    const lastidx = price.length - 1;
    let max_profit = 0;
    for (let i = 0; i < lastidx; i++) {
        if (price[i] < price[i + 1]) {
            max_profit += price[i + 1] - price[i];
        }
    }
    return max_profit;
}

/**
 * Algorithmic Stock Trader II: You are given an array of numbers representing
 * stock prices, where the i-th element represents the stock price on day i.
 * Determine the maximum possible profit you can earn using as many
 * transactions as you like.  A transaction is defined as buying and then
 * selling one share of the stock.  Note that you cannot engage in multiple
 * transactions at once.  In other words, you must sell the stock before you
 * buy it again.  If no profit can be made, then the answer should be 0.
 *
 * Each price in the array relates to the same stock.
 *
 * Usage: run cct/trader2.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The hostname of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const array = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(
        maximize_profit(array),
        cct,
        host,
        {
            returnReward: true,
        }
    );
    // Log the result in case of failure.
    if (result.length === 0) {
        const log = "/cct/trader2.txt";
        const data = "[" + array.join(",") + "]";
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
