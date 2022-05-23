import { assert, Player, seconds_to_milliseconds } from "./libbnr.js";

/**
 * Whether each Node in our Hacknet farm is fully upgraded.
 */
function is_fully_upgraded(ns) {
	const n = ns.hacknet.numNodes();
	assert(n > 0);
	const farm = [...Array(n).keys()];
	const max_core = 16;
	const max_level = 200;
	const max_ram = 64;
	const MAXED_OUT = true;
	const NOT_MAXED_OUT = !MAXED_OUT;

	for (const node of farm) {
		const stat = ns.hacknet.getNodeStats(node);
		if (stat.cores < max_core) {
			return NOT_MAXED_OUT;
		}
		if (stat.level < max_level) {
			return NOT_MAXED_OUT;
		}
		if (stat.ram < max_ram) {
			return NOT_MAXED_OUT;
		}
		// Sanity checks to ensure the node is fully upgraded.
		const howmany = 1;
		assert(!isFinite(ns.hacknet.getCoreUpgradeCost(node, howmany)));
		assert(!isFinite(ns.hacknet.getLevelUpgradeCost(node, howmany)));
		assert(!isFinite(ns.hacknet.getRamUpgradeCost(node, howmany)));
	}
	return MAXED_OUT;
}

/**
 * Setup our farm of Hacknet Nodes.  We leave each Node at Level 1, 1GB RAM, and 1 Core.  Our
 * objective is to setup a farm of n Hacknet Nodes, each Node at base stat.
 * 
 * @param ns The Netscript API.
 * @param n How many Hacknet Nodes in our farm.  Must be a positive integer.
 * @return An array of IDs of all Hacknet Nodes in our farm.
 */
async function setup_farm(ns, n) {
	const nNode = Math.floor(n);
	assert(nNode > 0);
	assert(nNode < ns.hacknet.maxNumNodes());
	const player = new Player(ns);
	const time = seconds_to_milliseconds(10);

	// If we already have a farm of n Hacknet Nodes, return the IDs of the Nodes.
	if (ns.hacknet.numNodes() == nNode) {
		return [...Array(nNode).keys()];
	}

	// Purchase Hacknet Nodes for our farm.
	for (let i = ns.hacknet.numNodes(); i < nNode; i++) {
		// Wait until we have sufficient funds to purchase another Hacknet Node.
		while (player.money_available() < ns.hacknet.getPurchaseNodeCost()) {
			await ns.sleep(time);
		}
		// Purchase a new Hacknet Node.
		const id = ns.hacknet.purchaseNode();
		assert(-1 != id);
	}
	assert(ns.hacknet.numNodes() == nNode);
	return [...Array(nNode).keys()];
}

/**
 * In this stage, we want to have 3 Nodes in our farm.  Fully upgrade all Nodes.
 *
 * @param ns The Netscript API.
 */
async function stage_one(ns) {
	const nNode = 3;
	const time = seconds_to_milliseconds(10);
	// Bootstrap our farm in case we have zero Nodes.
	await update(ns, nNode);

	while (!is_fully_upgraded(ns)) {
		await update(ns, nNode);
		await ns.sleep(time);
	}
}

/**
 * To reach this stage, we must have tens of millions of dollars.  Here, we
 * increase our farm by another 3 Hacknet Nodes to reach a total of 6 Nodes.
 *
 * @param ns The Netscript API.
 */
async function stage_two(ns) {
	// Must have at least 10 million dollars for stage 2 to begin.
	const million = 10 ** 6;
	const ten_million = 10 * million;
	const player = new Player(ns);
	const time = seconds_to_milliseconds(10);
	while (player.money_available() < ten_million) {
		await ns.sleep(time);
	}

	// Add more Nodes to our farm.
	const nNode = 6;
	await update(ns, nNode);

	// Now fully upgrade each Node in our farm.
	while (!is_fully_upgraded(ns)) {
		await update(ns, nNode);
		await ns.sleep(time);
	}
}

/**
 * To reach this stage, we must have hundreds of millions of dollars.  Here, we
 * increase our farm by another 6 Hacknet Nodes to reach a total of 12 Nodes.
 *
 * @param ns The Netscript API.
 */
async function stage_three(ns) {
	// Must have at least 100 million dollars for stage 3 to begin.
	const million = 10 ** 6;
	const hundred_million = 100 * million;
	const player = new Player(ns);
	const time = seconds_to_milliseconds(10);
	while (player.money_available() < hundred_million) {
		await ns.sleep(time);
	}

	// Add more Nodes to our farm.
	const nNode = 12;
	await update(ns, nNode);

	// Now fully upgrade each Node in our farm.
	while (!is_fully_upgraded(ns)) {
		await update(ns, nNode);
		await ns.sleep(time);
	}
}

/**
 * To reach this stage, we must have billions of dollars.  Here, we increase
 * our farm by another 12 Hacknet Nodes to reach a total of 24 Nodes.
 *
 * @param ns The Netscript API.
 */
async function stage_four(ns) {
	// Must have at least 1 billion dollars for stage 4 to begin.
	const billion = 10 ** 9;
	const player = new Player(ns);
	const time = seconds_to_milliseconds(10);
	while (player.money_available() < billion) {
		await ns.sleep(time);
	}

	// Add more Nodes to our farm.
	const nNode = 24;
	await update(ns, nNode);

	// Now fully upgrade each Node in our farm.
	while (!is_fully_upgraded(ns)) {
		await update(ns, nNode);
		await ns.sleep(time);
	}
}

/**
 * To reach this stage, we must have hundreds of billions of dollars.
 * Here, we increase our farm to a total of 30 Hacknet Nodes.
 *
 * @param ns The Netscript API.
 */
async function stage_five(ns) {
	// Must have at least 100 billion dollars for stage 5 to begin.
	const billion = 10 ** 9;
	const hundred_billion = 100 * billion;
	const player = new Player(ns);
	const time = seconds_to_milliseconds(10);
	while (player.money_available() < hundred_billion) {
		await ns.sleep(time);
	}

	// Add more Nodes to our farm.
	const nNode = 30;
	await update(ns, nNode);

	// Now fully upgrade each Node in our farm.
	while (!is_fully_upgraded(ns)) {
		await update(ns, nNode);
		await ns.sleep(time);
	}
}

/**
 * Upgrade the Core of each Hacknet Node in our farm.  Our objective is to upgrade
 * the Core of each Node by one point.  Call this function multiple times to max out
 * the number of Cores.
 * 
 * @param ns The Netscript API.
 * @param farm An array of IDs of all Hacknet Nodes in our farm.
 */
async function upgrade_core(ns, farm) {
	assert(farm.length > 0);
	const player = new Player(ns);
	const howmany = 1;  // Upgrade this many Cores at a time.
	const time = seconds_to_milliseconds(10);

	// Add another Core to each Hacknet Node.
	for (const node of farm) {
		// The number of Cores of a Node is at maximum if the cost of upgrading
		// to another Core is Infinity.
		if (isFinite(ns.hacknet.getCoreUpgradeCost(node, howmany))) {
			// Wait until we have enough money to upgrade a Node to one more Core.
			while (player.money_available() < ns.hacknet.getCoreUpgradeCost(node, howmany)) {
				await ns.sleep(time);
			}
			assert(ns.hacknet.upgradeCore(node, howmany));
		}
	}
}

/**
 * Upgrade the Level of each Hacknet Node in our farm.  Our objective is to upgrade
 * the Level of each Node by one point.
 * 
 * @param ns The Netscript API.
 * @param farm An array of IDs of all Hacknet Nodes in our farm.
 */
async function upgrade_level(ns, farm) {
	assert(farm.length > 0);
	const player = new Player(ns);
	const level = 1;  // Upgrade this many Levels at a time.
	const time = seconds_to_milliseconds(10);

	// Add another Level to each Hacknet Node.
	for (const node of farm) {
		// The Level of a Node is at maximum if the cost of upgrading
		// to another Level is Infinity.
		if (isFinite(ns.hacknet.getLevelUpgradeCost(node, level))) {
			// Wait until we have enough money to upgrade a Node to another Level.
			while (player.money_available() < ns.hacknet.getLevelUpgradeCost(node, level)) {
				await ns.sleep(time);
			}
			assert(ns.hacknet.upgradeLevel(node, level));
		}
	}
}

/**
 * Upgrade the RAM of each Hacknet Node in our farm.  Our objective is to add
 * another 1GB of RAM to each Node.
 * 
 * @param ns The Netscript API.
 * @param farm An array of IDs of all Hacknet Nodes in our farm.
 */
async function upgrade_ram(ns, farm) {
	assert(farm.length > 0);
	const player = new Player(ns);
	const howmany = 1;  // Upgrade by 1GB RAM at a time.
	const time = seconds_to_milliseconds(10);

	// Add another 1GB RAM to each Hacknet Node.
	for (const node of farm) {
		// The amount of RAM of a Node is at maximum if the cost of upgrading
		// to another 1GB RAM is Infinity.
		if (isFinite(ns.hacknet.getRamUpgradeCost(node, howmany))) {
			// Wait until we have enough money to upgrade a Node to another 1GB RAM.
			while (player.money_available() < ns.hacknet.getRamUpgradeCost(node, howmany)) {
				await ns.sleep(time);
			}
			assert(ns.hacknet.upgradeRam(node, howmany));
		}
	}
}

/**
 * Purchase Hacknet Nodes and upgrade the stat of each Node by one point.
 * 
 * @param ns The Netscript API.
 * @param n The number of nodes in our Hacknet farm.  Increase our farm to
 *     have n Nodes as necessary.
 */
async function update(ns, n) {
	// The number of Nodes in our Hacknet farm.
	const nNode = Math.floor(n);
	assert(nNode > 0);

	// If we already have the required number of Hacknet Nodes, then either of two
	// cases can occur.
	//
	// (1) Each Node in our Hacknet farm is fully upgraded.  That is, each Node has its
	//     Level, RAM, and Cores all maxed out.
	// (2) At least one Node is not fully upgraded.
	//
	// In either case, the setup_farm() function would return the IDs of all Nodes in
	// our farm without adding any new Nodes to the farm.  The upgrade_level(),
	// upgrade_core(), and upgrade_ram() functions would each attempt to upgrade a Node
	// by another point.  If all Nodes are fully upgraded, then the functions
	// would exit.
	//
	// If our farm doesn't have the required number of Nodes, then the setup_farm()
	// function would purchase as many new Nodes as necessary to make up the
	// required number.  The upgrade_level(), upgrade_core(), and upgrade_ram()
	// functions would each try to add another point to each stat of a Node.
	const farm = await setup_farm(ns, nNode);
	// Upgrade the Level of each Hacknet Node by one point.
	await upgrade_level(ns, farm);
	// Add another Core to each Hacknet Node.
	await upgrade_core(ns, farm);
	// Upgrade the RAM of each Hacknet Node to another 1GB.
	await upgrade_ram(ns, farm);
}

/**
 * Purchase and manage a farm of Hacknet Nodes.
 *
 * Usage: run hnet-farm.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
	await stage_one(ns);
	await stage_two(ns);
	await stage_three(ns);
	await stage_four(ns);
	await stage_five(ns);
}
