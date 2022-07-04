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

import { assert, log_cct_failure } from "/libbnr.js";
import { MyArray } from "/lib.array.js";
import { Graph } from "/lib/network.js";

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
    // Cannot jump if the maximum number of jumps is zero.
    const JUMP = true;
    const NO_JUMP = !JUMP;
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
 * @param array An array of non-negative integers.  Cannot be an empty array.
 * @return Array [min_jump, path] of two elements:
 *     (1) min_jump := The minimum number of jumps from the first to the last
 *         cell.  If we cannot reach the last cell, then the minimum number is
 *         0.
 *     (2) path := An array representing the jump path.  An empty array if we
 *         cannot reach the last cell.
 */
function minimum_jump(array) {
    const myarr = new MyArray();
    assert(myarr.all_nonnegative(array));
    // We interpret the array and its elements as a directed graph.  The
    // minimum jump length is found by computing the shortest path from the
    // first cell to the last cell.
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
 * @param array An array of non-negative integers.  Cannot be an empty array.
 * @return A directed, unweighted graph representation of the given array.
 */
function to_graph(array) {
    assert(array.length > 0);
    // First, add the nodes of the directed graph because the graph might be
    // disconnected.  Each node ID is an index of the given array.
    const myarr = new MyArray();
    const node = myarr.sequence(array.length);
    const directed = true;
    const graph = new Graph(directed);
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
        // All possible jumps, where each jump distance is between 1 and
        // array[u], inclusive.
        const max_distance = array[u];
        assert(u < last_index);
        assert(max_distance > 0);
        for (let i = 1; i <= max_distance; i++) {
            const v = u + i;
            // Is v a valid index in array?
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
 * must determine the smallest number of jumps to reach the end of the array.
 * As with Array Jumping Game, we make various assumptions to simplify the
 * problem:
 *
 * (1) Each integer in the array is non-negative.
 * (2) We start from the zeroth index of the array, i.e. the first element.
 * (3) Each jump must be to the right, increasing the array index.
 * (4) If the array element is zero, we cannot jump.
 *
 * Usage: run jump2.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The host name of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const array = ns.codingcontract.getData(cct, host);
    const [min_jump, _] = minimum_jump(array);
    const result = ns.codingcontract.attempt(
        min_jump, cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/jump2.txt";
        const data = "[" + array.join(",") + "]";
        await log_cct_failure(ns, log, cct, host, data);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
