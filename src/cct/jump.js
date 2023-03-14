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
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * Whether we can reach the last cell of an array.  We use a greedy approach.
 * Try to jump the maximum distance, otherwise backtrack and/or reduce the
 * jump distance.
 *
 * @param array An array of integers.  Cannot be an empty array.
 * @return 1 if starting from the first array cell we can reach the last array
 *     cell; 0 otherwise.
 */
function end_reachable(array) {
    assert(MyArray.all_nonnegative(array));
    const can_jump = (i, d) => i + d < array.length;
    let d = -1; // The jump distance.
    let i = 0; // Current index in array.
    const d_idx = 0; // Index of d in array [d, i].
    const jump = []; // Each element is an array [d, i].
    let reduce_distance = false;
    while (i < array.length) {
        // Do we need to reduce the jump distance?
        if (reduce_distance) {
            // Decrease by 1 the jump distance.
            const k = last_index(jump);
            jump[k][d_idx]--;
            reduce_distance = false;
        } else {
            // Current maximum jump distance.
            d = array[i];
            jump.push([d, i]);
        }
        // Are we at the last array cell?
        if (is_last_cell(i, array)) {
            return bool.REACHABLE;
        }
        // Zero jump distance.
        [d, i] = jump[last_index(jump)];
        if (d === 0) {
            // Does the first array cell have zero as the jump distance?
            if (i === 0) {
                return bool.NOT_REACHABLE;
            }
            // Backtrack and reduce jump distance.
            jump.pop();
            reduce_distance = true;
            continue;
        }
        // Can we jump the given distance?
        if (can_jump(i, d)) {
            i += d;
        } else {
            reduce_distance = true;
        }
    }
}

/**
 * Whether we are at the last array cell.
 *
 * @param i Index of the current array cell.
 * @param array An array of integers.  Cannot be an empty array.
 * @return True if i is the last index of the array;
 *     false otherwise.
 */
function is_last_cell(i, array) {
    assert(i >= 0);
    assert(i < array.length);
    return i === last_index(array);
}

/**
 * The last index of an array.
 *
 * @param array A nonempty array.
 * @return The last index of the given array.
 */
function last_index(array) {
    assert(array.length > 0);
    return array.length - 1;
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
 * Submit your answer as 1 (meaning true) or 0 (meaning false).
 *
 * Usage: run quack/cct/jump.js [cct] [hostname]
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
    const result = ns.codingcontract.attempt(end_reachable(array), cct, host);
    // Log the result in case of failure.
    if (is_empty_string(result)) {
        const log = "/quack/cct/jump.txt";
        const data = `[${array.join(",")}]`;
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
