/**
 * Copyright (C) 2022 Duck McSouls
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * All nodes in our Hacknet farm.
 *
 * @param ns The Netscript API.
 * @return An array of node IDs.  An empty array if we have zero nodes.
 */
function hacknet_nodes(ns) {
    const n = ns.hacknet.numNodes();
    if (n < 1) {
        return [];
    }
    return [...Array(n).keys()];
}

/**
 * Whether we have enough money to cover the cost of buying something.
 *
 * @param ns The Netscript API.
 * @param cost The cost to purchase or upgrade something.
 * @return True if we have sufficient funds to cover the given cost;
 *     false otherwise.
 */
const has_funds = (ns, cost) => ns.getServerMoneyAvailable("home") > cost;

/**
 * Setup our farm of Hacknet nodes.  We leave each node at Level 1, 1GB RAM,
 * and 1 Core.  Our objective is to setup a farm of n Hacknet nodes, each node
 * at base stat.
 *
 * @param ns The Netscript API.
 * @param n How many Hacknet nodes in our farm.  Must be a positive integer.
 */
async function setup_farm(ns, n) {
    const nNode = Math.floor(n);
    // We already have a farm of n or more Hacknet nodes.
    if (ns.hacknet.numNodes() >= nNode) {
        return;
    }
    // Purchase Hacknet nodes for our farm.
    for (let i = ns.hacknet.numNodes(); i < nNode; i++) {
        const cost = ns.hacknet.getPurchaseNodeCost();
        if (has_funds(ns, cost)) {
            ns.hacknet.purchaseNode();
        }
        await ns.sleep(update_interval());
    }
}

/**
 * The interval between successive updates.
 */
function update_interval() {
    const second = 1e3;
    return 60 * second;
}

/**
 * Upgrade the stats of each Hacknet node by one point.  Assume we have at
 * least one node.
 *
 * @param ns The Netscript API.
 */
async function upgrade(ns) {
    await upgrade_level(ns);
    // Insert code to upgrade the RAM and Cores.
}

/**
 * Upgrade the Level of each Hacknet node in our farm.
 *
 * @param ns The Netscript API.
 */
async function upgrade_level(ns) {
    const howmany = 1; // Upgrade this many Levels at a time.
    for (const node of hacknet_nodes(ns)) {
        // The Level of a node is at maximum if the cost of upgrading to
        // another Level is Infinity.
        const cost = ns.hacknet.getLevelUpgradeCost(node, howmany);
        if (Number.isFinite(cost) && has_funds(ns, cost)) {
            ns.hacknet.upgradeLevel(node, howmany);
        }
        await ns.sleep(update_interval());
    }
}

/**
 * Purchase and manage a farm of Hacknet nodes.
 *
 * Usage: run hnet.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Various money and node thresholds.
    const money = [10e6, 100e6, 1e9, 10e9];
    const node = [6, 12, 18, 24];
    // Bootstrap our Hacknet farm with a small number of nodes.
    const seed_node = 3;
    await setup_farm(ns, seed_node);
    // Add increasingly more nodes to the farm.  Also upgrade the nodes.
    for (;;) {
        if (money.length > 0 && has_funds(ns, money[0])) {
            await setup_farm(ns, node[0]);
            // Ensure our Hacknet farm has at least the given number of
            // nodes before moving on to the next money/node thresholds.
            if (ns.hacknet.numNodes() >= node[0]) {
                money.shift();
                node.shift();
            }
        }
        await upgrade(ns);
        await ns.sleep(update_interval());
    }
}
