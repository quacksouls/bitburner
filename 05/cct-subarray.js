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

import { assert } from "./libbnr.js";

/**
 * The largest sum of a non-empty, contiguous subarray.
 *
 * @param array An array of integers.
 * @return The largest sum of any non-empty, contiguous subarray of the given
 *     array.
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
 * possible.  Edit this file to provide the input array.  See Wikipedia
 * for more details:
 *
 * https://en.wikipedia.org/wiki/Maximum_subarray_problem
 *
 * Usage: run cct-subarray.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const array = [
        [-2, 1, -3, 4, -1, 2, 1, -5, 4],
        [1],
        [5, 4, -1, 7, 8],
        [-3, -4, 5, -1, 2, -4, 6, -1],
        [-1, -2, -3, -4, -5, -6],
        [1, 2, 3, 4, 5, 6]];
    for (const arr of array) {
        const sum = subarray_sum(arr);
        ns.tprint(sum);
    }
}
