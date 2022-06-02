import { Player } from "./libbnr.js";

/**
 * Delete all purchased servers.  This would also kill all scripts running
 * on each purchased server.
 *
 * Usage: run kill-server.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const player = new Player(ns);
    for (const server of player.pserv()) {
        // Kill all scripts running on a purchased server.
        ns.killall(server);
        // Delete the purchased server.
        ns.deleteServer(server);
    }
}
