import { assert, choose_best_server, choose_targets, copy_and_run, filter_bankrupt_servers, network, Player, Server } from "./libbnr.js";

/**
 * Restart all scripts on a purchased server.  This is useful in the case where
 * all scripts running on a purchased server have been killed.  We start running
 * those scripts again.  This script chooses the "best" servers to hack.
 * 
 * Usage: run restart-server.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
	// Cycle through our purchased servers to see whether to restart our
	// hack script.
	const player = new Player(ns);
	let target = new Array();
	for (const s of player.pserv()) {
		// Determine the target servers to hack.  There are always at least 2 targets because
		// at least 2 servers in the game world require only 1 Hack stat and zero opened ports.
		// Assume that each target has money available.
		if (target.length < 1) {
			target = filter_bankrupt_servers(ns, choose_targets(ns, network(ns)));
			assert(target.length > 0);
		}
		const server = new Server(ns, s);
		if (!server.is_running_script(player.script())) {
			// Choose the best target server that has money available.
			const t = choose_best_server(ns, target);
			target = target.filter(s => s != t);
			// Restart the hack script and run it against a target.
			assert(await copy_and_run(ns, server.hostname(), t));
		}
	}
}
