/**
 * Delete all purchased servers.  This would also kill all scripts running
 * on each purchased server.
 *
 * @param {NS} ns
 */
export async function main(ns) {
    for (const server of ns.getPurchasedServers()) {
        // Kill all scripts running on a purchased server.
        ns.killall(server);
        // Delete the purchased server.
        ns.deleteServer(server);
    }
}
