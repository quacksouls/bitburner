/**
 * Exclude the purchased servers.
 * 
 * @param server An array of server names.
 * @return An array of servers, but minus the purchased servers.
 */
function filter_pserv(server) {
	// All purchased servers.
	const pserv = new Set(["pserv-0",
		"pserv-1","pserv-2","pserv-3","pserv-4","pserv-5","pserv-6",
		"pserv-7","pserv-8","pserv-9","pserv-10","pserv-11","pserv-12",
		"pserv-13","pserv-14","pserv-15","pserv-16","pserv-17","pserv-18",
		"pserv-19","pserv-20","pserv-21","pserv-22","pserv-23","pserv-24"]);
	// Filter out the purchased servers.
	var serv = new Array();
	serv = serv.concat(server);
	return serv.filter(s => !pserv.has(s));
}

/**
 * Determine the number of ports we can open on servers in the game world.  This
 * depends on whether we have the necessary programs on our home server to allow us to
 * hack other servers.
 * 
 * @param ns The Netscript API.
 * @return The number of ports we can open on other servers.  Return -1 if we don't
 *     have the core programs and scripts on our home server.
 */
function how_many_ports(ns) {
	const home = "home";
	// These are programs/scripts that should remain on our home server after 
	// installing Augmentations.
	const core_program = ["hack.js", "NUKE.exe"];
	// These are programs that can be created after satisfying certain conditions.
	const other_program = ["BruteSSH.exe", "FTPCrack.exe", "HTTPWorm.exe", "relaySMTP.exe", "SQLInject.exe"];

	// Sanity check to ensure we have the core programs/scripts.
	for (const p of core_program) {
		if (!ns.fileExists(p, home)) {
			return -1;
		}
	}
	// Determine the number of ports we can open on other servers.
	var n = 0;
	for (const p of other_program) {
		if (ns.fileExists(p, home)) {
			n++;
		}
	}
	return n;
}

/**
 * Scan the network of servers in the game world.  Each server must be reachable
 * from our home server.
 * 
 * @param ns The Netscript API.
 * @return An array of servers that can be reached from home.
 */
function network(ns) {
	// We scan the world network from a node, which is assumed to be our home server.
	// We refer to our home server as the root of the tree.
	const root = "home";

	// A set of all servers we can visit at the moment.
	var server = new Set();
	// A stack of servers to visit.  We start from our home server.
	var stack = new Array();
	stack.push(root);

	// Use depth-first search to navigate all servers we can visit.
	while (stack.length > 0) {
		const s = stack.pop();
		// Have we visited the server s yet?
		if (!server.has(s)) {
			// The server s is now visited.
			server.add(s);
			// Add all neighbours of s to the stack.  Take care to exclude the
			// purchased servers.
			for (const neighbour of filter_pserv(ns.scan(s))) {
				stack.push(neighbour);
			}
		}
	}
	// Convert the set of servers to an array of servers.
	server = [...server];
	// Remove the root node from our array.  We want all servers that are connected
	// either directly or indirectly to the root node.
	return server.filter(s => root != s);
}

/**
 * Use servers in the game world to hack a target.  We exclude purchased servers.
 * The argument to this script should be the target server to hack.
 * 
 * @param {NS} ns
 */
export async function main(ns) {
	// Determine the number of ports we can open on other servers.
	const nport = how_many_ports(ns);
	if (-1 == nport) {
		ns.alert("Missing core scripts/programs on home.");
		ns.exit();
	}
	// Ensure our Hack stat is high enough to hack the target server.
	const target = ns.args[0];
	const time = 10000;  // 10 seconds
	while (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(target)) {
		await ns.sleep(time);
	}

	// Gain root access on as many servers as possible on the network.  Copy our hack
	// script to each server and use the server to hack the target.
	// Note: also use the target server to hack itself.
	const server = network(ns);
	const script = "hack.js";
	const source = "home";
	const script_ram = ns.getScriptRam(script, source);
	for (const s of server) {
		// Skip over a server that requires more ports than we can open.
		if (ns.getServerNumPortsRequired(s) > nport) {
			continue;
		}
		// Determine how many threads we can run on a server.  If we can't run our script
		// on the server, then we skip the server.
		const server_ram = ns.getServerMaxRam(s) - ns.getServerUsedRam(s);
		const nthread = Math.floor(server_ram / script_ram);
		if (nthread < 1) {
			continue;
		}
		// Wait until we meet the minimum hacking skill requirement of a server.
		while (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(s)) {
			await ns.sleep(time);
		}
		// Ensure we have root access on the server.
		if (!ns.hasRootAccess(s)) {
			try {
				ns.brutessh(s);
			} catch {}
			try {
				ns.ftpcrack(s);
			} catch {}
			try {
				ns.httpworm(s);
			} catch {}
			try {
				ns.relaysmtp(s);
			} catch {}
			try {
				ns.sqlinject(s);
			} catch {}
			ns.nuke(s);
		}
		// Copy our hack script over to a server.  Use the server to hack the target.
		await ns.scp(script, source, s);
		ns.exec(script, s, nthread, target);
	}
}
