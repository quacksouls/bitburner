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
    log_cct_failure,
    max_profit_kadane,
    print_error,
    print_success,
    stock_traderIII,
} from "/lib/cct.js";
import { wait_t } from "/lib/constant/time.js";
import { assert } from "/lib/util.js";

/**
 * The maximimum profit that can be made when we are restricted to at most t
 * transactions.  When we are restricted to at most 2 transactions, we find
 * all possible partitions of the price array into 2 non-overlapping subarrays.
 * For each such partition we have 2 subarrays.  We run Kadane's algorithm on
 * each subarray, sum the results of both subarrays, and return the sum as the
 * maximum profit possible.  The true maximum profit is the maximum of the
 * results of all partitions.
 *
 * Now consider t > 2.  We use the same idea as per the case when we are
 * restricted to at most 2 transactions.  The minor difference now is that we
 * must partition the price array into t non-overlapping subarrays.  We run
 * Kadane's algorithm on each subarray, add together the result of each run of
 * the algorithm, and return the sum as the maximum possible profit.  The only
 * tricky part is generating all possible partitions of the price array, where
 * each partition consists of t non-overlapping subarrays.  The above method is
 * conceptually simple to understand as it builds on the intuition for the case
 * where t = 2.  However, the method can be slow.  Let k := t - 1.  Given a set
 * of n elements, we have C(n, k) ways to choose k numbers that partition the
 * price array into t non-overlapping subarrays.  Here, the number C(n, k) is
 * the binomial coefficient.  Thus there are C(n, k) possible partitions of the
 * price array into t non-overlapping subarrays.  Notice that when t = 2, we
 * need only to choose k = t - 1 = 1 number to act as a barrier for dividing
 * the price array into 2 non-overlapping subarrays.  Therefore in the worst
 * case the above method has factorial running time, which is worse than
 * exponential running time.
 *
 * Let's see whether we can use recursion to calculate the solution for day i
 * based on our solution for day i-1.  Suppose price[i] is the value of the
 * stock on day i.  Define p[t][i] as the maximum profit obtained by using at
 * most t transactions up to and including day i.  We have two cases for day i.
 *
 * (1) If no transactions are made on day i, then the value of p[t][i] is
 *     equivalent to p[t][i-1], i.e. p[t][i] = p[t][i-1].
 * (2) Suppose we sell on the i-th day.  Then we must have bought one share of
 *     the stock on a day j, where 0 <= j <= i-1.  Purchasing a share on day j
 *     and selling it at a later day i would net us a profit of
 *
 *     price[i] - price[j]
 *
 *     for one transaction.  What about the profits from the remaining t-1
 *     transactions?  Those profits are collectively represented as p[t-1][j].
 *     If we sell on the i-th day and this is our t-th transaction, then the
 *     profit from all t transactions can be written as
 *
 *     (*) price[i] - price[j] + p[t-1][j]
 *
 *     To maximize our profit from all t transactions, we need to maximize the
 *     value of expression (*).  We calculate the value of (*) for each value
 *     of j between 0 and i-1, inclusive.  That is, we have the expression
 *
 *     (**) max{price[i] - price[j] + p[t-1][j]}
 *
 *     where 0 <= j <= i-1.  Therefore p[t][i] is defined as the maximum of
 *     p[t][i-1] and expression (**).
 *
 * The base cases are:
 *
 * (i) p[0][i] := 0 for all i.
 * (ii) p[t][0] := 0 for all t.
 *
 * If n is the number of elements in the price array, the maximum profit we can
 * obtain is p[t][n-1] provided we are restricted to at most t transactions.
 * Refer to the following page for more details:
 *
 * https://www.techiedelight.com/find-maximum-profit-earned-at-most-k-stock-transactions/
 *
 * @param ns The Netscript API.
 * @param t The maximum number of transactions.
 * @param price An array of prices, where price[i] is the price of one share of
 *     a stock on day i.  All prices relate to the same stock.
 * @return The maximum profit to be made, assumming we can perform at most t
 *     transactions.  Return 0 if no profit can be made.
 */
async function maximize_profit(ns, t, price) {
    assert(t >= 0);
    assert(price.length > 0);
    // No transactions means no profit.  We don't buy and sell, therefore
    // no profit at all.
    if (0 == t) {
        return 0;
    }
    // If t = 1, we are restricted to at most 1 transaction.  Simply use
    // Kadane's algorithm on the price array.
    if (1 == t) {
        return max_profit_kadane(price);
    }
    // If t = 2, we are restricted to at most 2 transactions.  This is the case
    // of Algorithmic Stock Trader III.
    if (2 == t) {
        return stock_traderIII(price);
    }
    // Perform at most t >= 3 transactions.  Let p[t][i] be the maximum profit
    // obtained by using at most t transactions up to and including day i.  The
    // value of p[t][i] is the maximum of these two expressions:
    //
    // (1) p[t][i-1]
    // (2) max{price[i] - price[j] + p[t-1][j]} for all 0 <= j <= i-1.
    //
    // Using the recursive structure of p[t][i], we create a 2-D matrix to hold
    // the previous values p[r][c].  The row number r represents the current
    // maximum number of transactions.  The column number c represents the
    // current day.
    assert(t >= 3);
    // The base case p[0][i] := 0 for all i.
    const p = new Array();
    p.push(new Array(price.length).fill(0));
    for (let i = 1; i <= t; i++) {
        // The base case p[t][0] := 0 for all t.
        const array = new Array(price.length);
        array[0] = 0;
        p.push(array);
    }
    // The case of at least t >= 3 transactions.  Here, 1 <= tau <= t.  Build
    // up our table from tau = 1 up to and including tau = t.
    for (let tau = 1; tau <= t; tau++) {
        // Let the number of transactions be at most tau.  Consider each
        // day > 0 in the price array.  As we move to the next day, we do not
        // have to recalculate the maximization expression
        //
        // max{price[i] - price[j] + p[t-1][j]}
        //
        // for all 0 <= j <= i-1.  Define the number
        //
        // mp := max{p[t-1][k] - price[k]}
        //
        // where 0 <= k <= i-2.  Then we have the expression
        //
        // max{price[i] - price[j] + p[t-1][j]}
        // = price[i] + max(mp, p[t-1][i-1] - price[i-1])
        //
        // Thus p[t][i] is the maximum of p[t][i-1] and the expression
        //
        // price[i] + max(mp, p[t-1][i-1] - price[i-1])
        let mp = p[tau - 1][0] - price[0];
        for (let day = 1; day < price.length; day++) {
            // The maximum profit if we do not make a transaction on this day.
            const a = p[tau][day - 1];
            // The maximum profit if we make a transaction on this day.
            mp = Math.max(mp, p[tau - 1][day - 1] - price[day - 1]);
            // The maximum profit using at most t transactions up to and
            // including this day.
            p[tau][day] = Math.max(a, price[day] + mp);
            await ns.sleep(wait_t.MILLISECOND);
        }
    }
    return p[t][price.length - 1];
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
 * Usage: run cct/trader4.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The hostname of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const [t, price] = ns.codingcontract.getData(cct, host);
    const mp = await maximize_profit(ns, t, price);
    const result = ns.codingcontract.attempt(mp, cct, host, {
        returnReward: true,
    });
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/trader4.txt";
        const data = "[" + t + ", [" + price.join(",") + "]]";
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
