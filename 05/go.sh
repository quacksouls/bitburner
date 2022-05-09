/**
 * Restart our source of income and Hack experience points.  This script is useful whenever
 * we have installed a bunch of Augmentations and we want to automatically restart scripts to:
 * 
 *     (1) Purchase Hacknet Nodes and manage our farm of Nodes.
 *     (2) Purchase servers and use each purchased server to hack a target server in the game world.
 *     (3) Gain root access to servers in the game world (excluding purchased servers) and use
 *         each server to hack itself.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
	const home = "home";
	const nthread = 1;

	// Use servers in the game world to hack themselves.  We would likely have to restart this
	// script once our Hack stat is high enough and/or we can scan the network with a depth
	// of more than 3.
	ns.exec("world-server.js", home, nthread);

	// Setup a farm of Hacknet Nodes.  Start with a small number of Nodes because we would most
	// likely not have sufficient funds after installing Augmentations.  Must restart this
	// script when we have more money to purchase many more Hacknet Nodes.
	const nNode = 3;
	ns.exec("hnet-farm.js", home, nthread, nNode);

	// Purchase servers and use each purchased server to hack a target server.  Must restart this
	// script once we can scan the network with a depth of more than 3.
	const server_ram = 8;  // in GB
	ns.exec("buy-server.js", home, nthread, server_ram);
}
