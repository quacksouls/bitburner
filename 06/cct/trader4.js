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

import {
    array_slice, assert, log_cct_failure, max_profit_kadane
} from "./libbnr.js";

/**
 * The maximimum profit that can be made when we are restricted to at most k
 * transactions.  Let mp be the cumulative maximum profit.  Use Kadane's
 * algorithm to determine the maximum profit when we are restricted to 1
 * transaction.  We have two cases:
 *
 * (1) The result of Kadane's algorithm is 0.  We are done.  Return the value
 *     of mp.
 * (2) The result of Kadane's algorithm is positive.  Add the result to mp.
 *     Now we must prepare the price array for the next transaction.  Kadane's
 *     algorithm should output an array [p, i, j], where p is the profit
 *     resulting from using Kadane's algorithm on the current price array.
 *     The values of i and j are indices in the current price array, where
 *     i < j.  Essentially, we buy on day i and sell on day j, giving us the
 *     maximum profit of p.  We must remove from the current price array the
 *     elements at indices i and j, producing the updated price array.  Use
 *     the updated price array for the next transation, where we again apply
 *     Kadane's algorithm.
 *
 * As can be seen from the above, we repeatedly apply Kadane's algorithm until
 * either of the following occurs.  Let t be the t-th transaction, where
 * 0 < t <= k.
 *
 * (1) During the t-th transaction, Kadane's algorithm outputs 0.  No profits
 *     can be made from transaction t onward.  Our maximum profit is the
 *     current value of the cumulative maximum profit.
 * (2) We have t = k.  The t-th transaction is our final transaction.  Our
 *     maximum profit is the sum of the values output by Kadane's algorithm
 *     for each of the k transactions.
 *
 * @param k The maximum number of transactions.
 * @param price An array of prices, where price[i] is the price of a stock
 *     on day i.  All prices relate to the same stock.
 * @return The maximum profit to be made, assumming we can perform at most
 *     k transactions.  Return 0 if no profit can be made.
 */
function maximize_profit(k, price) {
    assert(k >= 0);
    assert(price.length > 0);
    // No transactions means no profit.  We don't buy and sell, therefore
    // no profit at all.
    if (0 == k) {
        return 0;
    }
    // Perform at most k transactions.
    assert(k > 0);
    let newprice = Array.from(price);
    let max_profit = 0;
    for (let t = 1; t <= k; t++) {
        // Make the t-th transaction.
        const [profit, i, j] = max_profit_kadane(newprice);
        // No profit can be made in the t-th transaction.  Return the
        // maximum profit so far.
        if (0 == profit) {
            return max_profit;
        }
        // We can make a profit in the t-th transaction.  Add the profit to
        // the cumulative maximum profit.
        assert(profit > 0);
        max_profit += profit;
        // Prepare the price array for the next transaction.
        assert(i < j);
        if (2 == newprice.length) {
            // Only 2 price values in the current price array.  This means the
            // next transaction won't have any prices to use.  That is, this is
            // our last transaction.
            // What if the current price array has 3 elements?  After slicing
            // away 2 price values, we are left with an array of 1 element.
            // The maximum profit of a price array of 1 element is 0.  Kadane's
            // algorithm can handle an array of 1 element.
            return max_profit;
        }
        assert(newprice.length > 2);
        newprice = array_slice(newprice, i, j);
    }
    return max_profit;
}

/**
 * Algorithmic Stock Trader IV: You are given an array with two elements.  The
 * first element is an integer k.  The second element is an array of numbers
 * representing stock prices, where the i-th element represents the stock price
 * on day i.  Determine the maximum possible profit you can earn using at most
 * k transactions.  A transaction is defined as buying and then selling one
 * share of the stock.  Note that you cannot engage in multiple transactions at
 * once.  In other words, you must sell the stock before you can buy it.  If no
 * profit can be made, then the answer should be 0.
 *
 * This is similar to Algorithmic Stock Trader III.  The twist is that we can
 * now make at most k transactions, where previously we were restricted to at
 * most two transactions.  Of course, k can be 0, 1, 2, or a higher integer.
 *
 * Usage: run trader4.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The host name of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const [k, price] = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(
        maximize_profit(k, price), cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/trader4.txt";
        const data = "[" + k + ", [" + price.join(",") + "]]";
        await log_cct_failure(ns, log, cct, host, data);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
