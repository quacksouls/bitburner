import { assert, Server } from "./libbnr.js";

/**
 * Hack a server and steal its money.  We weaken the server's security
 * as necessary, grow the server in case the amount of money on the server
 * is below our threshold, and hack the server when all conditions are met.
 * 
 * Usage: run hack.js [targetServer]
 *
 * @param ns Command line arguments given to the script at run time.  We only
 *     want one command line argument, i.e. the name of the server we want to hack.
 */
export async function main(ns) {
	// The target server, i.e. the server to hack.
	const target = new Server(ns, ns.args[0]);

	// Ensure we have root access on the target server.
	if (!target.has_root_access()) {
		try {
			await target.gain_root_access();
		} catch {
			await ns.tprint("Can't gain root access to server: " + target.hostname());
			ns.exit();
		}
	}

	// How much money a server should have before we hack it.  Assume the target is
	// not bankrupt.  Set the money threshold at 75% of the server's maximum money.
	assert(!target.is_bankrupt());
	const money_threshold = target.money_max() * 0.75;
	assert(money_threshold > 0);

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
