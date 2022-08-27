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

import { MyArray } from "/lib/array.js";
import { log_cct_failure } from "/lib/cct.js";
import { assert } from "/lib/util.js";

/**
 * The number of ways to change n using coins in the given set of
 * denominations.
 *
 * @param n We want to partition this number.  Must be a positive integer.
 * @param denom The array of denominations.  An array of positive integers to
 *     use to partition n.  Elements of the array are unique.
 * @return The number of ways to change n using the given denominations.
 */
function coin_change(n, denom) {
    assert(n > 0);
    assert(denom.length > 0);
    // Sort the array of denominations in ascending order.
    let denomination = Array.from(new Set(denom));
    const array = new MyArray();
    denomination = array.sort_ascending(denomination);
    // Remove any coin value higher than n.
    let i = denomination.length - 1;
    while (n < denomination[i]) {
        denomination.pop();
        i = denomination.length - 1;
    }
    return partition(n, denomination);
}

/**
 * The number of ways to partition an integer using only integers from a given
 * set.  Let n be our target sum and let our m denominations be
 * D := [d_0, d_1, ..., d_{m-1}], where d_i < d_j whenever i < j.  We make the
 * following assumptions:
 *
 * (1) n >= 0.
 * (2) Each d_i > 0.
 * (3) Each d_i <= n.
 *
 * The problem has the following recursive interpretation.  Let C(n) be the
 * number of ways to partition n using a denomination d.  Then we have the
 * recurrence relation
 *
 * C(n) := C(n) + C(n - d)
 *
 * We have the base case C(0) := 1 because there is only one way to make a
 * change for zero, namely choose no coins at all.  Refer to the following page
 * for more details:
 *
 * https://www.educative.io/m/coin-changing-problem
 *
 * @param n We want to partition this integer.
 * @param denom The array of denominations.  An array of positive integers to
 *     use to partition n.  Elements of the array are unique and the array is
 *     assumed to be sorted in ascending order.
 * @return The number of ways to partition n using only integers from
 *     the denomination array.
 */
function partition(n, denom) {
    // Use an array of n + 1 elements because we also need to take care of the
    // base case.
    const cache = Array(n + 1).fill(0);
    cache[0] = 1;
    for (const d of denom) {
        for (let i = d; i < cache.length; i++) {
            cache[i] += cache[i - d];
        }
    }
    return cache[cache.length - 1];
}

/**
 * Total Ways to Sum II: You are given an array with two elements.  The first
 * element is an integer n.  The second element is an array of numbers
 * representing the set of available integers.  How many different ways can
 * that number n be written as a sum of integers contained in the given set?
 * You may use each integer in the set zero or more times.
 *
 * This is also known as the money changing problem.  Suppose we have a target
 * amount of money n.  We have m distinct dollar notes a_0, a_1, ..., a_{m-1}.
 * How many ways are there to combine one or more notes such that the total
 * amount is n?  We can use a note zero, one, or more times.  More details here:
 *
 * https://algorithmist.com/wiki/Coin_change
 *
 * Usage: run sum2.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The hostname of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const [n, denomination] = ns.codingcontract.getData(cct, host);
    const npart = coin_change(n, denomination);
    const result = ns.codingcontract.attempt(
        npart, cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/sum2.txt";
        const data = "[" + n + ", [" + denomination.join(",") + "]]";
        await log_cct_failure(ns, log, cct, host, data);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
