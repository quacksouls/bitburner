/**
 * Hack a server and steal its money.  We weaken the server's security
 * as necessary, grow the server in case the amount of money on the server
 * is below our threshold, and hack the server when all conditions are met.
 * Code adapted from the tutorial at
 * https://bitburner.readthedocs.io/en/latest/guidesandtips/gettingstartedguideforbeginnerprogrammers.html
 *
 * @param ns Command line arguments given to the script at run time.  We only
 *     want one command line argument, i.e. the name of the server we want to hack.
 */
export async function main(ns) {
    // The target server, i.e. the server to hack.
    const target = ns.args[0];
    // Ensure we have root access on the target server.  We assume we have
    // access to servers that require up to 2 ports to be open.
    if (!ns.hasRootAccess(target)) {
        await ns.brutessh(target);
        await ns.ftpcrack(target);
        await ns.nuke(target);
    }
    // How much money a server should have before we hack it.
    // Set the money threshold at 75% of the server's maximum money.
    const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
    // The threshold for the server's security level.  If the target's
    // security level is higher than the threshold, weaken the target
    // before doing anything else.
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;
    // Infinite loop that continously hacks/grows/weakens the target server.
    while (true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            // If the server's security level is above our threshold, weaken it.
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            // If the server's money is less than our threshold, grow it.
            await ns.grow(target);
        } else {
            // Otherwise, hack it.
            await ns.hack(target);
        }
    }
}
