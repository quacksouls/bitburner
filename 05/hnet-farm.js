import { assert, Hacknet, Player } from "./libbnr.js";

/**
 * Setup our farm of Hacknet Nodes.  We leave each Node at Level 1, 1GB RAM, and 1 Core.  Our
 * objective is to setup a farm of n Hacknet Nodes, each Node at base stat.
 * 
 * @param ns The Netscript API.
 * @param n How many Hacknet Nodes in our farm.  Must be a positive integer.
 * @return An array of IDs of all Hacknet Nodes in our farm.
 */
async function setup_farm(ns, n) {
	const hnet = new Hacknet(ns);
	const nNode = Math.floor(n);
	assert(nNode > 0);
	assert(nNode < hnet.nodes_max());
	const player = new Player(ns);
	const time = 10000;  // 10 seconds

	// If we already have a farm of n Hacknet Nodes, return the IDs of the Nodes.
	if (hnet.nodes() == nNode) {
		return [...Array(nNode).keys()];
	}

	// Purchase Hacknet Nodes for our farm.
	for (let i = hnet.nodes(); i < nNode; i++) {
		// Wait until we have sufficient funds to purchase another Hacknet Node.
		while (player.money_available() < hnet.node_cost()) {
			await ns.sleep(time);
		}
		// Purchase a new Hacknet Node.
		const id = hnet.node_buy();
		assert(-1 != id);
	}
	assert(hnet.nodes() == nNode);
	return [...Array(nNode).keys()];
}

/**
 * Upgrade the Core of each Hacknet Node in our farm.  Our objective is to max out
 * the number of Cores of each Hacknet Node.
 * 
 * @param ns The Netscript API.
 * @param farm The set of IDs of all Hacknet Nodes in our farm.
 */
async function upgrade_core(ns, farm) {
	const hnet = new Hacknet(ns);
	const player = new Player(ns);
	const howmany = 1;   // Upgrade this many Cores at a time.
	const time = 10000;  // 10 seconds

	// Max out the number of Cores of a Hacknet Node.  Then wait and see whether we can
	// max out the number of Cores of another Node.
	for (const node of farm) {
		// We know that the number of Cores of a Node is at maximum if the cost of upgrading
		// to another Core is Infinity.
		while (isFinite(hnet.core_cost(node, howmany))) {
			// Wait until we have enough money to upgrade a Node to another Core.
			while (player.money_available() < hnet.core_cost(node, howmany)) {
				await ns.sleep(time);
			}
			assert(hnet.core_upgrade(node, howmany));
		}
	}
}

/**
 * Upgrade the Level of each Hacknet Node in our farm.  Our objective is to max out
 * the Level of each Hacknet Node.
 * 
 * @param ns The Netscript API.
 * @param farm The set of IDs of all Hacknet Nodes in our farm.
 */
async function upgrade_level(ns, farm) {
	const hnet = new Hacknet(ns);
	const player = new Player(ns);
	const level = 1;     // Upgrade this many Levels at a time.
	const time = 10000;  // 10 seconds

	// Max out the Level of a Hacknet Node.  Then wait and see whether we can
	// max out the Level of another Node.
	for (const node of farm) {
		// We know that the Level of a Node is at maximum if the cost of upgrading
		// to another Level is Infinity.
		while (isFinite(hnet.level_cost(node, level))) {
			// Wait until we have enough money to upgrade a Node to another Level.
			while (player.money_available() < hnet.level_cost(node, level)) {
				await ns.sleep(time);
			}
			assert(hnet.level_upgrade(node, level));
		}
	}
}

/**
 * Upgrade the RAM of each Hacknet Node in our farm.  Our objective is to max out
 * the amount of RAM of each Hacknet Node.
 * 
 * @param ns The Netscript API.
 * @param farm The set of IDs of all Hacknet Nodes in our farm.
 */
async function upgrade_ram(ns, farm) {
	const hnet = new Hacknet(ns);
	const player = new Player(ns);
	const howmany = 1;   // Upgrade by 1GB RAM at a time.
	const time = 10000;  // 10 seconds

	// Max out the amount of RAM of a Hacknet Node.  Then wait and see whether we can
	// max out the amount of RAM of another Node.
	for (const node of farm) {
		// We know that the amount of RAM of a Node is at maximum if the cost of upgrading
		// to another 1GB RAM is Infinity.
		while (isFinite(hnet.ram_cost(node, howmany))) {
			// Wait until we have enough money to upgrade a Node to another 1GB RAM.
			while (player.money_available() < hnet.ram_cost(node, howmany)) {
				await ns.sleep(time);
			}
			assert(hnet.ram_upgrade(node, howmany));
		}
	}
}

/**
 * Purchase Hacknet Nodes and manage our farm of Nodes.  Must provide the number of nodes
 * from the command line.
 * 
 * Usage: run hnet-farm.js [nNode]
 * Recommended usage: run hnet-farm.js 9
 * 
 * Start with 9 Nodes.  When all Nodes have been maxed out, we can add more Nodes to the
 * farm by running the script again, but with a higher number of nodes.
 * 
 * @param ns The Netscript API.
 */
export async function main(ns) {
	if (ns.args.length < 1) {
		await ns.tprint("Must provide the number of Hacknet Nodes to purchase.");
		ns.exit();
	}
	// The number of Nodes in our Hacknet farm.
	const nNode = Math.floor(ns.args[0]);
	if (nNode < 1) {
		await ns.tprint("Number of Nodes must be a positive whole number: " + ns.args[0]);
		ns.exit();
	}

	// If we already have the required number of Hacknet Nodes, then either of two
	// cases can occur.
	//
	// (1) Each Node in our Hacknet farm is fully upgraded.  That is, each Node has its
	//     Level, RAM, and Cores all maxed out.
	// (2) At least one Node is not fully upgraded.
	//
	// In either case, the setup_farm() function would return the IDs of all Nodes in
	// our farm without adding any new Nodes to the farm.  The upgrade_level(),
	// upgrade_core(), and upgrade_ram() functions would each attempt to max out each
	// Node in the farm.  If all Nodes are fully upgraded, then the functions
	// would exit.
	//
	// If our farm doesn't have the required number of Nodes, then the setup_farm()
	// function would purchase as many new Nodes as necessary to make up the
	// required number.  The upgrade_level(), upgrade_core(), and upgrade_ram()
	// functions would each try to max out each new Node in the farm.
	const farm = await setup_farm(ns, nNode);
	// Upgrade the Level of each Hacknet Node to maximum.
	await upgrade_level(ns, farm);
	// Upgrade the Cores of each Hacknet Node to maximum.
	await upgrade_core(ns, farm);
	// Max out the amount of RAM of each Hacknet Node.
	await upgrade_ram(ns, farm);
}
