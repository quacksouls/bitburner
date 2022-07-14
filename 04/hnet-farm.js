/**
 * A function for assertion.
 *
 * @param cond Assert that this condition is true.
 * @return Throw an assertion error if the given condition is false.
 */
function assert(cond) {
    if (!cond) {
        throw new Error("Assertion failed.");
    }
}

/**
 * Setup our farm of Hacknet Nodes.  We leave each Node at Level 1, 1GB RAM,
 * and 1 Core.  Our objective is to setup a farm of n Hacknet Nodes, each Node
 * at base stat.
 *
 * @param ns The Netscript API.
 * @param n How many Hacknet Nodes in our farm.  Must be a positive integer.
 * @return An array of IDs of all Hacknet Nodes in our farm.
 */
async function setup_farm(ns, n) {
    const nNode = Math.floor(n);
    assert(nNode > 0);
    assert(nNode < ns.hacknet.maxNumNodes());
    const home = "home";
    const time = 10000;  // 10 seconds
    // If we already have a farm of n Hacknet Nodes, return the IDs of the
    // Nodes.
    if (ns.hacknet.numNodes() == nNode) {
        return [...Array(nNode).keys()];
    }
    // Purchase Hacknet Nodes for our farm.
    for (let i = ns.hacknet.numNodes(); i < nNode; i++) {
        // Wait until we have sufficient fund to purchase another Hacknet Node.
        const money = ns.getServerMoneyAvailable(home);
        const cost = ns.hacknet.getPurchaseNodeCost();
        while (money < cost) {
            await ns.sleep(time);
        }
        // Purchase a new Hacknet Node.
        const id = ns.hacknet.purchaseNode();
        assert(-1 != id);
    }
    assert(ns.hacknet.numNodes() == nNode);
    return [...Array(nNode).keys()];
}

/**
 * Upgrade the Core of each Hacknet Node in our farm.  Our objective is to max
 * out the number of Cores of each Hacknet Node.
 *
 * @param ns The Netscript API.
 * @param farm The set of IDs of all Hacknet Nodes in our farm.
 */
async function upgrade_core(ns, farm) {
    const home = "home";
    const howmany = 1;   // Upgrade this many Cores at a time.
    const time = 10000;  // 10 seconds
    // Max out the number of Cores of a Hacknet Node.  Then wait and see
    // whether we can max out the number of Cores of another Node.
    for (const node of farm) {
        // We know that the number of Cores of a Node is at maximum if the cost
        // of upgrading to another Core is Infinity.
        while (isFinite(ns.hacknet.getCoreUpgradeCost(node, howmany))) {
            // Wait until we have enough money to upgrade a Node to another
            // Core.
            const money = ns.getServerMoneyAvailable(home);
            const cost = ns.hacknet.getCoreUpgradeCost(node, howmany);
            while (money < cost) {
                await ns.sleep(time);
            }
            assert(ns.hacknet.upgradeCore(node, howmany));
        }
    }
}

/**
 * Upgrade the Level of each Hacknet Node in our farm.  Our objective is to max
 * out the Level of each Hacknet Node.
 *
 * @param ns The Netscript API.
 * @param farm The set of IDs of all Hacknet Nodes in our farm.
 */
async function upgrade_level(ns, farm) {
    const home = "home";
    const level = 1;     // Upgrade this many Levels at a time.
    const time = 10000;  // 10 seconds
    // Max out the Level of a Hacknet Node.  Then wait and see whether we can
    // max out the Level of another Node.
    for (const node of farm) {
        // We know that the Level of a Node is at maximum if the cost of
        // upgrading to another Level is Infinity.
        while (isFinite(ns.hacknet.getLevelUpgradeCost(node, level))) {
            // Wait until we have enough money to upgrade a Node to another
            // Level.
            const money = ns.getServerMoneyAvailable(home);
            const cost = ns.hacknet.getLevelUpgradeCost(node, level);
            while (money < cost) {
                await ns.sleep(time);
            }
            assert(ns.hacknet.upgradeLevel(node, level));
        }
    }
}

/**
 * Upgrade the RAM of each Hacknet Node in our farm.  Our objective is to max
 * out the amount of RAM of each Hacknet Node.
 *
 * @param ns The Netscript API.
 * @param farm The set of IDs of all Hacknet Nodes in our farm.
 */
async function upgrade_ram(ns, farm) {
    const home = "home";
    const howmany = 1;   // Upgrade by 1GB RAM at a time.
    const time = 10000;  // 10 seconds
    // Max out the amount of RAM of a Hacknet Node.  Then wait and see whether
    // we can max out the amount of RAM of another Node.
    for (const node of farm) {
        // We know that the amount of RAM of a Node is at maximum if the cost
        // of upgrading to another 1GB RAM is Infinity.
        while (isFinite(ns.hacknet.getRamUpgradeCost(node, howmany))) {
            // Wait until we have enough money to upgrade a Node to another
            // 1GB RAM.
            const money = ns.getServerMoneyAvailable(home);
            const cost = ns.hacknet.getRamUpgradeCost(node, howmany);
            while (money < cost) {
                await ns.sleep(time);
            }
            assert(ns.hacknet.upgradeRam(node, howmany));
        }
    }
}

/**
 * Purchase Hacknet Nodes and manage our farm of Nodes.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Setup our farm of Hacknet Nodes.  Each Node should be at base stats for
    // now.
    const nNode = 12;
    const farm = await setup_farm(ns, nNode);
    // Upgrade the Level of each Hacknet Node to maximum.
    await upgrade_level(ns, farm);
    // Upgrade the Cores of each Hacknet Node to maximum.
    await upgrade_core(ns, farm);
    // Max out the amount of RAM of each Hacknet Node.
    await upgrade_ram(ns, farm);
}
