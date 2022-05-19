import { network, Player } from "./libbnr.js";

/**
 * Kill all scripts on world or purchased servers.  Must provide one of the
 * following at the command line:
 * 
 *     * pserv := Kill all scripts on all purchased servers.
 *     * world := Kill all scripts on all world servers where we have root access.
 * 
 * Usage: run kill-script.js [pserv | world]
 * Example: run kill-script.js pserv
 * 
 * @param ns The Netscript API.
 */
export async function main(ns) {
	const error_msg = "Must provide one command line argument: pserv | world";
	// Must provide a command line argument to this script.
	if (ns.args.length < 1) {
		await ns.tprint(error_msg);
		ns.exit();
	}
	const stype = ns.args[0];
	const player = new Player(ns);
	if ("pserv" == stype) {
		// Kill all scripts on purchased servers.
		for (const server of player.pserv()) {
			// Kill all scripts running on a purchased server.
			ns.killall(server);
		}
	} else if ("world" == stype) {
		// Kill all scripts on world servers where we have root access.
		let server = network(ns);
		server = server.filter(s => ns.hasRootAccess(s));
		// Visit each server where we have root access and kill all running scripts.
		for (const s of server) {
			ns.killall(s);
		}
	} else {
		await ns.tprint(error_msg);
		ns.exit();
	}
}
