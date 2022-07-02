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

import { assert, log_cct_failure, matrix_to_string } from "./libbnr.js";

/**
 * Whether an obstacle is found at the coordinates (r, c).
 *
 * @param grid A grid of m x n squares.
 * @param r, c A pair of coordinates in the grid.
 * @return true if an obstacle is located at (r, c); false otherwise.
 */
function is_obstacle(grid, r, c) {
    if (1 == grid[r][c]) {
        return true;
    }
    return false;
}

/**
 * The number of unique paths from the top-left square to the bottom-right
 * square in an m x n grid, while avoiding obstacles.  Consider the grid below.
 *
 * 00000
 * 01000
 * 00010
 * 10000
 *
 * Interpret each number as a square.  The entire grid is made up of m x n
 * squares.  We can occupy a square that has the symbol '0', whereas a square
 * having the symbol '1' is interpreted as an obstacle that cannot be occupied.
 * Starting from the top-left square, we can move either to the square
 * immediately to the right or the square immediately below, but never to a
 * square that has an obstacle.
 *
 * Use the following row-column coordinate system for the above grid.
 *
 *   0 1 2 3 4
 * 0 0-0-0-0-0
 *   | | | | |
 * 1 0-1-0-0-0
 *   | | | | |
 * 2 0-0-0-1-0
 *   | | | | |
 * 3 1-0-0-0-0
 *
 * The obstacles are located at the coordinates a := (1, 1), b := (2, 3), and
 * c := (3, 0).  Let A be the set of paths passing through obstacle a, let B be
 * the set of paths passing through obstacle b, and let C be the set of paths
 * passing through obstacle c.  Let P be the set of paths from (0, 0) to
 * (3, 4).  The number of paths that avoid the obstacles is written as
 *
 * |P| = |X| - |A union B union C|
 *
 * where "union" refers to set union.  The number |A union B union C| can
 * be calculated by using the principle of inclusion-exclusion.
 *
 * The problem can also be solved in a recursive manner.  Define p[i][j] as the
 * number of paths starting from (0, 0), end at (i, j), and do not include any
 * obstacles.  Since our movement is restricted to only right or down, we can
 * reach (i, j) in either of two ways: (1) from (i-1, j); or (2) from (i, j-1).
 * Thus we have the recurrence relation
 *
 * p[i][j] = p[i-1][j] + p[i][j-1]
 *
 * where i >= 1 and j >= 1.  There are 3 other possibilities for the values of
 * i and j.
 *
 * (1) If i = 0 and j >=1, then (0, j) can be reached from (0, j-1) so we have
 *     p[0][j] = p[0][j-1].  There is only 1 path along the top-most row, but
 *     this does not necessarily mean that p[0][j] = 1.  The reason is that any
 *     square with coordinates (0, j) can be an obstacle.
 * (2) If i >= 1 and j = 0, then (i, 0) is reached from (i-1, 0), hence
 *     p[i][0] = p[i-1][0].  There is only 1 path along the left-most column,
 *     but this does not mean we must have p[i][0] = 1.  The reason is that one
 *     of the coordinates (i, 0) might be an obstacle.
 * (3) If i = 0 and j = 0, then p[0][0] = 1 because the number of paths from
 *     (0, 0) to itself is 1.
 *
 * The edge case is when (i, j) is an obstacle so we set p[i][j] = 0.
 *
 * @param grid A grid of m x n squares.
 * @return The number of different paths from (0, 0) to (m-1, n-1) without
 *     passing through any obstacles.
 */
function unique_paths(grid) {
    // Sanity checks.
    const nrow = grid.length;
    const ncol = grid[0].length;
    assert(nrow > 0);
    assert(ncol > 0);
    // The table of path counts.
    const path = new Array();
    for (let i = 0; i < nrow; i++) {
        assert(ncol == grid[i].length);
        path.push(new Array(ncol));
    }
    // Start from (0, 0) and work our way to (m-1, n-1).
    for (let r = 0; r < nrow; r++) {
        for (let c = 0; c < ncol; c++) {
            // Is (r, c) an obstacle?
            if (is_obstacle(grid, r, c)) {
                path[r][c] = 0;
                continue;
            }
            // r = 0, c = 0
            if ((0 == r) && (0 == c)) {
                path[r][c] = 1;
                continue;
            }
            // r = 0, c >= 1
            if ((0 == r) && (c >= 1)) {
                path[r][c] = path[r][c - 1];
                continue;
            }
            // r >= 1, c = 0
            if ((r >= 1) && (0 == c)) {
                path[r][c] = path[r - 1][c];
                continue;
            }
            // A pair of coordinates not located along the top-most row or the
            // left-most column.
            // r >= 1, c >= 1
            assert(r > 0);
            assert(c > 0);
            path[r][c] = path[r - 1][c] + path[r][c - 1];
        }
    }
    return path[nrow - 1][ncol - 1];
}

/**
 * Unique Paths in a Grid II: You are given a 2-D array of numbers (array of
 * arrays of numbers) representing a grid, i.e. a 2-D matrix.  The 2-D array
 * contains 1s and 0s, where 1 represents an obstacle and 0 represents a free
 * space.  Assume you are initially positioned in top-left square of that grid
 * and that you are trying to reach the bottom-right square.  In each step, you
 * may only move down or to the right.  Furthermore, you cannot move onto a
 * square that has an obstacle.  Determine how many unique paths there are from
 * start to finish.
 *
 * See the function unique_paths() for more details.
 *
 * Usage: run grid2.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The host name of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const grid = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(
        unique_paths(grid), cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/grid2.txt";
        const data = matrix_to_string(grid);
        await log_cct_failure(ns, log, cct, host, data);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
