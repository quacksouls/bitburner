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

import { MyArray } from "/quack/lib/array.js";
import { log_cct_failure, print_error, print_success } from "/quack/lib/cct.js";
import { bool } from "/quack/lib/constant/bool.js";
import { assert } from "/quack/lib/util.js";

/**
 * Merge overlapping intervals.
 *
 * @param interval An array of intervals.  Each interval is represented as an
 *     array [a, b] of two elements, where a < b.  So this is an array of
 *     arrays.
 * @return An array of intervals, where all overlapping intervals have
 *     been merged.  Intervals in the array are sorted in ascending order.
 */
function merge(interval) {
    // Sanity checks.
    assert(interval.length > 0);
    assert(valid_interval(interval));
    // Sort the array in ascending order using the first element of
    // each subarray.
    const array = MyArray.sort_ascending_tuple(interval);
    // Compare two intervals and merge them as necessary.
    let i = 0;
    let j = i + 1;
    const start = 0;
    const end = 1;
    const howmany = 1; // How many elements to delete.
    while (j < array.length) {
        if (merge_interval(array[i], array[j])) {
            // Merge intervals i and j.
            const a = array[i][start];
            const b = Math.max(array[i][end], array[j][end]);
            array[i] = [a, b];
            // Delete interval j.
            array.splice(j, howmany);
            continue;
        }
        i++;
        j = i + 1;
    }
    return array;
}

/**
 * Whether to merge two intervals.
 *
 * @param intA An interval, represented as an array [x, y] of two elements.
 * @param intB Another interval.
 * @return True if the given intervals should be merged; false otherwise.
 */
function merge_interval(intA, intB) {
    const start = 0;
    const end = 1;
    const a = intA[end];
    const b = intB[start];
    // The end of the previous interval is smaller than the start
    // of the current interval.
    if (a < b) {
        return bool.NO_MERGE;
    }
    // The end of the previous interval is greater than or equal
    // to the start of the current interval.
    assert(a >= b);
    return bool.MERGE;
}

/**
 * Whether each interval is valid.
 *
 * @param array An array of intervals.  Cannot be an empty array.
 * @return True if each interval is valid; false otherwise.
 */
function valid_interval(array) {
    assert(array.length > 0);
    for (let i = 0; i < array.length; i++) {
        const arr = array[i];
        if (arr.length !== 2) {
            return bool.INVALID;
        }
        const [a, b] = arr;
        if (a >= b) {
            return bool.INVALID;
        }
    }
    return bool.VALID;
}

/**
 * Merge Overlapping Intervals: Given an array of intervals, merge all
 * overlapping intervals.  An interval is an array with two numbers, where
 * the first number is always less than the second (e.g. [1, 5]).  The
 * intervals must be returned in ASCENDING order.
 *
 * Usage: run quack/cct/interval.js [cct] [hostname]
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
    const result = ns.codingcontract.attempt(merge(array), cct, host);
    // Log the result in case of failure.
    if (result.length === 0) {
        const log = "/quack/cct/interval.txt";
        const data = `[${array.join(",")}]`;
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
