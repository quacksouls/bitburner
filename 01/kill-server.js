/**
 * Delete all purchased servers.  This would also kill all scripts running
 * on each purchased server.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    for (const server of ns.getPurchasedServers()) {
        ns.killall(server);
        ns.deleteServer(server);
    }
}
