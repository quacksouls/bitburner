/**
 * Copyright (C) 2022--2023 Duck McSouls
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

import { log_cct_failure, print_error, print_success } from "/quack/lib/cct.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * The largest sum of a non-empty, contiguous subarray.
 *
 * @param {array} array An array of integers.
 * @returns {number} The largest sum of any non-empty, contiguous subarray of
 *     the given array.
 */
function subarray_sum(array) {
    // Use Kadane's algorithm.
    assert(array.length > 0);
    let best = Number.NEGATIVE_INFINITY;
    let current = 0;
    for (const n of array) {
        current = Math.max(n, current + n);
        best = Math.max(best, current);
    }
    return best;
}

/**
 * Subarray with Maximum Sum: Given an array of integers, find the
 * contiguous subarray (containing at least one number) which has the
 * largest sum and return that sum.
 *
 * Determine a non-empty, contiguous subarray that has the largest sum
 * possible.  See Wikipedia for more details:
 *
 * https://en.wikipedia.org/wiki/Maximum_subarray_problem
 *
 * Usage: run quack/cct/subarray.js [cct] [hostname]
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const [cct, host] = ns.args;

    // Solve the Coding Contract.
    const array = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(subarray_sum(array), cct, host);

    // Log the result in case of failure.
    if (is_empty_string(result)) {
        const log = "/quack/cct/subarray.txt";
        const data = `[${array.join(",")}]`;
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
