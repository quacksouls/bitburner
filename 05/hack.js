import { Server } from "./libbnr.js";

/**
 * Hack a server and steal its money.  We weaken the server's security
 * as necessary, grow the server in case the amount of money on the server
 * is below our threshold, and hack the server when all conditions are met.
 * This script accepts the first command line argument given to the script
 * at runtime.  We want one command line argument, i.e. the name of the
 * server we want to hack.
 * 
 * Usage: run hack.js [targetServer]
 * Example: run hack.js n00dles
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
	// The target server, i.e. the server to hack.
	const target = new Server(ns, ns.args[0]);

	// Ensure we have root access to the target server.
	if (!target.has_root_access()) {
		try {
			await target.gain_root_access();
		} catch {
			await ns.tprint("Can't gain root access to server: " + target.hostname());
			ns.exit();
		}
	}

	// How much money a server should have before we hack it.  Even if the server is
	// bankrupt, successfully hacking it would increase our hacking experience points,
	// although we would not receive any money.
	// Set the money threshold at 75% of the server's maximum money.
	const money_threshold = target.money_max() * 0.75;

	// The threshold for the server's security level.  If the target's
	// security level is higher than the threshold, weaken the target
	// before doing anything else.
	const security_threshold = target.security_min() + 5;

	// Continuously hack/grow/weaken the target server.
	while (true) {
		const money_available = target.money_available();
		if (target.security_level() > security_threshold) {
			// If the server's security level is above our threshold, weaken it.
			await target.weaken();
		} else if (money_available < money_threshold) {
			// If the server's money is less than our threshold, grow it.
			await target.grow();
		} else {
			// Otherwise, hack it.
			await target.hack();
		}
	}
}
