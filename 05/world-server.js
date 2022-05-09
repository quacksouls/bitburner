import { assert, choose_best_server, copy_and_run, filter_pserv, how_many_ports, how_many_threads, is_bankrupt, network, root_access } from "./libbnr.js";

/**
 * Determine which servers in the game world have been compromised.  We exclude all
 * purchased servers.  A server in the game world is said to be compromised provided that:
 * 
 *     (1) We have root access to the server.
 *     (2) Our hack scripts are currently running on the server.
 * 
 * @param ns The Netscript API.
 * @param script A hack script.  We want to check whether a server is running this script.
 * @param server An array of server names.
 * @return An array of servers that have been compromised.
 */
function compromised_servers(ns, script, server) {
	assert(server.length > 0);
	let compromised = new Array();
	for (const s of filter_pserv(ns, server)) {
		if (ns.hasRootAccess(s) && ns.scriptRunning(script, s)) {
			compromised.push(s);
		}
	}
	return compromised;
}

/**
 * Gain root access on a server, copy our hack scripts over to the server, and use
 * the server to hack a target.
 * 
 * @param ns The Netscript API.
 * @param server Use this server to hack a target.
 * @param target Hack this server.
 */
async function hack_a_server(ns, server, target) {
	// Ensure we have root access on both servers.
	if (!ns.hasRootAccess(server)) {
		await root_access(ns, server);
	}
	if (!ns.hasRootAccess(target)) {
		await root_access(ns, target);
	}
	// Copy our hack scripts over to a server.  Use the server to hack a target.
	assert(await copy_and_run(ns, server, target));
}

/**
 * Try to hack a bunch of servers in the game world.
 * 
 * @param ns The Netscript API.
 * @param target Try to hack one or more servers on this list.  Can't be
 *     an empty array.
 * @return An array of two elements:
 *     * An array of servers we can't hack at the moment.
 *     * An array of servers that have been hacked.
 */
async function hack_servers(ns, target) {
	// Sanity check.
	assert(target.length > 0);
	// Determine the maximum number of ports we can open on a server.
	const nport = how_many_ports(ns);
	if (-1 == nport) {
		throw new Error("Missing core scripts/programs on home.");
	}
	// A list of servers that were successfully hacked.
	let hacked_server = new Array();

	// Gain root access on as many servers as possible on the network.  Copy our hack
	// script to each server and use the server to hack itself.
	let reject = new Array();  // Servers we can't hack at the moment.
	const script = "hack.js";
	// A Hack stat margin: 5% of our Hack stat, plus another 5.
	const margin = Math.floor((0.05 * ns.getHackingLevel()) + 5);
	for (const s of target) {
		// Should we skip this server?
		if (skip_server(ns, s, script, margin)) {
			continue;
		}
		const hack_lvl = ns.getHackingLevel();
		const required_lvl = ns.getServerRequiredHackingLevel(s);
		// If the hacking skill requirement of the server is within the margin of our
		// Hack stat, skip the server for now but make a note to attempt at a later time.
		if (hack_lvl < required_lvl) {
			if (tolerate_margin(ns, margin, s)) {
				reject.push(s);
				continue;
			}
		}
		assert(hack_lvl >= required_lvl);
		// If the server has no money available, skip the server for now and add it to the
		// list of rejects.
		if (is_bankrupt(s)) {
			reject.push(s);
			continue;
		}
		// Use the server to hack itself.
		await hack_a_server(ns, s, s);
		hacked_server.push(s);
	}
	return [reject, hacked_server];
}

/**
 * Use a bankrupt server to hack a server that has money.
 * 
 * @param ns The Netscript API.
 * @param candidate Scan this array of servers to see whether any is bankrupt.
 * @param hacked_server Each server in this array has been successfully hacked.
 *     The implication is that each server is not bankrupt, i.e. has money available.
 * @return An array of servers we cannot redirect at the moment.
 */
async function redirect_bankrupt_server(ns, candidate, hacked_server) {
	// Sanity checks.
	assert(candidate.length > 0);
	assert(hacked_server.length > 0);

	let hserver = new Array();
	hserver = hserver.concat(hacked_server);
	let reject = new Array();

	for (const s of candidate) {
		if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(s)) {
			// Redirect a bankrupt server to hack a target.
			if (is_bankrupt(ns, s)) {
				// Choose a target server from a list of servers that have been hacked.
				const target = choose_best_server(ns, hserver);
				assert(!is_bankrupt(ns, target));
				hserver = hserver.filter(s => s != target);
				// Redirect the broke server to hack the target server.
				await hack_a_server(ns, s, target);
				continue;
			}
		}
		reject.push(s);
	}
	return reject;
}

/**
 * Whether we should skip the server.  A server might be skipped over for various reasons.
 * 
 * @param ns The Netscript API.
 * @param server Should we skip this server?
 * @param script The name of our hacking script.
 * @param margin The Hack stat margin.  For servers whose hacking skill requirement is higher
 *     than our current Hack stat, the margin is the extra Hack stat we are willing to wait
 *     to acquire.  Let h be our Hack stat, let m be the margin, and r the required hacking
 *     skill requirement of the server.  If h + m < r, then the hacking skill requirement of
 *     the server is too high and we should skill over this server.  In case h < r and
 *     h + m >= r, we are willing to wait for our Hack stat to increase by an extra m points.
 * @return true if we are to skip over the given server; false otherwise.
 */
function skip_server(ns, server, script, margin) {
	const m = Math.floor(margin);
	assert(m > 0);
	// Determine the maximum number of ports we can open on a server.
	const nport = how_many_ports(ns);
	assert(nport > -1);

	// Skip over a server that requires more ports than we can open.
	if (ns.getServerNumPortsRequired(server) > nport) {
		return true;
	}
	// If our hack script is already running on the server, then skip the server.
	if (ns.isRunning(script, server, server)) {
		return true;
	}
	// Determine how many threads we can run our script on a server.  If we can't
	// run our script on the server, then we skip the server.
	const nthread = how_many_threads(ns, script, server);
	if (nthread < 1) {
		return true;
	}
	// Skip over a server if its hacking skill requirement is too high.
	if ((ns.getHackingLevel() + m) < ns.getServerRequiredHackingLevel(server)) {
		return true;
	}
	return false;
}

/**
 * Whether to tolerate the given margin with respect to the hacking skill requirement
 * of a server.  Let h be our Hack stat, m the margin, and r the hacking skill
 * requirement of a server.  Suppose that h < r.  We are willing to tolerate the
 * margin, i.e. wait for our Hack stat to increase by an extra m points, provided that
 * h + m >= r.
 * 
 * @param ns The Netscript API.
 * @param margin The Hack stat margin.
 * @param server The target server.
 * @return true if we are willing to tolerate the margin; false otherwise.
 */
function tolerate_margin(ns, margin, server) {
	const h = ns.getHackingLevel();
	const m = Math.floor(margin);
	assert(m > 0);
	const requirement = ns.getServerRequiredHackingLevel(server);
	assert(h < requirement);
	if ((h + m) >= requirement) {
		return true;
	}
	return false;
}

/**
 * Use each server in the game world to hack itself.  We exclude purchased servers.
 * 
 * Usage: run world-server.js
 * 
 * @param ns The Netscript API.
 */
export async function main(ns) {
	let server = network(ns);
	const time = 10000;  // 10 seconds
	// A list of servers that have been successfully hacked.
	const script = "hack.js";
	let hacked_server = compromised_servers(ns, script, server);
	// Continuously try to gain root access to servers in the game world and
	// let each server hack itself.  Exclude all purchased servers.
	while (server.length > 0) {
		let [reject, hacked] = await hack_servers(ns, server);
		hacked_server = new Set(hacked_server.concat(hacked));
		hacked_server = [...hacked_server];
		assert(hacked_server.length > 0);
		// Redirect a bankrupt server to hack another target.
		if (reject.length > 0) {
			reject = await redirect_bankrupt_server(ns, reject, hacked_server);
		}
		server = reject;
		await ns.sleep(time);
	}
}
