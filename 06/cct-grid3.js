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

import { assert, UndirectedGraph } from "./libbnr.js";

/**
 * Whether we can move one step down from our current position on a grid.
 *
 * @param grid A map as an array of arrays.  This is essentially a binary
 *     matrix, where each entry is either 0 or 1.
 * @param r, c Our current location (r, c) on the grid.
 * @return true if we can move from (r, c) one step down; false otherwise.
 */
function can_move_down(grid, r, c) {
    const CAN_MOVE = true;
    const NO_MOVE = !CAN_MOVE;
    // We are at the bottom-most edge of the grid.
    const lastidx = grid.length - 1;
    if (lastidx == r) {
        return NO_MOVE;
    }
    // Below us is an obstacle.
    assert(r >= 0);
    assert(r < lastidx);
    if (is_obstacle(grid, r + 1, c)) {
        return NO_MOVE;
    }
    // We can move one step down.
    return CAN_MOVE;
}

/**
 * Whether we can move one step to the left from our current position on
 * a grid.
 *
 * @param grid A map as an array of arrays.  This is essentially a binary
 *     matrix, where each entry is either 0 or 1.
 * @param r, c Our current location (r, c) on the grid.
 * @return true if we can move from (r, c) one step to the left;
 *     false otherwise.
 */
function can_move_left(grid, r, c) {
    const CAN_MOVE = true;
    const NO_MOVE = !CAN_MOVE;
    // We are at the left-most edge of the grid.
    if (0 == c) {
        return NO_MOVE;
    }
    // To our left is an obstacle.
    assert(c > 0);
    assert(c < grid[r].length);
    if (is_obstacle(grid, r, c - 1)) {
        return NO_MOVE;
    }
    // We can move to the left.
    return CAN_MOVE;
}

/**
 * Whether we can move one step to the right from our current position on
 * a grid.
 *
 * @param grid A map as an array of arrays.  This is essentially a binary
 *     matrix, where each entry is either 0 or 1.
 * @param r, c Our current location (r, c) on the grid.
 * @return true if we can move from (r, c) one step to the right;
 *     false otherwise.
 */
function can_move_right(grid, r, c) {
    const CAN_MOVE = true;
    const NO_MOVE = !CAN_MOVE;
    const lastidx = grid[r].length - 1;
    // We are at the right-most edge of the grid.
    if (lastidx == c) {
        return NO_MOVE;
    }
    // To our right is an obstacle.
    assert(c >= 0);
    assert(c < lastidx);
    if (is_obstacle(grid, r, c + 1)) {
        return NO_MOVE;
    }
    // We can move to the right.
    return CAN_MOVE;
}

/**
 * Whether we can move one step up from our current position on a grid.
 *
 * @param grid A map as an array of arrays.  This is essentially a binary
 *     matrix, where each entry is either 0 or 1.
 * @param r, c Our current location (r, c) on the grid.
 * @return true if we can move from (r, c) one step up; false otherwise.
 */
function can_move_up(grid, r, c) {
    const CAN_MOVE = true;
    const NO_MOVE = !CAN_MOVE;
    // We are at the top-most edge of the grid.
    if (0 == r) {
        return NO_MOVE;
    }
    // Above us is an obstacle.
    assert(r > 0);
    assert(r < grid.length);
    if (is_obstacle(grid, r - 1, c)) {
        return NO_MOVE;
    }
    // We can move one step up.
    return CAN_MOVE;
}

/**
 * Is the given location an obstacle?
 *
 * @param grid A map as an array of arrays.  This is essentially a binary
 *     matrix, where each entry is either 0 or 1.
 * @param r, c A location on the grid.
 * @return true if the given location is an obstacle on the grid;
 *     false otherwise.
 */
function is_obstacle(grid, r, c) {
    return (1 == grid[r][c]);
}

/**
 * Use the Cantor pairing function to assign a unique non-negative integer
 * to a pair of coordinates.
 *
 * @param x, y A pair of coordinates (x, y), each number being a
 *     non-negative integer.
 * @return A unique non-negative interger associated with the coordinates
 *     (x, y).
 */
function pairing(x, y) {
    assert(x >= 0);
    assert(y >= 0);
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
 * @param grid A map as an array of arrays.  This is essentially a binary
 *     matrix, where each entry is either 0 or 1.
 */
function shortest_path(grid) {
    const graph = to_graph(grid);
    const a = pairing(0, 0);
    const b = pairing(grid.length - 1, grid[0].length - 1);
    return graph.shortest_path(a, b);
}

/**
 * A representation of a grid as an unweighted, undirected graph.
 *
 * @param grid A map as an array of arrays.  This is essentially a binary
 *     matrix, where each entry is either 0 or 1.
 * @return An undirected graph representation of the grid.  Each vertex is
 *     a non-negative integer n that is uniquely associated with a location
 *     (r, c) on the grid.  We use the Cantor pairing function (and its
 *     inverse) to map between n and (r, c).
 */
function to_graph(grid) {
    assert(grid.length > 0);
    const ncol = grid[0].length;
    const graph = new UndirectedGraph();
    for (let r = 0; r < grid.length; r++) {
        assert(ncol == grid[r].length);
        for (let c = 0; c < ncol; c++) {
            // Our current location is u := (r, c).
            const u = pairing(r, c);
            // Is this an obstacle?
            if (is_obstacle(grid, r, c)) {
                continue;
            }
            // Can we move one step left?
            assert(0 == grid[r][c]);
            if (can_move_left(grid, r, c)) {
                const v = pairing(r, c - 1);
                graph.add_edge(u, v);
            }
            // Can we move right?
            if (can_move_right(grid, r, c)) {
                const v = pairing(r, c + 1);
                graph.add_edge(u, v);
            }
            // Can we move up?
            if (can_move_up(grid, r, c)) {
                const v = pairing(r - 1, c);
                graph.add_edge(u, v);
            }
            // Can we move down?
            if (can_move_down(grid, r, c)) {
                const v = pairing(r + 1, c);
                graph.add_edge(u, v);
            }
        }
    }
    return graph;
}

/**
 * Use the inverse of the Cantor pairing function to break a non-negative
 * integer into a pair of coordinates (x, y).
 *
 * @param z A non-negative integer.
 * @return A pair of coordinates (x, y) that is uniquely associated with z.
 */
function unpairing(z) {
    assert(z >= 0);
    const numer = Math.sqrt(8*z + 1) - 1;
    const w = Math.floor(numer / 2);
    const t = ((w**2) + w) / 2;
    const y = z - t;
    const x = w - y;
    return [x, y];
}

/**
 * Shortest Path in a Grid: You are given a 2D array of numbers (array of array
 * of numbers) representing a grid.  The 2D array contains 1's and 0's, where 1
 * represents an obstacle and 0 represents a free space.  Assume you are
 * initially positioned in top-left corner of that grid and that you are trying
 * to reach the bottom-right corner.  In each step, you may move up, down, left
 * or right.  Furthermore, you cannot move onto spaces which have obstacles.
 * Determine if paths exist from start to destination, and find the shortest
 * one.
 *
 * Edit the script to give the grid layout.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const map_small = [
        [0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0]
    ];
    ns.tprint("Map");
    for (let i = 0; i < map_small.length; i++) {
        ns.tprint(map_small[i]);
    }
    ns.tprint("Path");
    for (const n of shortest_path(map_small)) {
        ns.tprint(unpairing(n));
    }

    const map_large = [
        [0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0]
    ];
    ns.tprint("Map");
    for (let i = 0; i < map_large.length; i++) {
        ns.tprint(map_large[i]);
    }
    ns.tprint("Path");
    for (const n of shortest_path(map_large)) {
        ns.tprint(unpairing(n));
    }
}
