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

/// ///////////////////////////////////////////////////////////////////////
// A class and various utility functions related to network.
/// ///////////////////////////////////////////////////////////////////////

import { MyArray } from "/quack/lib/array.js";
import { bool } from "/quack/lib/constant/bool.js";
import { home } from "/quack/lib/constant/server.js";
import { assert, filter_pserv } from "/quack/lib/util.js";

/**
 * A combinatorial graph, commonly referred to as a graph.
 */
export class Graph {
    /**
     * The adjacency map.  Each key is a vertex or node of the graph.  Each
     * value is an array of vertices to which the key is adjacent.  For
     * example, given a node i, adj[i] is an array such that each node in the
     * array is a neighbour of i.
     */
    #adj;

    /**
     * A boolean signifying whether each edge is directed or undirected.
     */
    #directed;

    /**
     * A graph object.
     *
     * @param {boolean} directed Whether each edge of the graph is directed or
     *     undirected.  If true, then each edge is directed.  If false, then
     *     each edge is undirected.
     */
    constructor(directed) {
        this.#adj = new Map();
        this.#directed = false;
        if (directed) {
            this.#directed = true;
        }
    }

    /**
     * Add an edge to this graph.
     *
     * @param {number} u A node of the edge (u, v).
     * @param {number} v Another node of the edge edge (u, v).
     * @returns {boolean} True if the edge was successfully added to the graph;
     *     false otherwise or the edge is already in the graph.
     */
    add_edge(u, v) {
        // Already have the edge.
        if (this.has_edge(u, v)) {
            return bool.FAILURE;
        }

        // First, add the nodes if we don't have them already.
        if (!this.has_node(u)) {
            assert(this.add_node(u));
        }
        if (!this.has_node(v)) {
            assert(this.add_node(v));
        }

        // Now insert the edge (u, v).
        // If the graph is directed, only need to add the edge (u, v).
        // If the graph is undirected, also must add the edge (v, u).
        const u_neighbour = this.neighbour(u);
        u_neighbour.push(v);
        this.#adj.set(u, u_neighbour);

        // Undirected graph.
        if (!this.#directed) {
            const v_neighbour = this.neighbour(v);
            v_neighbour.push(u);
            this.#adj.set(v, v_neighbour);
        }
        return bool.SUCCESS;
    }

    /**
     * Add a vertex to this graph.
     *
     * @param {number} v Add this node.
     * @returns {boolean} True if the given node was successfully added;
     *     false otherwise or the node already exists in the graph.
     */
    add_node(v) {
        if (this.has_node(v)) {
            return bool.FAILURE;
        }
        this.#adj.set(v, []);
        return bool.SUCCESS;
    }

    /**
     * Use Dijkstra's algorithm to determine a shortest path from a given
     * node to all nodes in a graph.
     *
     * @param {number} source The source vertex.  All shortest paths must start
     *     from this node.
     * @returns {array<Map, Map>} These two data structures:
     *     (1) A map of the shortest number of nodes in a path to a target
     *         node.  Each path starts from the given source node.  For
     *         example, the map element A[i] means the shortest number of nodes
     *         in a path to node i.
     *     (2) A map of the node preceding a given node, in a shortest path.
     *         For example, the map element M[i] gives a node that directly
     *         connects to node i, where M[i] and i are nodes in a shortest
     *         path.
     */
    #dijkstra(source) {
        // The implementation is the same for both directed and undirected
        // graphs.
        // A map of the shortest number of nodes in a path to a target node.
        const dist = new Map();
        // A map of the node preceding a given node.
        const prev = new Map();
        // A queue of nodes to visit.
        let queue = [];

        // Initialization.
        for (const v of this.nodes()) {
            dist.set(v, Infinity);
            prev.set(v, undefined);
            queue.push(v);
        }

        // The distance from the source node to itself is zero.
        dist.set(source, 0);
        prev.set(source, undefined);
        queue.push(source);

        // Search for shortest paths from the source node to other nodes.  This
        // is an unweighted graph so the weight between a node and any of its
        // neighbours is 1.
        const weight = 1;
        while (!MyArray.is_empty(queue)) {
            const u = this.#minimumq(queue, dist);
            queue = queue.filter((s) => s !== u);

            // Consider the neighbours of u.  Each neighbour must still be in
            // the queue.
            let neighbour = Array.from(this.neighbour(u));
            // eslint-disable-next-line no-loop-func
            neighbour = neighbour.filter((s) => queue.includes(s));
            for (const v of neighbour) {
                const alt = dist.get(u) + weight;

                // We have found a shorter path to v.
                if (alt < dist.get(v)) {
                    dist.set(v, alt);
                    prev.set(v, u);
                }
            }
        }
        return [dist, prev];
    }

    /**
     * All edges of this graph, as an array of arrays.
     *
     * @returns {array<array>} The edges of this graph.
     */
    edges() {
        // Directed graph.
        if (this.#directed) {
            const edge = [];
            this.nodes().forEach((u) => {
                this.neighbour(u).forEach((v) => edge.push([u, v]));
            });
            return edge;
        }

        // Undirected graph.
        assert(!this.#directed);
        const edge = new Set();
        for (const u of this.nodes()) {
            for (const v of this.neighbour(u)) {
                // Assume nodes to be comparable, i.e. we can compare the node
                // values.  If each node is an integer, the nodes are
                // comparable because there is an ordering of numbers.  If each
                // node is a string of alphabetic characters, the nodes are
                // also comparable because we can use lexicographic ordering.
                if (u > v) {
                    continue;
                }
                assert(!edge.has([u, v]));
                edge.add([u, v]);
            }
        }
        return [...edge];
    }

    /**
     * Whether the graph has the given edge.
     *
     * @param {number} u A node of the edge (u, v).
     * @param {number} v Another node of the edge (u, v).
     * @returns {boolean} True if the graph has the edge (u, v);
     *     false otherwise.
     */
    has_edge(u, v) {
        if (!this.has_node(u)) {
            return bool.NOT;
        }
        if (!this.has_node(v)) {
            return bool.NOT;
        }

        // Directed graph.
        if (this.#directed) {
            const neighbour = this.neighbour(u);
            return neighbour.includes(v);
        }

        // Undirected graph.
        assert(!this.#directed);
        const u_neighbour = this.neighbour(u);
        const v_neighbour = this.neighbour(v);
        if (u_neighbour.includes(v)) {
            assert(v_neighbour.includes(u));
            return bool.HAS;
        }
        return bool.NOT;
    }

    /**
     * Whether the graph has the given vertex.
     *
     * @param {number} v Check for the presence or absence of this vertex.
     * @returns {boolean} True if the graph has the given node; false otherwise.
     */
    has_node(v) {
        return this.#adj.has(v);
    }

    /**
     * Choose the node i with minimum dist[i].  This is a simple
     * implementation.  For better performance, the queue should be implemented
     * as a minimum priority queue.
     *
     * @param {array<number>} queue An array of nodes to visit.
     * @param {Map} dist A map of the shortest number of nodes in a path to
     *     a target node.
     * @returns {number} The node i such that dist[i] is minimal.
     */
    // eslint-disable-next-line class-methods-use-this
    #minimumq(queue, dist) {
        assert(!MyArray.is_empty(queue));
        assert(dist.size > 0);
        let node = queue[0];
        for (const v of queue) {
            if (dist.get(v) < dist.get(node)) {
                node = v;
            }
        }
        return node;
    }

    /**
     * The neighbours of a vertex.
     *
     * @param {number} v A node of this graph.
     * @returns {array<number>} The neighbours of the given node.
     */
    neighbour(v) {
        assert(this.has_node(v));
        return this.#adj.get(v);
    }

    /**
     * All nodes of this graph, as an array.
     *
     * @returns {array<number>} The nodes of the graph.
     */
    nodes() {
        const vertex = [...this.#adj.keys()];
        vertex.sort();
        return vertex;
    }

    /**
     * Determine a shortest path from the source to the target.
     *
     * @param {number} source Start our path from this node.
     * @param {number} target We want to reach this node.
     * @returns {array<number>} A shortest path from source to target.  An empty
     *     array if the target is not reachable from the source.
     */
    shortest_path(source, target) {
        // The implementation is the same for directed and undirected graphs.
        assert(this.has_node(source));
        assert(this.has_node(target));
        const [dist, prev] = this.#dijkstra(source);

        // Ensure the target is reachable from the source node.
        if (!dist.has(target)) {
            return [];
        }
        const stack = [];
        let u = target;

        // Start from the target and work backward to find a shortest path from
        // the source to the target.
        while (prev.get(u) !== undefined) {
            stack.push(u);
            u = prev.get(u);
        }

        // Target is not reachable from the source node.
        if (MyArray.is_empty(stack)) {
            return [];
        }

        // Reconstruct the full path from source to target.
        stack.push(source);
        stack.reverse();
        return stack;
    }
}

/**
 * Scan the network of servers in the game world.  Each server must be
 * reachable from our home server.  We do not include purchased servers.
 *
 * @param {NS} ns The Netscript API.
 * @returns {array<string>} Servers that can be reached from home.  Purchased
 *     servers are excluded.
 */
export function network(ns) {
    const q = [home];
    const visit = new Set([home]);
    while (!MyArray.is_empty(q)) {
        const u = q.shift();
        ns.scan(u)
            .filter((v) => !visit.has(v))
            .forEach((x) => {
                visit.add(x);
                q.push(x);
            });
    }
    visit.delete(home);
    return filter_pserv(ns, [...visit]);
}

/**
 * Determine a shortest path from the source server to the target server
 * in the network of world servers.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} source Start our path from this server.
 * @param {string} target We want to reach this server.
 * @returns {array<string>} A shortest path from source to target.  An empty
 *     array if the target is not reachable from the source.
 */
export function shortest_path(ns, source, target) {
    // Represent the network of world servers as an undirected graph.
    const stack = [];
    const visit = new Set();
    stack.push(source);
    const graph = new Graph(bool.UNDIRECTED);

    // Use breath-first search to navigate the network.
    while (!MyArray.is_empty(stack)) {
        const s = stack.pop();

        // Have we visited the server s yet?
        if (visit.has(s)) {
            continue;
        }
        visit.add(s);

        // All neighbours of s, excluding the purchased servers.
        const neighbour = [...filter_pserv(ns, ns.scan(s))];
        stack.push(...neighbour);
        for (const t of neighbour) {
            // Have we visited the server t yet?
            if (visit.has(t)) {
                continue;
            }
            assert(graph.add_edge(s, t));
        }
    }

    return graph.shortest_path(source, target);
}
