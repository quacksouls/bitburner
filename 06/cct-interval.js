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
 * Merge overlapping inervals.
 *
 * @param interval An array of intervals.  Each interval is represented as an
 *     array [a, b] of two elements, where a < b.  So this is an array of
 *     arrays.
 * @return An array of intervals, where all overlapping intervals have
 *     been merged.
 */
function merge(interval) {
    // Sanity checks.
    assert(interval.length > 0);
    assert(valid_interval(interval));

    // Sort the array in ascending order using the first element of
    // each subarray.
    const array = Array.from(interval);
    array.sort(function (a, b) {
        return a[0] - b[0];
    });
    // Compare two intervals and merge them as necessary.
    let i = 0;
    let j = i + 1;
    const start = 0;
    const end = 1;
    const howmany = 1;  // How many elements to delete;
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
 * @param intA An interval.
 * @param intB Another interval.
 * @return true if the given intervals should be merged;
 *     false otherwise.
 */
function merge_interval(intA, intB) {
    const start = 0;
    const end = 1;
    const a = intA[end];
    const b = intB[start];
    const MERGE = true;
    const NO_MERGE = !MERGE;
    // The end of the previous interval is smaller than the start
    // of the current interval.
    if (a < b) {
        return NO_MERGE;
    }
    // The end of the previous interval is greater than or equal
    // to the start of the current interval.
    assert(a >= b);
    return MERGE;
}

/**
 * Whether each interval is valid.
 *
 * @param array An array of intervals.
 * @return true if each interval is valid; false otherwise.
 */
function valid_interval(array) {
    const VALID = true;
    const NOT_VALID = !VALID;
    assert(array.length > 0);
    for (let i = 0; i < array.length; i++) {
        const arr = array[i];
        if (arr.length != 2) {
            return NOT_VALID;
        }
        const [a, b] = arr;
        if (a >= b) {
            return NOT_VALID;
        }
    }
    return VALID;
}

/**
 * Merge Overlapping Intervals: Given an array of intervals, merge all
 * overlapping intervals.  An interval is an array with two numbers, where
 * the first number is always less than the second (e.g. [1, 5]).  The
 * intervals must be returned in ASCENDING order.
 *
 * Edit this script to give the input array of intervals.
 *
 * Usage: run cct-interval.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const interval = [
        [[1, 4], [20, 22], [3, 10], [25, 35], [35, 40], [39, 61], [5, 7],
         [8, 16]],
        [[1, 3], [8, 10], [2, 6], [10, 16]],
        [[1, 3], [2, 4], [6, 8], [9, 10]],
        [[6, 8], [1, 9], [2, 4], [4, 7]],
        [[1, 3], [2, 6], [8, 10], [15, 18]],
        [[1, 4], [4, 5]],
        [[1, 5], [3, 7], [4, 6], [6, 8]]
    ];
    for (let i = 0; i < interval.length; i++) {
        ns.tprint(i);
        ns.tprint(interval[i]);
        ns.tprint(merge(interval[i]));
    }
}
