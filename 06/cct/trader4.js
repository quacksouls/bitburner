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
    assert, log_cct_failure, max_profit_kadane, sequence
} from "./libbnr.js";

/**
 * The maximimum profit that can be made when we are restricted to at most t
 * transactions.  When we we are restricted to at most 2 transactions, we find
 * all possible partitions of the price array into 2 non-overlapping subarrays.
 * For each such partition we have 2 subarrays.  We run Kadane's algorithm on
 * each subarray, sum the results of both subarrays, and return the sum as the
 * maximum profit possible.
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
 * price array into t non-overlapping subarrays.  Thus there are C(n, k)
 * possible partitions of the price array into t non-overlapping subarrays.
 * Notice that when t = 2, we need only to choose k = t - 1 = 1 number to act
 * as a barrier for dividing the price array into 2 non-overlapping subarrays.
 * Therefore in the worst case the above method has factorial running time,
 * which is worse than exponential running time.
 *
 * @param t The maximum number of transactions.
 * @param price An array of prices, where price[i] is the price of a stock
 *     on day i.  All prices relate to the same stock.
 * @return The maximum profit to be made, assumming we can perform at most
 *     t transactions.  Return 0 if no profit can be made.
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
    // Perform at most t transactions.  Let S := {0, 1, 2, ..., n-1} be the set
    // of all indices of the price array and define k := t - 1.  We generate
    // all k-combinations of the set S.  The k-combinations are generated in
    // lexicographic order.
    assert(t >= 2);
    // Our initial array for a k-combination consists of the first k indices of
    // the price array.
    const k = t - 1;
    const n = price.length;
    let c = sequence(k);
    // For each partition, calculate the maximum possible profit.  Compare the
    // result with the running maximum mp.
    let mp = 0;
    const time = 10;
    while (c.length > 0) {
        mp = Math.max(mp, profit(price, t, c));
        c = next_combination(c, k, n);
        await ns.sleep(time);
    }
    return mp;
}

/**
 * Use a current k-combination to generate the next k-combination in
 * lexicographic order.  We use Algorithm 2.6 from the book:
 *
 * Donald L. Kreher and Douglas R. Stinson.  Combinatorial Algorithms:
 * Generation, Enumeration, and Search.  CRC Press, 1999, p.43.
 *
 * The algorithm given in the book uses 1-based counting.  Here, we adapt the
 * algorithm to use 0-based counting.
 *
 * @param c An array representing the current k-combination.  Cannot be empty.
 * @param k We want to generate a k-combination.  Must be at least 1.
 * @param n The size of the price array.
 * @return The next k-combination in lexicographic order.  Return an empty
 *     array if we cannot generate anymore k-combinations.
 */
function next_combination(c, k, n) {
    // Sanity checks.
    assert(c.length > 0);
    assert(k > 0);
    assert(n > 0);
    // The basic idea of the algorithm is to increment an element of the
    // combination array as high as we can, starting from the right-most
    // element and work our way down to the first element.  Each call of the
    // function increments the right-most element by 1 and we call the function
    // as many times as necesary until we can no longer increment the
    // right-most element of the array.  Then we move down to the second-last
    // element of the array and repeat the process.  And so on all the way
    // down to the first element of the array.
    // Initialization.
    const max = k - 1;
    const lastidx = n - 1;
    let i = max;
    while ((i >= 0) && (c[i] == lastidx - max + i)) {
        i--;
    }
    // We have exhausted all possible k-combinations.
    if (i < 0) {
        return [];
    }
    // Generate the next k-combination.
    const newc = Array.from(c);
    for (let j = i; j < k; j++) {
        newc[j] = c[i] + 1 + j - i;
    }
    return newc;
}

/**
 * The maximum profit to be made from a given partition of the price array.
 *
 * @param price An array of prices, where price[i] is the price of a stock
 *     on day i.  All prices relate to the same stock.
 * @param t The maximum number of transactions we are allowed to make.  Must
 *     be at least 2.
 * @param c A k-combination of the indices of the price array.  We use this
 *     array to partition the price array into t non-overlapping subarrays.
 * @return The maximum profit possible using the given partition of the price
 *     array.
 */
function profit(price, t, c) {
    // Sanity checks.
    assert(price.length > 0);
    assert(t >= 2);
    const k = t - 1;
    assert(c.length == k);
    // Calculate the maximum profit by using the given partition of the
    // price array.  In the array c, each element c[i] is a value in a
    // k-combination of the indices of the price array.  The first subarray
    // starts from index 0 of the price array and ends at index c[0].  The
    // second subarray starts from index c[0] + 1 and ends at index c[1].  The
    // third subarray starts from index c[1] + 1 and ends at index c[2].  And
    // so on.  The k-th subarray starts from index c[k-2] + 1 and ends at index
    // c[k-1].  The t-th subarray starts from index c[k-1] + 1 and ends at
    // index n-1.
    let array = price.slice(0, c[0] + 1);
    let maxprofit = max_profit_kadane(array);
    for (let i = 0; i < (k - 1); i++) {
        array = price.slice(c[i] + 1, c[i + 1] + 1);
        maxprofit += max_profit_kadane(array);
    }
    array = price.slice(c[k - 1] + 1, price.length);
    maxprofit += max_profit_kadane(array);
    return maxprofit;
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
    const [t, price] = ns.codingcontract.getData(cct, host);
    const mp = await maximize_profit(ns, t, price);
    const result = ns.codingcontract.attempt(
        mp, cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/trader4.txt";
        const data = "[" + t + ", [" + price.join(",") + "]]";
        await log_cct_failure(ns, log, cct, host, data);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
