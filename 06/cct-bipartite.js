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

import { assert, Graph, sequence } from "./libbnr.js";

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
    const colour = colouring(graph, BLUE, RED);
    if (0 == colour.length) {
        return [];
    }
    // Determine whether the graph has a 2-colouring.
    if (is_bipartite(graph, colour)) {
        return colour;
    }
    return [];
}

/**
 * Attempt to colour a graph by using 2 colours.  Each node is coloured such
 * that the endpoints of an edge have different colours.
 *
 * @param graph We want to colour this graph.
 * @param blue, red Colour the graph using these colours.
 * @return An array a where the element a[i] represents the colour of node i
 *     in the graph.  An empty array if the graph cannot be coloured with the
 *     given colours such that the endpoints of each edge have different
 *     colours.  Even if the returned array is not empty, we must still test
 *     to see whether the graph has a 2-colouring.
 */
function colouring(graph, blue, red) {
    // colour[i] := the colour of node i in the graph.
    const n = graph.nodes().length;
    const colour = new Array(n).fill(-1);
    const BLUE = blue;
    const RED = red;
    // Colour the root node.
    const root = 0;
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
 * @param colour A colouring of the nodes of the graph.
 * @return true if the graph is bipartite; false otherwise.
 */
function is_bipartite(graph, colour) {
    const BIPARTITE = true;
    const NOT_BIPARTITE = !BIPARTITE;
    // Mark the root node as visited.
    const stack = new Array();
    const visit = new Set();
    const root = 0;
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
 * The input is an array of two elements [n, E], where n is the number of
 * nodes in the graph and E is the set of edges of the graph.
 *
 * Edit the script to give the number of nodes and the edge set.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const node = 0;
    const edge = 1;
    // A small graph with a 2-colouring.
    // colouring: [0, 0, 1, 1]
    const grapha = [
        4,
        [[0, 2], [0, 3], [1, 2], [1, 3]]
    ];
    ns.tprint(bipartite(grapha[node], grapha[edge]));
    // A tree with a 2-colouring.
    // colouring: [0, 1, 1, 0, 0, 0, 0, 1]
    const graphb = [
        8,
        [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [4, 7]]
    ];
    ns.tprint(bipartite(graphb[node], graphb[edge]));
    // A triangle graph with no 2-colouring.
    // colouring: []
    const graphc = [
        3,
        [[0, 1], [0, 2], [1, 2]]
    ];
    ns.tprint(bipartite(graphc[node], graphc[edge]));
    // Another graph without a 2-colouring.
    // colouring: []
    const graphd = [
        9,
        [[0, 1], [1, 2], [1, 4], [2, 5], [3, 4], [3, 6], [4, 5], [4, 6], [4, 7], [5, 8]]
    ];
    ns.tprint(bipartite(graphd[node], graphd[edge]));
}
