/**
 * Exclude the purchased servers.
 * 
 * @param server An array of server names.
 * @return An array of servers, but minus the purchased servers.
 */
function filter_pserv(server) {
	// All purchased servers.
	const pserv = ["pserv-0",
		"pserv-1","pserv-2","pserv-3","pserv-4","pserv-5","pserv-6",
		"pserv-7","pserv-8","pserv-9","pserv-10","pserv-11","pserv-12",
		"pserv-13","pserv-14","pserv-15","pserv-16","pserv-17","pserv-18",
		"pserv-19","pserv-20","pserv-21","pserv-22","pserv-23","pserv-24"];
	// Filter out the purchased servers.
	var serv = new Array();
	serv = serv.concat(server);
	for (const p of pserv) {
		serv = serv.filter(s => s != p);
	}
	return serv;
}

/**
 * Whether we have the necessary programs on our home server to allow us to gain
 * root access on other servers.
 * 
 * @param ns The Netscript API.
 * @return true if we have the necessary programs; false otherwise.
 */
function have_programs(ns) {
	const home = "home";
	const program = ["BruteSSH.exe", "FTPCrack.exe", "NUKE.exe"];

	// Ensure we have the prerequisite programs on our home server.
	for (const p of program) {
		if (!ns.fileExists(p, home)) {
			ns.alert(p + " not found on server " + home);
			return false;
		}
	}
	return true;
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
 * Use servers in the game world to hack a target.  We exclude purchased
 * servers.
 * 
 * @param {NS} ns
 */
export async function main(ns) {
	// Ensure we have the prerequisite programs to gain root access on other servers.
	if (!have_programs(ns)) {
		ns.exit();
	}
	// Ensure our Hack stat is high enough to hack the target server.
	const target = "neo-net";
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
	const nport = 2;  // Can open this many ports.
	for (const s of server) {
		// Skip over a server that requires 3 open ports.  Currently, we can only open 2 ports.
		if (ns.getServerNumPortsRequired(s) > nport) {
			continue;
		}
		// Wait until we meet the minimum hacking skill requirement of a server.
		while (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(s)) {
			await ns.sleep(time);
		}
		// Ensure we have root access on the server.
		if (!ns.hasRootAccess(s)) {
			ns.brutessh(s);
			ns.ftpcrack(s);
			ns.nuke(s);
		}
		// Determine how many threads we can run on a server.  If we can't run our script
		// on the server, then we skip the server.
		const server_ram = ns.getServerMaxRam(s) - ns.getServerUsedRam(s);
		const nthread = Math.floor(server_ram / script_ram);
		if (nthread < 1) {
			continue;
		}
		// Copy our hack script over to a server.  Use the server to hack the target.
		await ns.scp(script, source, s);
		ns.exec(script, s, nthread, target);
	}
}
