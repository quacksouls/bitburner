/**
 * A library of functions that can be imported into other scripts.
 */

/**
 * A function for assertion.
 * 
 * @param cond Assert that this condition is true.
 * @return Throw an assertion error if the given condition is false.
 */
export function assert(cond) {
	if (!cond) {
		throw new Error("Assertion failed.");
	}
}

/**
 * Determine the best server to hack.  The definition of "best" is subjective.  However, at the
 * moment the "best" server is the one that requires the highest hacking skill.
 * 
 * @param ns The Netscript API.
 * @param candidate Choose from among the servers in this array.
 * @return The best server to hack.
 */
export function choose_best_server(ns, candidate) {
	assert(candidate.length > 0);
	let best = candidate[0];
	for (const s of candidate) {
		if (ns.getServerRequiredHackingLevel(best) < ns.getServerRequiredHackingLevel(s)) {
			best = s;
		}
	}
	return best;
}

/**
 * Determine a bunch of servers in the game world to hack.  A target server is chosen based on
 * these criteria:
 * 
 *     (1) We meet the hacking skill requirement of the server.
 *     (2) We can open all ports required to gain root access to the server.
 * 
 * @param ns The Netscript API.
 * @param candidate Use this array to search for targets to hack.
 * @return An array of target servers.
 */
export function choose_targets(ns, candidate) {
	// Sanity check.
	assert(candidate.length > 0);

	let target = new Array();
	for (const s of candidate) {
		// Do we have the minimum hacking skill required?
		if (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(s)) {
			continue;
		}
		// Can we open all required ports?
		const nport = how_many_ports(ns);
		if (ns.getServerNumPortsRequired(s) > nport) {
			continue;
		}
		// We have found a target server.
		target.push(s);
	}
	return target;
}

/**
 * Copy our hack and library scripts over to a server and run the hack script on
 * the server.
 * 
 * @param ns The Netscript API.
 * @param server Copy our hack and library scripts to this server.  Run our hack
 *     script on this server.
 * @param target We run our hack script against this target server.
 * @return true if our hack script is running on the server using at least one thread;
 *     false otherwise, e.g. no free RAM on the server or we don't have root access on
 *     either servers.
 */
export async function copy_and_run(ns, server, target) {
	// Sanity checks.
	// No root access on either servers.
	if (!ns.hasRootAccess(server)) {
		await ns.tprint("No root access on server: " + server);
		return false;
	}
	if (!ns.hasRootAccess(target)) {
		await ns.tprint("No root access on server: " + target);
		return false;
	}
	// Hack and library scripts not found on our home server.
	const script = "hack.js";
	const library = "libbnr.js";
	const source = "home";
	if (!ns.fileExists(script, source)) {
		await ns.tprint("File " + script + " not found on server " + source);
		return false;
	}
	if (!ns.fileExists(library, source)) {
		await ns.tprint("File " + library + " not found on server " + source);
		return false;
	}
	// No free RAM on server to run our hack script.
	const nthread = how_many_threads(ns, script, server);
	if (nthread < 1) {
		await ns.tprint("No free RAM on server: " + server);
		return false;
	}

	// Copy our scripts over to a server.  Use the server to hack a target.
	await ns.scp(script, source, server);
	await ns.scp(library, source, server);
	await ns.exec(script, server, nthread, target);
	return true;
}

/**
 * Remove bankrupt servers from a given array of servers.  A server is bankrupt if it
 * has no money available.
 * 
 * @param ns The Netscript API.
 * @param candidate An array of servers to filter.
 * @return An array of servers, each of which is not bankrupt.
 */
export function filter_bankrupt_servers(ns, candidate) {
	assert(candidate.length > 0);
	return candidate.filter(s => !is_bankrupt(ns, s));
}

/**
 * Exclude the purchased servers.
 * 
 * @param ns The Netscript API.
 * @param server An array of server names.
 * @return An array of servers, but minus the purchased servers.
 */
export function filter_pserv(ns, server) {
	// All purchased servers.
	const pserv = new Set(ns.getPurchasedServers());
	// Filter out the purchased servers.
	const serv = Array.from(server);
	return serv.filter(s => !pserv.has(s));
}

/**
 * All hack programs that can be created once certain conditions are met.
 */
export function hack_programs() {
	const program = ["BruteSSH.exe", "FTPCrack.exe", "HTTPWorm.exe", "relaySMTP.exe", "SQLInject.exe"];
	return program;
}

/**
 * Determine the number of ports we can open on servers in the game world.  This
 * depends on whether we have the necessary programs on our home server to allow us to
 * hack other servers.
 * 
 * @param ns The Netscript API.
 * @return The number of ports we can open on other servers.  Return -1 if we don't
 *     have the core programs and/or scripts on our home server.
 */
export function how_many_ports(ns) {
	const home = "home";
	// These are programs/scripts that should remain on our home server after 
	// installing Augmentations.
	const core_program = ["hack.js", "libbnr.js", "NUKE.exe"];
	// These are programs that can be created after satisfying certain conditions.
	const other_program = hack_programs();

	// Sanity check to ensure we have the core programs/scripts.
	for (const p of core_program) {
		if (!ns.fileExists(p, home)) {
			ns.tprint(p + " not found on server " + home);
			return -1;
		}
	}
	// Determine the number of ports we can open on other servers.
	let n = 0;
	for (const p of other_program) {
		if (ns.fileExists(p, home)) {
			n++;
		}
	}
	return n;
}

/**
 * Determine how many threads we can run a given script on a server.
 * 
 * @param ns The Netscript API.
 * @param script We want to run this script on a server.  The script must exists
 *     on our home server.
 * @param server The target server.
 * @return The number of threads to use to run the given script.
 */
export function how_many_threads(ns, script, server) {
	const source = "home";
	const script_ram = ns.getScriptRam(script, source);
	const server_ram = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
	const nthread = Math.floor(server_ram / script_ram);
	return nthread;
}

/**
 * Determine whether a server is bankrupt, i.e. has no money available.
 * 
 * @param ns The Netscript API.
 * @param server Test this server for bankruptcy.
 * @return true if the given server is bankrupt; false otherwise.
 */
export function is_bankrupt(ns, server) {
	const money_available = Math.floor(ns.getServerMoneyAvailable(server));
	if (0 == money_available) {
		return true;
	}
	return false;
}

/**
 * Scan the network of servers in the game world.  Each server must be reachable
 * from our home server.
 * 
 * @param ns The Netscript API.
 * @return An array of servers that can be reached from home.
 */
export function network(ns) {
	// We scan the world network from a node, which is assumed to be our home server.
	// We refer to our home server as the root of the tree.
	const root = "home";

	// A set of all servers we can visit at the moment.
	let server = new Set();
	// A stack of servers to visit.  We start from our home server.
	let stack = new Array(root);

	// Use depth-first search to navigate all servers we can visit.
	while (stack.length > 0) {
		const s = stack.pop();
		// Have we visited the server s yet?
		if (!server.has(s)) {
			// The server s is now visited.
			server.add(s);
			// Add all neighbours of s to the stack.  Take care to exclude the
			// purchased servers.
			stack.push(...filter_pserv(ns, ns.scan(s)));
		}
	}
	// Convert the set of servers to an array of servers.
	server = [...server];
	// Remove the root node from our array.  We want all servers that are connected
	// either directly or indirectly to the root node.
	return server.filter(s => root != s);
}

/**
 * Try to gain root access on a target server.
 * 
 * @param ns The Netscript API.
 * @param target The target server.
 */
export async function root_access(ns, target) {
	try { await ns.brutessh(target); } catch { }
	try { await ns.ftpcrack(target); } catch { }
	try { await ns.httpworm(target); } catch { }
	try { await ns.relaysmtp(target); } catch { }
	try { await ns.sqlinject(target); } catch { }
	try {
		await ns.nuke(target);
	} catch {
		throw new Error("Can't gain root access to server: " + target);
	}
}
