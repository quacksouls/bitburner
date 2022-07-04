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

import { assert, Player } from "/libbnr.js";
import { MyArray } from "/lib/array.js";
import { Money } from "/lib.money.js";
import { Time } from "/lib/time.js";

/**
 * Whether each node in our Hacknet is fully upgraded.
 */
function is_fully_upgraded(ns) {
    const farm = hacknet_nodes(ns);
    const max_core = 16;
    const max_level = 200;
    const max_ram = 64;
    const MAXED_OUT = true;
    const NOT_MAXED_OUT = !MAXED_OUT;
    // Iterate through each node of our Hacknet farm.
    for (const node of farm) {
        const stat = ns.hacknet.getNodeStats(node);
        if (stat.cores < max_core) {
            return NOT_MAXED_OUT;
        }
        if (stat.level < max_level) {
            return NOT_MAXED_OUT;
        }
        if (stat.ram < max_ram) {
            return NOT_MAXED_OUT;
        }
        // Sanity checks to ensure the node is fully upgraded.
        const howmany = 1;
        assert(!isFinite(ns.hacknet.getCoreUpgradeCost(node, howmany)));
        assert(!isFinite(ns.hacknet.getLevelUpgradeCost(node, howmany)));
        assert(!isFinite(ns.hacknet.getRamUpgradeCost(node, howmany)));
    }
    return MAXED_OUT;
}

/**
 * All nodes in our Hacknet farm.
 *
 * @param ns The Netscript API.
 * @return An array of node IDs.  An empty array if we have zero nodes.
 */
function hacknet_nodes(ns) {
    const nNode = ns.hacknet.numNodes();
    if (nNode < 1) {
        return [];
    }
    const array = new MyArray();
    return array.sequence(nNode);
}

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
    assert(nNode > 0);
    assert(nNode < ns.hacknet.maxNumNodes());
    const player = new Player(ns);
    const time = new Time();
    const t = 10 * time.second();
    // We already have a farm of n or more Hacknet nodes.
    if (ns.hacknet.numNodes() >= nNode) {
        return;
    }
    // Purchase Hacknet nodes for our farm.
    for (let i = ns.hacknet.numNodes(); i < nNode; i++) {
        // Wait until we have sufficient funds to purchase another Hacknet node.
        while (player.money() < ns.hacknet.getPurchaseNodeCost()) {
            await ns.sleep(t);
        }
        // Purchase a new Hacknet node.
        const id = ns.hacknet.purchaseNode();
        assert(-1 != id);
    }
    assert(ns.hacknet.numNodes() == nNode);
}

/**
 * In this stage, we want to have a small number of nodes in our farm.
 * Fully upgrade all nodes.  Assume we call this function when our
 * funds are limited, say at most $1m.
 *
 * @param ns The Netscript API.
 * @param n How many nodes in our Hacknet.  Must be a positive whole number.
 *     At most 3.
 */
async function stage_one(ns, n) {
    const nNode = Math.floor(n);
    assert(nNode > 0);
    assert(nNode <= 3);
    const time = new Time();
    const t = 10 * time.second();
    // Bootstrap our farm in case we have zero nodes.
    await setup_farm(ns, nNode);
    // Fully upgrade each node.
    while (!is_fully_upgraded(ns)) {
        await update(ns);
        await ns.sleep(t);
    }
}

/**
 * Assume we have millions or even billions of dollars.  Add more nodes to
 * our Hacknet farm and fully upgrade each node.
 *
 * @param ns The Netscript API.
 * @param n Increase the number of nodes to this number.  Must be a positive
 *     whole number.
 * @param money The money threshold.  We must have at least this much money
 *     in order to purchase more nodes for the Hacknet farm and fully upgrade
 *     the newly expanded farm.
 */
async function next_stage(ns, n, money) {
    // Sanity checks.
    const nNode = Math.floor(n);
    assert(nNode > 0);
    assert(money > 0);
    // Wait until we have reached the money threshold.
    const player = new Player(ns);
    const time = new Time();
    const t = 10 * time.second();
    while (player.money() < money) {
        await ns.sleep(t);
    }
    // Add more nodes to our farm and fully upgrade each node.
    await setup_farm(ns, nNode);
    while (!is_fully_upgraded(ns)) {
        await update(ns, nNode);
        await ns.sleep(t);
    }
}

/**
 * Upgrade the Core of each Hacknet node in our farm.  Our objective is to
 * upgrade the Core of each node by one point.  Call this function multiple
 * times to max out the number of Cores.
 *
 * @param ns The Netscript API.
 * @param farm An array of IDs of all Hacknet nodes in our farm.
 */
async function upgrade_core(ns, farm) {
    assert(farm.length > 0);
    const player = new Player(ns);
    const howmany = 1;  // Upgrade this many Cores at a time.
    const time = new Time();
    const t = 10 * time.second();
    // Add another Core to each Hacknet Node.
    for (const node of farm) {
        // The number of Cores of a Node is at maximum if the cost of upgrading
        // to another Core is Infinity.
        if (isFinite(ns.hacknet.getCoreUpgradeCost(node, howmany))) {
            // Wait until we have enough money to upgrade to one more Core.
            const cost = ns.hacknet.getCoreUpgradeCost(node, howmany);
            while (player.money() < cost) {
                await ns.sleep(t);
            }
            assert(ns.hacknet.upgradeCore(node, howmany));
        }
    }
}

/**
 * Upgrade the Level of each Hacknet node in our farm.  Our objective is to
 * upgrade the Level of each node by one point.
 *
 * @param ns The Netscript API.
 * @param farm An array of IDs of all Hacknet nodes in our farm.
 */
async function upgrade_level(ns, farm) {
    assert(farm.length > 0);
    const player = new Player(ns);
    const level = 1;  // Upgrade this many Levels at a time.
    const time = new Time();
    const t = 10 * time.second();
    // Add another Level to each Hacknet node.
    for (const node of farm) {
        // The Level of a node is at maximum if the cost of upgrading
        // to another Level is Infinity.
        if (isFinite(ns.hacknet.getLevelUpgradeCost(node, level))) {
            // Wait until we have enough money to upgrade to another Level.
            const cost = ns.hacknet.getLevelUpgradeCost(node, level);
            while (player.money() < cost) {
                await ns.sleep(t);
            }
            assert(ns.hacknet.upgradeLevel(node, level));
        }
    }
}

/**
 * Upgrade the RAM of each Hacknet node in our farm.  Our objective is to add
 * another 1GB of RAM to each node.
 *
 * @param ns The Netscript API.
 * @param farm An array of IDs of all Hacknet nodes in our farm.
 */
async function upgrade_ram(ns, farm) {
    assert(farm.length > 0);
    const player = new Player(ns);
    const howmany = 1;  // Upgrade by 1GB RAM at a time.
    const time = new Time();
    const t = 10 * time.second();
    // Add another 1GB RAM to each Hacknet node.
    for (const node of farm) {
        // The amount of RAM of a node is at maximum if the cost of upgrading
        // to another 1GB RAM is Infinity.
        if (isFinite(ns.hacknet.getRamUpgradeCost(node, howmany))) {
            // Wait until we have enough money to upgrade to another 1GB RAM.
            const cost = ns.hacknet.getRamUpgradeCost(node, howmany);
            while (player.money() < cost) {
                await ns.sleep(t);
            }
            assert(ns.hacknet.upgradeRam(node, howmany));
        }
    }
}

/**
 * Upgrade the stats of each Hacknet node by one point.  Assume we have
 * at least one node.
 *
 * @param ns The Netscript API.
 */
async function update(ns) {
    // Our farm of Hacknet nodes.
    const farm = hacknet_nodes(ns);
    assert(farm.length > 0);
    // Upgrade the Level of each Hacknet node by one point.
    await upgrade_level(ns, farm);
    // Add another Core to each Hacknet node.
    await upgrade_core(ns, farm);
    // Upgrade the RAM of each Hacknet node to another 1GB.
    await upgrade_ram(ns, farm);
}

/**
 * Purchase and manage a farm of Hacknet nodes.
 *
 * Usage: run hnet-farm.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Various money thresholds.
    const money = new Money();
    const threshold = [
        10 * money.million(), 100 * money.million(), money.billion(),
        100 * money.billion(), money.trillion()
    ];
    const node = [6, 12, 24, 30, 33];
    // Bootstrap our farm of Hacknet nodes.
    await stage_one(ns, 3);
    // Add increasingly more nodes to the farm.
    let i = 0;
    const time = new Time();
    const t = 10 * time.minute();
    for (const mon of threshold) {
        await next_stage(ns, node[i], mon);
        i++;
        await ns.sleep(t);
    }
}
