import { assert, filter_pserv, network } from "./libbnr.js";

/**
 * Use Dijkstra's algorithm to determine the shortest from a given node
 * to all nodes in a network.
 * 
 * @param ns The Netscript API.
 * @param source The source node.  All shortest paths must start from this node.
 * @return These two data structures:
 *     (1) A map of the shortest number of nodes in a path to a target node.
 *         Each path starts from the given source node.  For example, the map
 *         element A[i] means the shortest number of nodes in the path to node i.
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
		const u = minimum(queue, dist);
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
 * Choose the node i with minimum dist[i].  This is a simple implementation.  For
 * better performance, the queue should be implemented as a minimum priority queue.
 *
 * @param queue An array of nodes to visit.
 * @param dist A map of the shortest number of nodes in a path to a target node.
 * @return The node i such that dist[i] is minimal.
 */
function minimum(queue, dist) {
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
 * Determine the shortest path from the source to the target.
 * 
 * @param ns The Netscript API.
 * @param source Start our path from this node.
 * @param target We want to reach this node.
 * @return An array of shortest path from source to target.  An
 *     empty array if the target is not reachable from the source.
 */
function shortest_path(ns, source, target) {
	const [dist, prev] = dijkstra(ns, source);
	// Ensure the target is reachable from the source node.
	if (!dist.has(target)) {
		ns.tprint(target + " not reachable from " + source);
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

/**
 * Determine the shortest path from our home server to a target server.
 * Must provide the target server from the command line.
 *
 * Usage: run shortest-path.js [targetServer]
 * Example: run shortest-path.js run4theh111z
 * 
 * @param ns The Netscript API.
 */
export async function main(ns) {
	// Must provide a command line argument.
	const error_msg = "Must provide the name of the target server.";
	if (ns.args.length < 1) {
		await ns.tprint(error_msg);
		ns.exit();
	}
	const target = ns.args[0];
	const path = shortest_path(ns, "home", target);
	if (path.length < 1) {
		await ns.tprint("Target server must be reachable from home.");
		ns.exit();
	}
	ns.tprint(path.join(" -> "));
}