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

import { assert, log_cct_failure, max_profit_kadane } from "./libbnr.js";

/**
 * The maximimum profit that can be made when we are restricted to at most
 * two transactions.  Transactions must occur one after the other.  Suppose
 * we buy shares of a stock on day i and sell the shares on day j, where
 * i < j.  We cannot buy shares of the same stock on any day between i and j.
 * However, we are allowed to buy more shares of the stock from day j+1 onward.
 *
 * The above description hints at a simple solution.  We partition the price
 * array into two, non-overlapping parts:
 *
 * (1) The left part starts from day 0 and ends at day k, inclusive.  Run
 *     Kadane's algorithm on the left subarray to get mpl as our maximum profit
 *     for the left subarray.
 * (2) The right part starts from day k+1 and ends at the last day in the price
 *     array.  Run Kadane's algorithm on the right subarray to get mpr as our
 *     maximum profit for the right subarray.
 *
 * The maximum profit is mpl + mpr.  This maximum profit is for one particular
 * partition of the price array.  There are many other partitions, one for each
 * value of k.  Calculate the maximum profit for each partition.  The true
 * maximum profit is the maximum of the results of all partitions.
 *
 * @param price An array of prices, where price[i] is the price of a stock
 *     on day i.  All prices relate to the same stock.
 * @return The maximum profit to be made, assumming we can perform at most
 *     two transactions.  Return 0 if no profit can be made.
 */
function maximize_profit(price) {
    assert(price.length > 0);
    // Obtain all possible partitions of the price array.  Each partition
    // divides the array into two parts: the left subarray and the right
    // subarray.
    let max_profit = 0;
    for (let k = 0; k < price.length; k++) {
        // The left and right subarrays in the partition.
        const left = price.slice(0, k + 1);
        const right = price.slice(k + 1, price.length);
        // The maximum profit of each subarray in the partition.
        const mpl = max_profit_kadane(left);
        let mpr = 0;
        if (right.length > 0) {
            mpr = max_profit_kadane(right);
        }
        // The running maximum profit.
        max_profit = Math.max(max_profit, mpl + mpr);
    }
    return max_profit;
}

/**
 * Algorithmic Stock Trader III: You are given an array of numbers representing
 * stock prices, where the i-th element represents the stock price on day i.
 * Determine the maximum possible profit you can earn using at most two
 * transactions.  A transaction is defined as buying and then selling one share
 * of the stock.  Note that you cannot engage in multiple transactions at once.
 * In other words, you must sell the stock before you buy it again.  If no
 * profit can be made, then the answer should be 0.
 *
 * This is similar to Algorithmic Stock Trader I.  The twist is that we can now
 * make at most two transactions, where previously we were restricted to at
 * most one transaction.
 *
 * Usage: run trader3.js [cct] [hostname]
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
        const log = "/cct/trader3.txt";
        const data = "[" + array.join(",") + "]";
        await log_cct_failure(ns, log, cct, host, data);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
