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

import { log_cct_failure, print_error, print_success } from "/lib/cct.js";
import { assert } from "/lib/util.js";

/**
 * The number of unique paths from top-left to bottom-right in an m x n
 * grid.  Consider the grid below.  The problem statement is ambiguous
 * regarding what is considered the top-left corner and the bottom-right
 * corner.  If we are moving from vertex to vertex, then position A in the
 * grid is the top-left corner, B in the grid is the bottom-right corner,
 * and our grid is 5 x 7.  This is a vertex-based grid.  If we are moving
 * from square to square, then X in the grid is the top-left corner, Y is
 * the bottom-right corner, and our grid is 4 x 6.  This square-based grid
 * can be transformed into a vertex-based grid by treating each square as
 * a vertex and the connection between two adjacent squares as an edge.
 *
 * A-o-o-o-o-o-o
 * |X| | | | | |
 * o-o-o-o-o-o-o
 * | | | | | | |
 * o-o-o-o-o-o-o
 * | | | | | | |
 * o-o-o-o-o-o-o
 * | | | | | |Y|
 * o-o-o-o-o-o-B
 *
 * Consider an r x c vertex-based grid, where r is the number of rows and
 * c is the number of columns.  We want to calculate the number of unique
 * paths from the top-left corner to the bottom-right corner.  At each
 * vertex we are allowed to move either down or right.  Each path must have
 * n = (r - 1) + (c - 1) = r + c - 2 segments, i.e. r - 1 downward segments
 * and c - 1 rightward segments.  Choose k := r - 1 of the n segments to be
 * downward segments.  The remaining n - k = c - 1 segments must be
 * rightward segments.  The total number of unique paths is the combination
 * number C(n, k), which is read as "n choose k" or as a k-combination of a
 * set of n segments.  The combination number is also known as the
 * binomial coefficient.
 *
 * @param n The total number of segments.
 * @param k How many segments are downward segments.
 * @return The combination number C(n, k).
 */
function unique_paths(n, k) {
    // Sanity checks.
    assert(n >= 0);
    assert(k >= 0);
    // Edge cases.
    if (k === 0 || n === k) {
        return 1;
    }
    if (k > n) {
        return 0;
    }
    // Use the recurrence relation
    //
    // C(n, k) = C(n - 1, k - 1) + C(n - 1, k)
    //
    // which can be read off Pascal's triangle.  Or use the more
    // efficient multiplicative rule
    //
    // C(n, k) = (n / k) * C(n-1, k-1)
    //
    // which can be directly translated to an iterative program.
    assert(k > 0);
    assert(k < n);
    // By symmetry, we have C(n, k) = C(n, n-k).
    const mink = Math.min(k, n - k);
    let result = 1;
    for (let i = 0; i < mink; i++) {
        // This line of code can result in a floating point number:
        //
        // result *= (n - 1) / (i + 1);
        //
        // because (n - 1) / (i + 1) is not necessarily an integer.
        // Safer to first calculate the product
        //
        // result * (n - i)
        result = (result * (n - i)) / (i + 1);
    }
    return result;
}

/**
 * Unique Paths in a Grid I: You are given an array with two numbers: [m, n].
 * These numbers represent an m x n grid.  Assume you are initially positioned
 * in the top-left corner of that grid and that you are trying to reach the
 * bottom-right corner.  On each step, you may only move down or to the right.
 * Determine how many unique paths there are from start to finish.
 *
 * See the function unique_paths() for more details.
 *
 * Usage: run cct/grid.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The hostname of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const [row, column] = ns.codingcontract.getData(cct, host);
    const k = column - 1;
    const n = row - 1 + k;
    const result = ns.codingcontract.attempt(unique_paths(n, k), cct, host, {
        returnReward: true,
    });
    // Log the result in case of failure.
    if (result.length === 0) {
        const log = "/cct/grid.txt";
        const data = `[${row}, ${column}]`;
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
