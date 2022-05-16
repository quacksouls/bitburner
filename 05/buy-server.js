import { assert, choose_best_server, choose_targets, copy_and_run, filter_bankrupt_servers, network, Player, PurchasedServer, Server } from "./libbnr.js";

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
 * Purchase the maximum number of servers and run our hack script on those servers.
 * The script chooses the "best" targets to hack.  Must provide the amount of RAM from
 * the command line.  The amount of RAM must be a power of 2.  For example, we can start
 * with buying servers each of which has 8GB RAM.  Later on when we have more money, we
 * can delete these servers and purchase servers with a higher amount of RAM, e.g. 32GB RAM.
 * 
 * Usage: run buy-server.js [RAMamount]
 * Example: run buy-server.js 8
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
	// Sanity checks.
	const error_msg = "Must provide the amount of RAM, e.g. 4, 8, 16, 32, etc.";
	if (ns.args.length < 1) {
		await ns.tprint(error_msg);
		ns.exit();
	}
	// The amount of RAM provided from the command line must be a power of 2.
	// RAM is assumed to be in GB.
	const pserv = new PurchasedServer(ns);
	const server_ram = Math.floor(ns.args[0]);
	if (!pserv.is_valid_ram(server_ram)) {
		await ns.tprint(error_msg);
		ns.exit();
	}

	// Continuously try to purchase a new server until we've reached the maximum
	// number of servers we can buy.
	const player = new Player(ns);
	let i = player.pserv().length;
	let target = new Array();
	const time = 10000;  // 10 seconds
	while (i < pserv.limit()) {
		// Do we have enough money to buy a new server?
		if (player.money_available() > pserv.cost(server_ram)) {
			// Purchase a new server.
			const hostname = pserv.purchase("pserv", server_ram);
			// Choose the best target server.
			target = renew_targets(ns, target);
			const server = new Server(ns, choose_best_server(ns, target));
			target = target.filter(s => s != server.hostname());
			// Run our hack script on the purchased server.
			await server.gain_root_access();
			assert(await copy_and_run(ns, hostname, server.hostname()));
			i++;
		}
		// Sleep for a while.
		await ns.sleep(time);
	}
}
