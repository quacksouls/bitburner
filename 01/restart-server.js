/**
 * Restart all scripts on a purchased server.  This is useful in the case where
 * all scripts running on a purchased server have been killed.  We start running
 * those scripts again.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Our hack script.
    var script = "hack.js";
    // How many threads to run our script on a purchased server.
    var nthread = 3;
    // Hack this target.
    var targetA = "n00dles";
    // Hack this other target.
    var targetB = "foodnstuff";
    // Cycle through our purchased servers to see whether to restart our
    // hack.js script.
    for (const server of ns.getPurchasedServers()) {
        if (!ns.isRunning(script, server, targetA)) {
            ns.exec(script, server, nthread, targetA);
        }
        if (!ns.isRunning(script, server, targetB)) {
            ns.exec(script, server, nthread, targetB);
        }
    }
}
