/**
 * Purchase new servers and run our hack script on those servers.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // We want each server to have 16GB of RAM because we will run 2 instances
    // of hack.js on a server, each instance using 3 threads.
    const ram = 16;
    // Our hack script.
    const script = "hack.js";
    // Our hack script is located on our home server.
    const source = "home";
    // How many threads to run our script on a purchased server.
    const nthread = 3;
    // Hack this target.
    const targetA = "n00dles";
    // Hack this other target.
    const targetB = "foodnstuff";
    // Continuously try to purchase a new server until we've reached the
    // maximum number of servers we can buy.
    let i = 0;
    while (i < ns.getPurchasedServerLimit()) {
        // Do we have enough money (on our home server) to buy a new server?
        if (
            ns.getServerMoneyAvailable(source) > ns.getPurchasedServerCost(ram)
        ) {
            // If we have enough money, then:
            // (1) purchase a new server;
            const hostname = ns.purchaseServer("pserv", ram);
            // (2) copy our hack script over to the purchased server;
            await ns.scp(script, source, hostname);
            // (3) run 2 instances of our hack script on the purchased server.
            ns.exec(script, hostname, nthread, targetA);
            ns.exec(script, hostname, nthread, targetB);
            i++;
        }
        // Sleep for 3 seconds.
        await ns.sleep(3000);
    }
}
