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

import { all_nonnegative, assert, DirectedGraph } from "./libbnr.js";

/**
 * Whether we can jump from the current array cell.
 *
 * @param i Index of current array cell.
 * @param array The array.
 * @return true if we can jump from the current cell;
 *     false otherwise;
 */
function can_jump(i, array) {
    // Sanity checks.
    assert(i >= 0);
    assert(i < array.length);

    const JUMP = true;
    const NO_JUMP = !JUMP;
    // Cannot jump if the maximum number of jumps is zero.
    if (0 == array[i]) {
        return NO_JUMP;
    }
    // Cannot jump if we are at the last array cell.
    const last_index = array.length - 1;
    if (last_index == i) {
        return NO_JUMP;
    }
    return JUMP;
}

/**
 * The minimum number of jumps to reach the end of an array.
 *
 * @param array An array of non-negative integers.
 * @return Array of two elements:
 *     * The minimum number of jumps from the first to the last cell.
 *       If we cannot reach the last cell, then the minimum number is 0.
 *     * An array representing the jump path.  An empty array if we
 *       cannot reach the last cell.
 */
function minimum_jump(array) {
    assert(all_nonnegative(array));
    const start = 0;
    const end = array.length - 1;
    const graph = to_graph(array);
    const path = graph.shortest_path(start, end);
    // Cannot reach the last cell of the given array.
    if (0 == path.length) {
        return [0, []];
    }
    // We can reach the last cell of the array.
    assert(path.length > 0);
    const min_jump = path.length - 1;
    assert(min_jump > 0);
    return [min_jump, path];
}

/**
 * Construct a directed, unweighted graph from the given array.
 *
 * @param An array of non-negative integers.
 * @return A directed, unweighted graph representation of the given array.
 */
function to_graph(array) {
    assert(array.length > 0);

    // Add the nodes of the graph.
    // Each node ID is an index of the given array.
    const node = Array(array.length).fill().map((_, index) => index);
    const graph = new DirectedGraph();
    for (const v of node) {
        graph.add_node(v);
    }

    // Add the directed edges of the graph.
    const last_index = array.length - 1;
    for (const u of node) {
        // Cannot jump from current array cell.
        if (!can_jump(u, array)) {
            continue;
        }
        const max_jump = array[u];
        assert(u < last_index);
        assert(max_jump > 0);
        for (let i = 1; i <= max_jump; i++) {
            const v = u + i;
            // Is v a valid index for array?
            if (v > last_index) {
                continue;
            }
            graph.add_edge(u, v);
        }
    }
    return graph;
}

/**
 * Array Jumping Game II: You are given an array of integers where each
 * element represents the maximum possible jump distance from that position.
 * For example, if you are at position i and your maximum jump length is n,
 * then you can jump to any position from i to i+n.  Assuming you are
 * initially positioned at the start of the array, determine the minimum
 * number of jumps to reach the end of the array.  If it's impossible to
 * reach the end, then the answer should be 0.
 *
 * This is similar to Array Jumping Game.  The only difference is that you
 * must determine the smallest number of jumps to each the end of the array.
 * Edit the script to give it the input array.  As with Array Jumping Game,
 * we make various assumptions to simplify the problem:
 *
 * (1) Each integer in the array is non-negative.
 * (2) We start from the zeroth index of the array, i.e. the first element.
 * (3) Each jump must be to the right, increasing the array index.
 * (4) If the array element is zero, we cannot jump.
 *
 * Usage: run cct-jump2.js
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
        const [min_jump, path] = minimum_jump(array[i]);
        ns.tprint(min_jump + ": " + path);
    }
}
