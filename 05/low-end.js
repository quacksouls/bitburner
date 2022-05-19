import { assert, filter_bankrupt_servers, filter_pserv, network, Player, Server } from "./libbnr.js";

/**
 * Choose servers in the game world that are low-end.  A server is low-end if
 * it does not have enough RAM to run our hack script even using one thread.
 * We exclude these servers:
 * 
 *     * Purchased servers.
 *     * Those servers in the game world that are bankrupt.
 *     * A world server whose hacking skill requirement is higher than
 *       our Hack stat.
 *
 * @param ns The Netscript API.
 * @return An array of low-end servers.
 */
function low_end_servers(ns) {
	let server = filter_bankrupt_servers(ns, filter_pserv(ns, network(ns)));
	let lowend = new Array();
	const player = new Player(ns);
	for (const s of server) {
		if (skip_server(ns, s)) {
			continue;
		}
		const serv = new Server(ns, s);
		const nthread = serv.num_threads(player.script());
		if (nthread < 1) {
			lowend.push(s);
		}
	}
	return lowend;
}

/**
 * Whether to skip a server.  A server is skipped if it is not a low-end server.
 * 
 * @param ns The Netscript API.
 * @param server Do we skip this server?
 * @return true if the given server should be skipped; false otherwise.
 */
function skip_server(ns, server) {
	const SKIP = true;
	const NO_SKIP = !SKIP;
	const player = new Player(ns);
	const serv = new Server(ns, server);

	// Skip a server if its hacking skill requirement is higher
	// than our Hack stat.
	if (player.hacking_skill() < serv.hacking_skill()) {
		return SKIP;
	}
	// Skip a server if it is running our hack script.
	if (serv.is_running_script(player.script())) {
		return SKIP;
	}
	// Skip a server if we cannot open all of its ports.
	if (player.num_ports() < serv.num_ports_required()) {
		return SKIP;
	}
	return NO_SKIP;
}

/**
 * Hack various low-end servers found in the game world, excluding purchased servers.
 * A world server is said to be low-end if it does not have enough RAM to run our
 * hack script on the server.  We use our home server to hack low-end servers.
 * The script accepts the number of threads to use to hack a low-end server.
 * 
 * Usage: run low-end.js [numThread]
 * Example: run low-end.js 4
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
	const nthread = Math.floor(ns.args[0]);
	assert(nthread > 0);

	const target = low_end_servers(ns);
	if (target.length < 1) {
		ns.exit();
	}
	const player = new Player(ns);
	for (const server of target) {
		ns.exec(player.script(), player.home(), nthread, server);
	}
}
