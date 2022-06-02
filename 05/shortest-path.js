import { shortest_path } from "./libbnr.js";

/**
 * Determine the shortest path from our home server to a target server.
 * Must provide the target server from the command line.
 *
 * Usage: run shortest-path.js [targetServer]
 * Example: run shortest-path.js run4theh111z
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Must provide a command line argument.
    const error_msg = "Must provide the name of the target server.";
    if (ns.args.length < 1) {
        await ns.tprint(error_msg);
        ns.exit();
    }
    const target = ns.args[0];
    const path = shortest_path(ns, "home", target);
    if (path.length < 1) {
        await ns.tprint("Target server must be reachable from home.");
        ns.exit();
    }
    ns.tprint(path.join(" -> "));
}
