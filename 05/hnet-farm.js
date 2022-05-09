import { assert } from "./libbnr.js";

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
	const home = "home";
	const time = 10000;  // 10 seconds

	// If we already have a farm of n Hacknet Nodes, return the IDs of the Nodes.
	if (ns.hacknet.numNodes() == nNode) {
		return [...Array(nNode).keys()];
	}

	// Purchase Hacknet Nodes for our farm.
	for (let i = ns.hacknet.numNodes(); i < nNode; i++) {
		// Wait until we have sufficient funds to purchase another Hacknet Node.
		while (ns.getServerMoneyAvailable(home) < ns.hacknet.getPurchaseNodeCost()) {
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
 * Upgrade the Core of each Hacknet Node in our farm.  Our objective is to max out
 * the number of Cores of each Hacknet Node.
 * 
 * @param ns The Netscript API.
 * @param farm The set of IDs of all Hacknet Nodes in our farm.
 */
async function upgrade_core(ns, farm) {
	const home = "home";
	const howmany = 1;   // Upgrade this many Cores at a time.
	const time = 10000;  // 10 seconds

	// Max out the number of Cores of a Hacknet Node.  Then wait and see whether we can
	// max out the number of Cores of another Node.
	for (const node of farm) {
		// We know that the number of Cores of a Node is at maximum if the cost of upgrading
		// to another Core is Infinity.
		while (isFinite(ns.hacknet.getCoreUpgradeCost(node, howmany))) {
			// Wait until we have enough money to upgrade a Node to another Core.
			while (ns.getServerMoneyAvailable(home) < ns.hacknet.getCoreUpgradeCost(node, howmany)) {
				await ns.sleep(time);
			}
			assert(ns.hacknet.upgradeCore(node, howmany));
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
	const home = "home";
	const level = 1;     // Upgrade this many Levels at a time.
	const time = 10000;  // 10 seconds

	// Max out the Level of a Hacknet Node.  Then wait and see whether we can
	// max out the Level of another Node.
	for (const node of farm) {
		// We know that the Level of a Node is at maximum if the cost of upgrading
		// to another Level is Infinity.
		while (isFinite(ns.hacknet.getLevelUpgradeCost(node, level))) {
			// Wait until we have enough money to upgrade a Node to another Level.
			while (ns.getServerMoneyAvailable(home) < ns.hacknet.getLevelUpgradeCost(node, level)) {
				await ns.sleep(time);
			}
			assert(ns.hacknet.upgradeLevel(node, level));
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
	const home = "home";
	const howmany = 1;   // Upgrade by 1GB RAM at a time.
	const time = 10000;  // 10 seconds

	// Max out the amount of RAM of a Hacknet Node.  Then wait and see whether we can
	// max out the amount of RAM of another Node.
	for (const node of farm) {
		// We know that the amount of RAM of a Node is at maximum if the cost of upgrading
		// to another 1GB RAM is Infinity.
		while (isFinite(ns.hacknet.getRamUpgradeCost(node, howmany))) {
			// Wait until we have enough money to upgrade a Node to another 1GB RAM.
			while (ns.getServerMoneyAvailable(home) < ns.hacknet.getRamUpgradeCost(node, howmany)) {
				await ns.sleep(time);
			}
			assert(ns.hacknet.upgradeRam(node, howmany));
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
	// If we already have the required number of Hacknet Nodes, then exit.
	assert(nNode > 0);
	if (ns.hacknet.numNodes() >= nNode) {
		await ns.tprint("Already have at least " + nNode + " Nodes in Hacknet farm.");
		ns.exit();
	}
	// Setup our farm of Hacknet Nodes.  Each Node should be at base stats for now.
	if (nNode > ns.hacknet.numNodes()) {
		const farm = await setup_farm(ns, nNode);
		// Upgrade the Level of each Hacknet Node to maximum.
		await upgrade_level(ns, farm);
		// Upgrade the Cores of each Hacknet Node to maximum.
		await upgrade_core(ns, farm);
		// Max out the amount of RAM of each Hacknet Node.
		await upgrade_ram(ns, farm);
	}
}
