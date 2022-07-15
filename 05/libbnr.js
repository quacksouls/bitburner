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

// A library of classes and functions that can be imported into other scripts.

/****************************************************************************/
/** Helper functions ********************************************************/
/****************************************************************************/

/**
 * Use Dijkstra's algorithm to determine the shortest path from a given node
 * to all nodes in a network.
 *
 * @param ns The Netscript API.
 * @param source The source node.  All shortest paths must start from this node.
 * @return These two data structures:
 *     (1) A map of the shortest number of nodes in a path to a target node.
 *         Each path starts from the given source node.  For example, the map
 *         element A[i] means the shortest number of nodes in the path to node
 *         i.
 *     (2) A map of the node preceeding a given node, in a shortest path.  For
 *         example, the map element M[i] gives a node that directly connects to
 *         node i, where M[i] and i are nodes in a shortest path.
 */
function dijkstra(ns, source) {
    // A map of the shortest number of nodes in a path to a target node.
    let dist = new Map();
    // A map of the node preceeding a given node.
    let prev = new Map();
    // A queue of nodes to visit.
    let queue = new Array();
    // Initialization.
    for (const v of network(ns)) {
        dist.set(v, Infinity);
        prev.set(v, undefined);
        queue.push(v);
    }
    // The distance from the source node to itself is zero.
    dist.set(source, 0);
    prev.set(source, undefined);
    queue.push(source);

    // Search for shortest paths from the source node to other nodes.
    // This is an unweighted network so the weight between a node
    // and any of its neighbours is 1.
    const weight = 1;
    while (queue.length > 0) {
        const u = minimumq(queue, dist);
        queue = queue.filter(s => s != u);
        // Consider the neighbours of u.  Each neighbour must still be in
        // the queue.
        let neighbour = [...filter_pserv(ns, ns.scan(u))];
        neighbour = neighbour.filter(s => queue.includes(s));
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
 * Choose the node i with minimum dist[i].  This is a simple implementation.
 * For better performance, the queue should be implemented as a minimum
 * priority queue.
 *
 * @param queue An array of nodes to visit.
 * @param dist A map of the shortest number of nodes in a path to a target node.
 * @return The node i such that dist[i] is minimal.
 */
function minimumq(queue, dist) {
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
 * Scan the network of servers in the game world.  Each server must be reachable
 * from our home server.
 *
 * @param ns The Netscript API.
 * @return An array of servers that can be reached from home.
 */
export function network(ns) {
    // We scan the world network from a node, which is assumed to be our home
    // server.  We refer to our home server as the root of the tree.
    const player = new Player(ns);
    const root = player.home();

    // A set of all servers we can visit at the moment.
    let server = new Set();
    // A stack of servers to visit.  We start from our home server.
    let stack = new Array(root);

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
    return server.filter(s => root != s);
}

/**
 * Determine the shortest path from the source to the target.
 *
 * @param ns The Netscript API.
 * @param source Start our path from this node.
 * @param target We want to reach this node.
 * @return An array of shortest path from source to target.  An
 *     empty array if the target is not reachable from the source.
 */
export function shortest_path(ns, source, target) {
    const [dist, prev] = dijkstra(ns, source);
    // Ensure the target is reachable from the source node.
    if (!dist.has(target)) {
        return [];
    }
    let stack = new Array();
    let u = target;
    // Start from the target and work backward to find the shortest
    // path from the source to the target.
    while (prev.get(u) != undefined) {
        stack.push(u);
        u = prev.get(u);
    }
    assert(stack.length > 0);
    stack.push(source);
    stack.reverse();
    return stack;
}
