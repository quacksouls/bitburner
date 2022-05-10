import { assert, choose_best_server, choose_targets, copy_and_run, filter_bankrupt_servers, network, root_access } from "./libbnr.js";

/**
 * Obtain a new batch of target servers to hack.
 * 
 * @param ns The Netscript API.
 * @param target An array of current targets.
 * @return A possibly new array of more targets to hack.
 */
function renew_targets(ns, target) {
	if (target.length < 1) {
		target = filter_bankrupt_servers(ns, choose_targets(ns, network(ns)));
		assert(target.length > 0);
	}
	return target;
}

/**
 * Purchase new servers and run our hack script on those servers.  The script chooses the
 * "best" targets to hack.  Must provide the amount of RAM from the command line.  The
 * amount of RAM must be a power of 2.  For example, we can start with buying servers
 * each of which has 8GB RAM.  Later on when we have more money, we can delete these
 * servers and purchase servers with a higher amount of RAM, e.g. 32GB RAM.
 * 
 * Usage: run buy-server.js
 * Example: run buy-server.js 8
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
	// Sanity checks.
	const error_msg = "Must provide the amount of RAM, e.g. 4, 8, 16, 32, etc.";
	if (ns.args.length < 1) {
		ns.tprint(error_msg);
		ns.exit();
	}
	// The amount of RAM provided from the command line must be a power of 2.
	// RAM is assumed to be in GB.
	const valid_ram = new Set([4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384]);
	const server_ram = Math.floor(ns.args[0]);
	if (!valid_ram.has(server_ram)) {
		ns.tprint(error_msg);
		ns.exit();
	}

	// Continuously try to purchase a new server until we've reached the maximum
	// number of servers we can buy.
	const pserv = ns.getPurchasedServers();
	const source = "home";
	const time = 10000;  // 10 seconds
	let i = pserv.length;
	let target = new Array();
	while (i < ns.getPurchasedServerLimit()) {
		// Do we have enough money (on our home server) to buy a new server?
		if (ns.getServerMoneyAvailable(source) > ns.getPurchasedServerCost(server_ram)) {
			// Purchase a new server.
			const hostname = ns.purchaseServer("pserv", server_ram);
			// Choose the best target server that has money available.
			target = renew_targets(ns, target);
			const t = choose_best_server(ns, target);
			target = target.filter(s => s != t);
			// Run our hack script on the purchased server.
			await root_access(ns, t);
			assert(await copy_and_run(ns, hostname, t));
			i++;
		}
		// Sleep for a while.
		await ns.sleep(time);
	}
}
