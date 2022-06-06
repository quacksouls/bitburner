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
 * Whether the given array has only non-negative numbers.
 *
 * @param array An array of integers.  Cannot be empty array.
 * @return true if the given array has only non-negative integers;
 *     false otherwise.
 */
function all_nonnegative(array) {
    assert(array.length > 0);
    for (const a of array) {
        if (a < 0) {
            return false;
        }
    }
    return true;
}

/**
 * Whether we can reach the last cell of an array.  We use a greedy approach.
 * Try to jump the maximum distance, otherwise backtrack and/or reduce the
 * jump distance.
 *
 * @param array An array of integers.  Cannot be empty array.
 * @return true if starting from the first array cell we can reach
 *     the last array cell; false otherwise.
 */
function end_reachable(array) {
    // Sanity check.
    assert(all_nonnegative(array));
    const REACHABLE = true;
    const NOT_REACHABLE = !REACHABLE;

    let i = 0;                // Current array index.
    let index = new Array();  // Index of intermediary cells.
    let jump = new Array();   // Jump length of array cell index[i].
    let reduce_distance = false;
    let d;                    // The jump distance.
    while (i < array.length) {
        if (reduce_distance) {
            // Decrease by 1 the jump distance.
            d = jump.pop();
            jump.push(d - 1);
            reduce_distance = false;
        } else {
            // Current maximum jump distance.
            d = array[i];
            index.push(i);
            jump.push(d);
        }
        assert(index.length == jump.length);
        // We are at the last array cell.
        if (is_last_cell(i, array)) {
            return REACHABLE;
        }
        // Zero jump distance.
        d = jump[jump.length - 1];
        i = index[index.length - 1];
        if (0 == d) {
            if (0 == i) {
                return NOT_REACHABLE;
            }
            // Backtrack and reduce jump distance.
            index.pop();
            jump.pop();
            reduce_distance = true;
            continue;
        }
        // We can jump the given distance.
        if (i + d < array.length) {
            i += d;
            continue;
        }
        // We cannot jump the given distance.
        if (i + d >= array.length) {
            reduce_distance = true;
            continue;
        }
    }
}

/**
 * Whether we are at the last array cell.
 *
 * @param i Index of the current array cell.
 * @param array An array of integers.  Cannot be empty array.
 * @return true if i is the last index of the array;
 *     false otherwise.
 */
function is_last_cell(i, array) {
    assert(array.length > 0);
    assert(i >= 0);
    assert(i < array.length);
    return i == (array.length - 1);
}

/**
 * Array Jumping Game: You are given an array of integers where each element
 * represents the maximum possible jump distance from that position.  For
 * example, if you are at position i and your maximum jump length is n, then
 * you can jump to any position from i to i+n.  Assuming you are initially
 * positioned at the start of the array, determine whether you are able to
 * reach the last index of the array.
 *
 * The problem statement doesn't say anything about whether the integers are
 * negative, positive, or zero.  If an array element is a negative integer,
 * does that mean we jump backward?  Let's make various assumptions to
 * simplify the problem:
 *
 * (1) Each integer in the array is non-negative.
 * (2) We start from the zeroth index of the array.
 * (3) Each jump must be to the right, increasing the array index.
 * (4) If the array element is zero, we cannot jump.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const array = [
        [2, 3, 1, 1, 4],
        [2, 4, 1, 2, 3, 2, 4, 2],
        [3, 2, 1, 0, 4],
        [1, 5, 2, 1, 0, 2, 0],
        [5, 4, 3, 2, 1, 0, 0]
    ];
    for (let i = 0; i < array.length; i++) {
        ns.tprint(end_reachable(array[i]));
    }
}
