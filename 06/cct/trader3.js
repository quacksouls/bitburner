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
 * two transactions.
 *
 * @param price An array of prices, where price[i] is the price of a stock
 *     on day i.  All prices relate to the same stock.
 * @return The maximum profit to be made, assumming we can perform at most
 *     two transactions.  Return 0 if no profit can be made.
 */
function maximize_profit(price) {
    assert(price.length > 0);
    // The first transaction.
    const [max_profit, i, j] = max_profit_kadane(price);
    if (0 == max_profit) {
        return 0;
    }
    // The second transaction.
    assert(i < j);
    if (2 == price.length) {
        return max_profit;
    }
    const new_price = slice(price, i, j);
    return max_profit + max_profit_kadane(new_price);
}

/**
 * Remove the element at index i from the given array.
 *
 * @param array An array.  Cannot be empty.
 * @param i, j We want to remove the elements at these indices.  Assume i < j.
 * @return An array obtained from removing the elements at indices i and j
 *     in the given array.
 */
function slice(array, i, j) {
    // Sanity checks.
    assert(array.length > 0);
    assert(i >= 0);
    assert(i < array.length);
    assert(i < j);
    assert(j < array.length);
    // Remove the two elements at the given indices.
    let subarr = array.slice(0, i);
    subarr = subarr.concat(array.slice(i + 1, j));
    return subarr.concat(array.slice(j + 1, array.length));
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
        const log = "/cct/trader.txt";
        const data = "[" + array.join(",") + "]";
        await log_cct_failure(ns, log, cct, host, data);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
