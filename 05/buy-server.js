import { assert, choose_best_server, choose_targets, copy_and_run, filter_bankrupt_servers, network, Player, PurchasedServer, seconds_to_milliseconds, Server } from "./libbnr.js";

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
 * This is the early stage, where it is assumed that we are starting the game or
 * have just installed a bunch of Augmentations.  Each purchased server should have
 * a small amount of RAM, enough to run our hacking script using at least 2 threads.
 *
 * @param ns The Netscript API.
 */
async function stage_one(ns) {
	// Take care of the case where we have reloaded the game.
	// Not the same as a soft reset.
	const million = 10 ** 6;
	const ten_million = 10 * million;
	const player = new Player(ns);
	if (player.money_available() > ten_million) {
		return;
	}

	// Start with purchased servers that have the default amount of RAM.
	const pserv = new PurchasedServer(ns);
	const ram = pserv.default_ram();
	await update(ns, ram);
}

/**
 * At this stage, we should have tens of millions of dollars.  Use the money to buy
 * servers, each of which should have 128GB RAM.
 *
 * @param ns The Netscript API.
 */
async function stage_two(ns) {
	// Take care of the case where we have reloaded the game.
	// Not the same as a soft reset.
	const million = 10 ** 6;
	const hundred_million = 100 * million;
	const player = new Player(ns);
	if (player.money_available() > hundred_million) {
		return;
	}

	// Wait until we have tens of millions of dollars.
	const time = seconds_to_milliseconds(10);
	const ten_million = 10 * million;
	while (player.money_available() < ten_million) {
		await ns.sleep(time);
	}

	// Delete the current purchased servers.
	const pserv = new PurchasedServer(ns);
	pserv.kill_all();
	// Buy new servers with more RAM.
	const ram = 128;
	assert(pserv.is_valid_ram(ram));
	await update(ns, ram);
}

/**
 * At this stage, we should have hundreds of millions of dollars.  Use the money to buy
 * servers, each of which should have 1,024GB RAM.
 *
 * @param ns The Netscript API.
 */
async function stage_three(ns) {
	// Take care of the case where we have reloaded the game.
	// Not the same as a soft reset.
	const billion = 10 ** 9;
	const player = new Player(ns);
	if (player.money_available() > billion) {
		return;
	}

	// Wait until we have hundreds of millions of dollars.
	const time = seconds_to_milliseconds(10);
	const million = 10 ** 6;
	const hundred_million = 100 * million;
	while (player.money_available() < hundred_million) {
		await ns.sleep(time);
	}

	// Delete the current purchased servers.
	const pserv = new PurchasedServer(ns);
	pserv.kill_all();
	// Buy new servers with more RAM.
	const ram = 1024;
	assert(pserv.is_valid_ram(ram));
	await update(ns, ram);
}

/**
 * At this stage, we should have hundreds of billions of dollars.  Use the money to buy
 * servers, each of which should have 16,384GB RAM.
 *
 * @param ns The Netscript API.
 */
async function stage_four(ns) {
	// Take care of the case where we have reloaded the game.  This is not the same
	// as a soft reset.
	const player = new Player(ns);
	const current_pserv = player.pserv();
	assert(current_pserv.length > 0);
	const server = new Server(ns, current_pserv[0]);
	const ram = 16384;
	if (server.ram_max() == ram) {
		return;
	}

	// Wait until we have hundreds of billions of dollars.
	const time = seconds_to_milliseconds(10);
	const billion = 10 ** 9;
	const hundred_billion = 100 * billion;
	while (player.money_available() < hundred_billion) {
		await ns.sleep(time);
	}

	// Delete the current purchased servers.
	const pserv = new PurchasedServer(ns);
	pserv.kill_all();
	// Buy new servers with more RAM.
	assert(pserv.is_valid_ram(ram));
	await update(ns, ram);
}

/**
 * Purchase the maximum number of servers and run our hack script on those servers.
 * The script chooses the "best" targets to hack.
 *
 * @param ns The Netscript API.
 * @param ram The amount of RAM for each purchased server.  Must be a power of 2.
 */
async function update(ns, ram) {
	// The amount of RAM must be a power of 2.  RAM is assumed to be in GB.
	const pserv = new PurchasedServer(ns);
	const server_ram = Math.floor(ram);
	assert(pserv.is_valid_ram(server_ram));

	// Continuously try to purchase a new server until we've reached the maximum
	// number of servers we can buy.
	const player = new Player(ns);
	let i = player.pserv().length;
	let target = new Array();
	const time = seconds_to_milliseconds(10);
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
			assert(await server.gain_root_access());
			assert(await copy_and_run(ns, hostname, server.hostname()));
			i++;
		}
		// Sleep for a while.
		await ns.sleep(time);
	}
}

/**
 * Continuously try to purchase servers and use those to hack world servers.
 * If our funds are sufficient, try to upgrade to servers with higher
 * amounts of RAM.
 * 
 * Usage: run buy-server.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
	await stage_one(ns);
	await stage_two(ns);
	await stage_three(ns);
	await stage_four(ns);
}
