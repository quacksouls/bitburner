import { choose_targets, filter_bankrupt_servers, network, Player } from "./libbnr.js";

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
	const player = new Player(ns);
	const nthread = 1;

	// First, use our home server to hack world servers that satisfy these criteria:
	// (1) Require a hacking skill of 1 because our Hack stat is 1 after a soft reset.
	// (2) Does not require any ports to be opened in order for us to run NUKE.exe on the
	//     server.  The script should be able to figure out whether or not we can open
	//     all ports on a world server.
	const nthread_home = 4;
	const target = filter_bankrupt_servers(ns, choose_targets(ns, network(ns)));
	for (const server of target) {
		ns.exec(player.script(), player.home(), nthread_home, server);
	}

	// Use servers in the game world to hack themselves.  We would likely have to restart this
	// script once our Hack stat is high enough and/or we can scan the network with a depth
	// of more than 3.
	ns.exec("world-server.js", player.home(), nthread);

	// Setup a farm of Hacknet Nodes.  Start with a small number of Nodes because we would most
	// likely not have sufficient funds after installing Augmentations.  Must restart this
	// script when we have more money to purchase many more Hacknet Nodes.
	const nNode = 3;
	ns.exec("hnet-farm.js", player.home(), nthread, nNode);

	// Purchase servers and use each purchased server to hack a target server.  Must restart this
	// script once we can scan the network with a depth of more than 3.
	const server_ram = 8;  // in GB
	ns.exec("buy-server.js", player.home(), nthread, server_ram);
}
