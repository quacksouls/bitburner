/**
 * Whether we have the necessary programs on our home server to allow us to 
 * hack other servers.
 * 
 * @param ns The Netscript API.
 * @return true if we have the necessary programs; false otherwise.
 */
function have_programs(ns) {
	const home = "home";
	const program = ["BruteSSH.exe", "FTPCrack.exe", "hack.js", "NUKE.exe"];

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
 * Purchase new servers and run our hack script on those servers.
 *
 * @param {NS} ns
 */
export async function main(ns) {
	// We want each server to have 16GB of RAM.
	const server_ram = 16;
	// The ID of a purchased server.
	var i = 0;
	// Our hack script.
	const script = "hack.js";
	// Our hack script is located on our home server.
	const source = "home";
	// How many threads to run our script on a purchased server.
	const script_ram = ns.getScriptRam(script, source);
	const nthread = Math.floor(server_ram / script_ram);
	// Hack this target.
	const target = "neo-net";
	// 10,000 milliseconds or 10 seconds.
	const time = 10000;

	// Wait for our Hack stat to be high enough to hack the target server.
	while (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(target)) {
		await ns.sleep(time);
	}
	// Gain root access on the target server.
	if (!have_programs(ns)) {
		ns.alert("One or more hacking programs not found.");
		ns.exit();
	}
	if (!ns.hasRootAccess(target)) {
		ns.brutessh(target);
		ns.ftpcrack(target);
		ns.nuke(target);
	}

	// Continuously try to purchase a new server until we've reached the maximum
	// number of servers we can buy.
	while (i < ns.getPurchasedServerLimit()) {
		// Do we have enough money (on our home server) to buy a new server?
		if (ns.getServerMoneyAvailable(source) > ns.getPurchasedServerCost(server_ram)) {
			// If we have enough money, then:
			// purchase a new server;
			const hostname = ns.purchaseServer("pserv-" + i, server_ram);
			// copy our hack script over to the purchased server;
			await ns.scp(script, source, hostname);
			// run our hack script on the purchased server.
			ns.exec(script, hostname, nthread, target);
			i++;
		}
		// Sleep for a while.
		await ns.sleep(time);
	}
}
