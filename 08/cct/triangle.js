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

import { log_cct_failure, matrix_to_string } from "/lib/cct.js";
import { assert } from "/lib/util.js";

/**
 * A deep copy of a triangle.
 *
 * @param triangle A triangle represented as an array of arrays.
 * @return The same triangle, but as a deep copy.
 */
function clone(triangle) {
    const new_triangle = new Array();
    for (let i = 0; i < triangle.length; i++) {
        const level = [...triangle[i]];
        new_triangle.push(level);
    }
    return new_triangle;
}

/**
 * Descend from the top to the bottom of a triangle, finding a path of minimum
 * sum as we go.
 *
 * @param triangle A triangle represented as an array of arrays.
 * @return An array [path, min_sum] as follows:
 *     (1) path := A path of minimum sum from the top of the triangle to the
 *         bottom.
 *     (2) min_sum := The minimum path sum.
 */
function descend(triangle) {
    // Sanity checks.
    assert(is_triangle(triangle));
    if (1 == triangle.length) {
        return [triangle[0], triangle[0][0]];
    }
    // A triangle having at least 2 levels.  Consider the following triangle:
    //
    // (0)       2
    // (1)     3   4
    // (2)   6   5   7
    // (3) 4   1   8   3
    //
    // Think of the problem in a top-down manner.  To obtain a path of minimum
    // sum from level (0) to level (3), we must obtain a path of minimum sum
    // from level (0) to level (2), which in turn requires that we obtain a path
    // of minimum sum from level (0) to level (1).  Let min_sum be the minimum
    // sum of a path from level (0) to level (i) and suppose this path ends at
    // a[j], the j-th number at level (i).  Let b be an array of numbers at
    // level (i + 1).  The minimum sum of a path from level (0) to level
    // (i + 1) is given by
    //
    // min_sum + mininum(b[j], b[j + 1])
    //
    // Alternatively, consider the problem in a bottom-up manner.  Any minimum
    // path must end at the bottom level of the triangle.  Let i be any level
    // in the triangle, except for the last level.  Let mtriangle[i][j] be the
    // j-th number at level (i) and update this number to
    //
    // mtriangle[i][j] := mtriangle[i][j] + minimum(b[j], b[j + 1])
    //
    // where b is an array of numbers at level (i + 1).  Move up one level and
    // repeat the above calculation, propagating the minimum sum up the
    // triangle so that mtriangle[0][0] is the minimum sum of any path.

    // Get a deep copy of the triangle.  We don't want to modify the input
    // triangle.
    const mtriangle = clone(triangle);
    const path = new Array();
    // Start from the penultimate level and work upward to the top level.
    // Keep track of a minimum path as we move along.
    for (let i = (triangle.length - 2); i >= 0; i--) {
        // The minimum sum at level i.
        let minsum = Infinity;
        // A node at level i + 1.  This is a node of a path of minimum sum.
        let mink = Infinity;
        for (let j = 0; j < triangle[i].length; j++) {
            // Consider nodes at level i + 1.
            const a = mtriangle[i + 1][j];
            const b = mtriangle[i + 1][j + 1];
            mtriangle[i][j] += Math.min(a, b);
            // Update the path of minimum sum.  We keep track of the column
            // index at level i + 1.
            if (minsum > mtriangle[i][j]) {
                minsum = mtriangle[i][j];
                mink = (a < b) ? j : (j + 1);
            }
        }
        path.push(mink);
    }
    path.push(0);
    path.reverse();
    // Reconstruct a path of minimum sum.  This path contains the intermediate
    // nodes from the top of the triangle to the bottom level.
    for (let i = 0; i < triangle.length; i++) {
        path[i] = triangle[i][path[i]];
    }
    return [path, mtriangle[0][0]];
}

/**
 * Whether the given array represents a valid triangle.
 *
 * @param triangle A triangle represented as an array of arrays.
 * @return true if the array represents a triangle; false otherwise.
 */
function is_triangle(triangle) {
    assert(triangle.length > 0);
    const VALID = true;
    const NOT_VALID = !VALID;
    for (let i = 0; i < triangle.length - 1; i++) {
        const top = triangle[i];
        const bottom = triangle[i + 1];
        if (top.length < 1) {
            return NOT_VALID;
        }
        if (bottom.length < 1) {
            return NOT_VALID;
        }
        if (top.length != (bottom.length - 1)) {
            return NOT_VALID;
        }
    }
    return VALID;
}

/**
 * Minimum Path Sum in a Triangle: You are given a 2-D array of numbers
 * (array of array of numbers) that represents a triangle (the first array
 * has one element, each sequent array has one more element than the one before
 * it, forming a triangle).  Find the minimum path sum from the top to the
 * bottom of the triangle.  In each step of the path, you may only move to
 * adjacent numbers in the row below.
 *
 * For example, given this array
 *
 * [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]
 *
 * we can represent it as this triangle
 *
 *       2
 *     3   4
 *   6   5   7
 * 4   1   8   3
 *
 * From one level of the triangle, we move to a level below but only to a
 * number directly below a given number.  At level 0, we have [2].  At level
 * 1, we have [3, 4].  From 3, we can move down to either 6 or 5, but we
 * cannot move from 3 to 7 because 7 is not directly below 3.
 *
 * Usage: run triangle.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The host name of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const triangle = ns.codingcontract.getData(cct, host);
    const [_, sum] = descend(triangle);
    const result = ns.codingcontract.attempt(
        sum, cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/triangle.txt";
        const data = matrix_to_string(triangle);
        await log_cct_failure(ns, log, cct, host, data);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
