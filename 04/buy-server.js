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
 * Purchase new servers and run our hack script on those servers.
 *
 * @param {NS} ns
 */
export async function main(ns) {
	// We want each server to have 16GB of RAM.  We will use 6 threads to run
	// the hack.js script on a server.
	const ram = 16;
	// The ID of a purchased server.
	var i = 0;
	// Our hack script.
	const script = "hack.js";
	// Our hack script is located on our home server.
	const source = "home";
	// How many threads to run our script on a purchased server.
	const nthread = 6;
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
		if (ns.getServerMoneyAvailable(source) > ns.getPurchasedServerCost(ram)) {
			// If we have enough money, then:
			// (1) purchase a new server;
			const hostname = ns.purchaseServer("pserv-" + i, ram);
			// (2) copy our hack script over to the purchased server;
			await ns.scp(script, source, hostname);
			// (3) run our hack script on the purchased server.
			ns.exec(script, hostname, nthread, target);
			i++;
		}
		// Sleep for a while.
		await ns.sleep(time);
	}
}
