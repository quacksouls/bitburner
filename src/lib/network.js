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

// A class and various utility functions related to network.

import { bool } from "/lib/constant/bool.js";
import { home } from "/lib/constant/server.js";
import { assert, filter_pserv } from "/lib/util.js";

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
     * @param directed A boolean indicating whether each edge of the graph is
     *     directed or undirected.  If true, then each edge is directed.  If
     *     false, then each edge is undirected.
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
     * @param u, v An edge between vertices u and v.
     * @return true if the edge was successfully added to the graph;
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
     * @param v Add this node.
     * @return true if the given node was successfully added;
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
     * @param source The source vertex.  All shortest paths must start
     *     from this node.
     * @return These two data structures:
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
        while (queue.length > 0) {
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
     */
    edges() {
        // Directed graph.
        if (this.#directed) {
            const edge = [];
            for (const u of this.nodes()) {
                for (const v of this.neighbour(u)) {
                    edge.push([u, v]);
                }
            }
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
     * @param u, v Check the graph for this edge.
     * @return true if the graph has the edge (u, v); false otherwise.
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
     * @param v Check for the presence or absence of this vertex.
     * @return true if the graph already has the vertex; false otherwise.
     */
    has_node(v) {
        return this.#adj.has(v);
    }

    /**
     * Choose the node i with minimum dist[i].  This is a simple
     * implementation.  For better performance, the queue should be implemented
     * as a minimum priority queue.
     *
     * @param queue An array of nodes to visit.
     * @param dist A map of the shortest number of nodes in a path to
     *     a target node.
     * @return The node i such that dist[i] is minimal.
     */
    // eslint-disable-next-line class-methods-use-this
    #minimumq(queue, dist) {
        assert(queue.length > 0);
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
     * @param v A node of this graph.
     * @return An array representing the neighbours of the given node.
     */
    neighbour(v) {
        assert(this.has_node(v));
        return this.#adj.get(v);
    }

    /**
     * All nodes of this graph, as an array.
     */
    nodes() {
        const vertex = [...this.#adj.keys()];
        vertex.sort();
        return vertex;
    }

    /**
     * Determine a shortest path from the source to the target.
     *
     * @param source Start our path from this node.
     * @param target We want to reach this node.
     * @return An array representing a shortest path from source to target.
     *     An empty array if the target is not reachable from the source.
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
        if (stack.length === 0) {
            return [];
        }
        // Reconstruct the full path from source to target.
        assert(stack.length > 0);
        stack.push(source);
        stack.reverse();
        return stack;
    }
}

/**
 * Scan the network of servers in the game world.  Each server must be
 * reachable from our home server.  We do not include purchased servers.
 *
 * @param ns The Netscript API.
 * @return An array of servers that can be reached from home.  Purchased
 *     servers are excluded.
 */
export function network(ns) {
    // We scan the world network from a node, which is assumed to be our home
    // server.  We refer to our home server as the root of the tree.
    const root = home;
    // A set of all servers we can visit at the moment.
    let server = new Set();
    // A stack of servers to visit.  We start from our home server.
    const stack = new Array(root);
    // Use depth-first search to navigate all servers we can visit.
    while (stack.length > 0) {
        const s = stack.pop();
        // Have we visited the server s yet?
        if (!server.has(s)) {
            // The server s is now visited.
            server.add(s);
            // Add all neighbours of s to the stack.  Take care to exclude the
            // purchased servers.
            stack.push(...filter_pserv(ns, ns.scan(s)));
        }
    }
    // Convert the set of servers to an array of servers.
    server = [...server];
    // Remove the root node from our array.  We want all servers that are
    // connected either directly or indirectly to the root node.
    return server.filter((s) => root !== s);
}

/**
 * Determine a shortest path from the source server to the target server
 * in the network of world servers.
 *
 * @param ns The Netscript API.
 * @param source Start our path from this server.
 * @param target We want to reach this server.
 * @return An array of shortest path from source to target.  An
 *     empty array if the target is not reachable from the source.
 */
export function shortest_path(ns, source, target) {
    // Represent the network of world servers as an undirected graph.
    const stack = [];
    const visit = new Set();
    stack.push(source);
    const graph = new Graph(bool.UNDIRECTED);
    // Use breath-first search to navigate the network.
    while (stack.length > 0) {
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
    // A shortest path from source to target.
    return graph.shortest_path(source, target);
}
