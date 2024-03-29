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

import {
    log_cct_failure,
    matrix_to_string,
    print_error,
    print_success,
} from "/quack/lib/cct.js";
import { bool } from "/quack/lib/constant/bool.js";
import { empty_string } from "/quack/lib/constant/misc.js";
import { Graph } from "/quack/lib/network.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * Whether we can move one step down from our current position on a grid.
 *
 * @param {array<array>} grid A map as an array of arrays.  This is essentially
 *     a binary matrix, where each entry is either 0 or 1.
 * @param {number} r The row index of our current location (r, c) on the grid.
 * @param {number} c The column index of our current location (r, c) on the
 *     grid.
 * @returns {boolean} True if we can move from (r, c) one step down;
 *     false otherwise.
 */
function can_move_down(grid, r, c) {
    // Are we at the bottom-most edge of the grid?
    const lastidx = grid.length - 1;
    if (lastidx === r) {
        return bool.NOT_MOVE;
    }

    // Below us is an obstacle.
    assert(r >= 0);
    assert(r < lastidx);
    if (is_obstacle(grid, r + 1, c)) {
        return bool.NOT_MOVE;
    }
    // We can move one step down.
    return bool.MOVE;
}

/**
 * Whether we can move one step to the left from our current position on
 * a grid.
 *
 * @param {array<array>} grid A map as an array of arrays.  This is essentially
 *     a binary matrix, where each entry is either 0 or 1.
 * @param {number} r The row index of our current location (r, c) on the grid.
 * @param {number} c The column index of our current location (r, c) on the
 *     grid.
 * @returns {boolean} True if we can move from (r, c) one step to the left;
 *     false otherwise.
 */
function can_move_left(grid, r, c) {
    // Are we at the left-most edge of the grid?
    if (c === 0) {
        return bool.NOT_MOVE;
    }

    // To our left is an obstacle.
    assert(c > 0);
    assert(c < grid[r].length);
    if (is_obstacle(grid, r, c - 1)) {
        return bool.NOT_MOVE;
    }
    // We can move to the left.
    return bool.MOVE;
}

/**
 * Whether we can move one step to the right from our current position on
 * a grid.
 *
 * @param {array<array>} grid A map as an array of arrays.  This is essentially
 *     a binary matrix, where each entry is either 0 or 1.
 * @param {number} r The row index of our current location (r, c) on the grid.
 * @param {number} c The column index of our current location (r, c) on the
 *     grid.
 * @returns {boolean} True if we can move from (r, c) one step to the right;
 *     false otherwise.
 */
function can_move_right(grid, r, c) {
    const lastidx = grid[r].length - 1;
    // Are we at the right-most edge of the grid?
    if (lastidx === c) {
        return bool.NOT_MOVE;
    }

    // To our right is an obstacle.
    assert(c >= 0);
    assert(c < lastidx);
    if (is_obstacle(grid, r, c + 1)) {
        return bool.NOT_MOVE;
    }
    // We can move to the right.
    return bool.MOVE;
}

/**
 * Whether we can move one step up from our current position on a grid.
 *
 * @param {array<array>} grid A map as an array of arrays.  This is essentially
 *     a binary matrix, where each entry is either 0 or 1.
 * @param {number} r The row index of our current location (r, c) on the grid.
 * @param {number} c The column index of our current location (r, c) on the
 *     grid.
 * @returns {boolean} True if we can move from (r, c) one step up;
 *     false otherwise.
 */
function can_move_up(grid, r, c) {
    // Are we at the top-most edge of the grid?
    if (r === 0) {
        return bool.NOT_MOVE;
    }

    // Above us is an obstacle.
    assert(r > 0);
    assert(r < grid.length);
    if (is_obstacle(grid, r - 1, c)) {
        return bool.NOT_MOVE;
    }
    // We can move one step up.
    return bool.MOVE;
}

/**
 * Is the given location an obstacle?
 *
 * @param {array<array>} grid A map as an array of arrays.  This is essentially
 *     a binary matrix, where each entry is either 0 or 1.
 * @param {number} r The row index of a location (r, c) on the grid.
 * @param {number} c The column index of a location (r, c) on the grid.
 * @returns {boolean} True if the given location is an obstacle on the grid;
 *     false otherwise.
 */
function is_obstacle(grid, r, c) {
    return grid[r][c] === 1;
}

/**
 * Use the Cantor pairing function to assign a unique non-negative integer to a
 * pair of coordinates.
 *
 * @param {number} x The x-coordinate in (x, y).
 * @param {number} y The y-coordinate in (x, y).
 * @returns {number} A unique non-negative integer associated with the
 *     coordinates (x, y).
 */
function pairing(x, y) {
    assert(x >= 0);
    assert(y >= 0);
    // One of a and b is even, while the other is odd.  The product ab is even,
    // therefore (1/2) * ab is an integer.
    const a = x + y;
    const b = a + 1;
    return (1 / 2) * (a * b) + y;
}

/**
 * A shortest path in a 2-D grid.  Consider the following grid
 *
 * 0010
 * 0100
 * 0000
 *
 * which can be represented as the following map.
 *
 *   0 1 2 3
 * 0 0-0-1-0
 *   | | | |
 * 1 0-1-0-0
 *   | | | |
 * 2 0-0-0-0
 *
 * The top-left corner has the coordinates (0, 0) and the bottom-right
 * corner has the coordinates (2, 3).  We have 2 obstacles at the
 * coordinates (0, 2) and (1, 1).  Our task is to determine a shortest
 * path from the top-left corner to the bottom-right corner, using as
 * few moves as possible.  At any point on the map, we can move one step
 * either up, down, left, or right but only to a pair of coordinates that
 * represents 0.  We cannot move to a pair of coordinates that represents
 * an obstacle.
 *
 * @param {array<array>} grid A map as an array of arrays.  This is essentially
 *     a binary matrix, where each entry is either 0 or 1.
 * @returns {string} A string representing a shortest path in the grid, from the
 *     top-left corner to the bottom-right corner.  Each character of the
 *     string is either U, D, L, R.  An empty string if there are no paths
 *     from the top-left to the bottom-right.
 */
function shortest_path(grid) {
    // Represent the grid as an undirected graph.  Find a shortest path from
    // the top-left corner to the bottom-right corner.
    const graph = to_graph(grid);
    const a = pairing(0, 0);
    const b = pairing(grid.length - 1, grid[0].length - 1);
    if (!graph.has_node(a) || !graph.has_node(b)) {
        return empty_string;
    }
    const path = graph.shortest_path(a, b);
    return path_to_string(path);
}

/**
 * A representation of a grid as an unweighted, undirected graph.
 *
 * @param {array<array>} grid A map as an array of arrays.  This is essentially
 *     a binary matrix, where each entry is either 0 or 1.
 * @returns {Graph} An undirected graph representation of the grid.  Each vertex
 *     is a non-negative integer n that is uniquely associated with a location
 *     (r, c) on the grid.  We use the Cantor pairing function (and its
 *     inverse) to map between n and (r, c).
 */
function to_graph(grid) {
    assert(grid.length > 0);
    const ncol = grid[0].length;
    const graph = new Graph(bool.UNDIRECTED);
    for (let r = 0; r < grid.length; r++) {
        assert(ncol === grid[r].length);
        for (let c = 0; c < ncol; c++) {
            // Our current location is u := (r, c).
            const u = pairing(r, c);
            // Is this an obstacle?
            if (is_obstacle(grid, r, c)) {
                continue;
            }
            // Can we move one step left?
            assert(grid[r][c] === 0);
            if (can_move_left(grid, r, c)) {
                const v = pairing(r, c - 1);
                graph.add_edge(u, v);
            }
            // Can we move one step right?
            if (can_move_right(grid, r, c)) {
                const v = pairing(r, c + 1);
                graph.add_edge(u, v);
            }
            // Can we move one step up?
            if (can_move_up(grid, r, c)) {
                const v = pairing(r - 1, c);
                graph.add_edge(u, v);
            }
            // Can we move one step down?
            if (can_move_down(grid, r, c)) {
                const v = pairing(r + 1, c);
                graph.add_edge(u, v);
            }
        }
    }
    return graph;
}

/**
 * Convert from a graph-theoretic path to a path given in terms of the
 * following directions.
 *
 * * U := move up by one step.
 * * D := move down by one step.
 * * L := move left by one step.
 * * R := move right by one step.
 *
 * @param {array<array>} gpath An array of nodes representing a path in a graph.
 * @returns {string} A string comprised of the characters U, D, L, R to indicate
 *     a path.  An empty string if gpath is an empty array.
 */
function path_to_string(gpath) {
    // No shortest paths in the grid.
    if (gpath.length === 0) {
        return empty_string;
    }
    // We have a shortest path in the grid.
    const path = [];
    let [rold, cold] = unpairing(gpath[0]);
    for (const v of gpath.slice(1, gpath.length)) {
        const [r, c] = unpairing(v);
        // Are we moving up?
        if (rold - 1 === r) {
            path.push("U");
        }
        // Are we moving down?
        if (rold + 1 === r) {
            path.push("D");
        }
        // Are we moving left?
        if (cold - 1 === c) {
            path.push("L");
        }
        // Are we moving right?
        if (cold + 1 === c) {
            path.push("R");
        }
        [rold, cold] = [r, c];
    }
    return path.join(empty_string);
}

/**
 * Use the inverse of the Cantor pairing function to break a non-negative
 * integer into a pair of coordinates (x, y).
 *
 * @param {number} z A non-negative integer.
 * @returns {array} A pair of coordinates (x, y) uniquely associated with z.
 */
function unpairing(z) {
    assert(z >= 0);
    const numer = Math.sqrt(8 * z + 1) - 1;
    const w = Math.floor(numer / 2);
    const t = (w ** 2 + w) / 2;
    const y = z - t;
    const x = w - y;
    return [x, y];
}

/**
 * Shortest Path in a Grid: You are given a 2-D array of numbers (array of
 * arrays) representing a grid, i.e. a 2-D matrix.  The 2-D array contains 1s
 * and 0s, where 1 represents an obstacle and 0 represents a free space.
 * Assume you are initially positioned at the top-left square of the grid and
 * you are trying to reach the bottom-right square.  In each step, you may move
 * up, down, left, or right.  Furthermore, you cannot move onto spaces that
 * have obstacles.  Determine a shortest path from start to finish, if one
 * exists.  The answer should be given as a string of UDLR characters,
 * indicating the moves along the path.
 *
 * NOTE: If there are multiple equally short paths, any of them is accepted as
 * answer.  If there are no paths, the answer should be an empty string.
 *
 * Usage: run quack/cct/grid3.js [cct] [hostname]
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const [cct, host] = ns.args;

    // Solve the Coding Contract.
    const grid = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(shortest_path(grid), cct, host);

    // Log the result in case of failure.
    if (is_empty_string(result)) {
        const log = "/quack/cct/grid3.txt";
        const data = matrix_to_string(grid);
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
