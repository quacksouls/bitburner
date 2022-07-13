/**
 * Hack a server and steal its money.  We weaken the server's security
 * as necessary, grow the server in case the amount of money on the server
 * is below our threshold, and hack the server when all conditions are met.
 *
 * @param ns Command line arguments given to the script at runtime.  We only
 *     want one command line argument, i.e. the name of the server to hack.
 */
export async function main(ns) {
    // The target server, i.e. the server to hack.
    const target = ns.args[0];
    // Ensure we have root access on the target server.
    if (!ns.hasRootAccess(target)) {
        await ns.nuke(target);
    }
    // How much money a server should have before we hack it.  Set the money
    // threshold at 75% of the server's maximum money.  Use the ceiling
    // function to avoid comparison of floating point numbers.
    const money_threshold = Math.ceil(ns.getServerMaxMoney(target) * 0.75);
    // The threshold for the server's security level.  If the target's
    // security level is higher than the threshold, weaken the target
    // before doing anything else.
    const security_threshold = Math.ceil(
        ns.getServerMinSecurityLevel(target) + 5
    );
    // Continously hack/grow/weaken the target server.
    const time = 1;  // One millisecond.
    while (true) {
        if (ns.getServerSecurityLevel(target) > security_threshold) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < money_threshold) {
            await ns.grow(target);
        } else {
            await ns.hack(target);
        }
        await ns.sleep(time);
    }
}
