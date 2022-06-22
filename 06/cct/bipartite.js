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

import {
    assert, Graph, log_cct_failure, matrix_to_string, sequence
} from "./libbnr.js";

/**
 * Whether an undirected graph is bipartite.  Assume the graph is
 * connected, i.e. each node is reachable from any other node.
 *
 * @param n The number of nodes in the graph.  Must be positive.
 * @param edge An array of edges of the graph.  Each array element is an
 *     edge of the form [u, v], where u and v are nodes of the graph.
 * @return An array having n elements.  If i is an index of the array a,
 *     then a[i] represents the colour of node i in the graph, assuming
 *     the graph to have a 2-colouring.  In case the graph is not
 *     bipartite, then return an empty array.
 */
function bipartite(n, edge) {
    assert(n > 0);
    // The graph must have at least one edge.  A graph with nodes only and
    // no edges is not bipartite.
    if (0 == edge.length) {
        return [];
    }
    // Use breath-first search to colour each node of the graph.
    const graph = to_graph(n, edge);
    const BLUE = 0;
    const RED = 1;
    const WHITE = -1;  // An uncoloured node is white.
    let colour = new Array(n).fill(WHITE);
    let v = choose_white_node(colour, WHITE);
    // All root nodes of trees.  If the graph is disconnected, then it has
    // a number of subgraphs each of which can be considered a tree by
    // means of breath-first search.
    const root = new Array();
    // Colour all nodes of the graph.
    while (v >= 0) {
        root.push(v);
        const col = colouring(graph, v, BLUE, RED, WHITE);
        if (0 == col.length) {
            return [];
        }
        colour = update_colouring(colour, col, WHITE);
        v = choose_white_node(colour, WHITE);
    }
    // Determine whether the graph has a 2-colouring.
    for (const r of root) {
        if (!is_bipartite(graph, r, colour)) {
            return [];
        }
    }
    return colour;
}

/**
 * Choose a white node from a graph.
 *
 * @param colour A colouring of the nodes of a graph, where colour[i]
 *     represents the colour of node i.
 * @param white The colour value for white.
 * @return A node that is white.  Return -1 if each node has been coloured.
 */
function choose_white_node(colour, white) {
    assert(colour.length > 0);
    for (let i = 0; i < colour.length; i++) {
        if (white == colour[i]) {
            return i;
        }
    }
    return -1;
}

/**
 * Attempt to colour a graph by using 2 colours.  Each node is coloured such
 * that the endpoints of an edge have different colours.
 *
 * @param graph We want to colour this graph.
 * @param root Start the colouring from this node.
 * @param blue, red Colour the graph using these colours.
 * @param white Each node that is not yet coloured is set to white.
 * @return An array a where the element a[i] represents the colour of node i
 *     in the graph.  An empty array if the graph cannot be coloured with the
 *     given colours such that the endpoints of each edge have different
 *     colours.  Even if the returned array is not empty, we must still test
 *     to see whether the graph has a 2-colouring.
 */
function colouring(graph, root, blue, red, white) {
    // colour[i] := the colour of node i in the graph.
    const n = graph.nodes().length;
    const colour = new Array(n).fill(white);
    const BLUE = blue;
    const RED = red;
    // Colour the root node.
    assert(graph.has_node(root));
    const stack = new Array();
    stack.push(root);
    const visit = new Set();
    visit.add(root);
    colour[root] = BLUE;
    // Use breath-first search to colour each node.  We assume the graph is
    // connected.
    while (stack.length > 0) {
        const u = stack.pop();
        for (const v of graph.neighbour(u)) {
            if (visit.has(v)) {
                continue;
            }
            // Colour the neighbours of u.
            visit.add(v);
            stack.push(v);
            if (BLUE == colour[u]) {
                colour[v] = RED;
                continue;
            }
            assert(RED == colour[u]);
            colour[v] = BLUE;
            // Determine whether v is connected to any node of the same colour.
            for (const w of graph.neighbour(v)) {
                // The graph is not bipartite because v is neighbour with a
                // node that has the same colour.
                if (colour[v] == colour[w]) {
                    return [];
                }
            }
        }
    }
    return colour;
}

/**
 * Whether a graph is bipartite.
 *
 * @param graph Check this graph to see whether it is bipartite.
 * @param root Start our breath-first search from this node.
 * @param colour A colouring of the nodes of the graph.
 * @return true if the graph is bipartite; false otherwise.
 */
function is_bipartite(graph, root, colour) {
    const BIPARTITE = true;
    const NOT_BIPARTITE = !BIPARTITE;
    // Mark the root node as visited.
    const stack = new Array();
    const visit = new Set();
    stack.push(root);
    visit.add(root);
    // Use breath-first search to help us determine whether the
    // graph has a 2-colouring.
    while (stack.length > 0) {
        const u = stack.pop();
        assert(colour[u] >= 0);
        for (const v of graph.neighbour(u)) {
            if (colour[u] == colour[v]) {
                return NOT_BIPARTITE;
            }
            if (visit.has(v)) {
                continue;
            }
            stack.push(v);
            visit.add(v);
        }
    }
    return BIPARTITE;
}

/**
 * Construct an undirected graph given the number of nodes and an edge set.
 *
 * @param n The number of nodes in the graph.
 * @param edge An array of edges of the graph.  Each array element is an
 *     edge of the form [u, v], where u and v are nodes of the graph.
 */
function to_graph(n, edge) {
    assert(n > 0);
    assert(edge.length > 0);
    const node = new Set(sequence(n));
    const directed = false;
    const graph = new Graph(directed);
    // First, add the edges.
    for (let i = 0; i < edge.length; i++) {
        const [u, v] = edge[i];
        graph.add_edge(u, v);
        node.delete(u);
        node.delete(v);
    }
    // Add any nodes not listed in the edge set.
    for (const v of node) {
        assert(graph.add_node(v));
    }
    assert(n == graph.nodes().length);
    return graph;
}

/**
 * Update the colouring array.
 *
 * @param prev_colour The current colouring of the nodes of a graph.
 * @param new_colour The new colouring of the nodes.
 * @param white The colour used to represent a node that is yet to be coloured.
 * @return An array rerepsenting the updated colouring.
 */
function update_colouring(prev_colour, new_colour, white) {
    assert(prev_colour.length > 0);
    assert(prev_colour.length == new_colour.length);
    const colour = Array.from(prev_colour);
    for (let i = 0; i < prev_colour.length; i++) {
        // Find a white node.
        if (white != prev_colour[i]) {
            continue;
        }
        if (white == new_colour[i]) {
            continue;
        }
        // Previously node i was white, but now has been coloured.
        assert(white == prev_colour[i]);
        assert(white != new_colour[i]);
        colour[i] = new_colour[i];
    }
    return colour;
}

/**
 * Proper 2-Coloring of a Graph: You are given data, representing a graph.
 * Note that "graph", as used here, refers to the field of graph theory and
 * has no relation to statistics or plotting.  The first element of the data
 * represents the number of vertices in the graph.  Each vertex is a unique
 * number between 0 and data[0] - 1.  The next element of the data represents
 * the edges of the graph.  Two vertices u, v in a graph are said to be
 * adjacent if there exists an edge [u, v].  Note that an edge [u, v] is the
 * same as an edge [v, u], as order does not matter.  You must construct a
 * 2-coloring of the graph, meaning that you have to assign each vertex in the
 * graph a "color", either 0 or 1, such that no two adjacent vertices have the
 * same color.  Submit your answer in the form of an array, where element i
 * represents the color of vertex i.  If it is impossible to construct a
 * 2-coloring of the given graph, submit an empty array.
 *
 * This problem is equivalent to determining whether a graph is bipartite.
 * From the problem description, we only need to deal with undirected graphs.
 *
 * Usage: run bipartite.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The host name of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const [n, edge] = ns.codingcontract.getData(cct, host);
    const colour = bipartite(n, edge);
    const result = ns.codingcontract.attempt(
        colour, cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/bipartite.txt";
        const data = "[" + n + ", " + matrix_to_string(edge) + "]";
        await log_cct_failure(ns, log, cct, host, data);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
