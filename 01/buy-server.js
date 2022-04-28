/**
 * Purchase new servers and run our hack script on those servers.
 *
 * @param {NS} ns
 */
export async function main(ns) {
	// We want each server to have 16GB of RAM because we will run 2 instances
	// of hack.js on a server, each instance using 3 threads.
	var ram = 16;
	// The ID of a purchased server.
	var i = 0;
	// Our hack script.
	var script = "hack.js";
	// Our hack script is located on our home server.
	var source = "home";
	// How many threads to run our script on a purchased server.
	var nthread = 3;
	// Hack this target.
	var targetA = "n00dles";
	// Hack this other target.
	var targetB = "foodnstuff";

	// Continuously try to purchase a new server until we've reached the maximum
	// number of servers we can buy.
	while (i < ns.getPurchasedServerLimit()) {
		// Do we have enough money (on our home server) to buy a new server?
		if (ns.getServerMoneyAvailable(source) > ns.getPurchasedServerCost(ram)) {
			// If we have enough money, then:
			// (1) purchase a new server;
			var hostname = ns.purchaseServer("pserv-" + i, ram);
			// (2) copy our hack script over to the purchased server;
			await ns.scp(script, source, hostname);
			// (3) run 2 instances of our hack script on the purchased server.
			ns.exec(script, hostname, nthread, targetA);
			ns.exec(script, hostname, nthread, targetB);
			i++;
		}
	}
}
