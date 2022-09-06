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

import { MyArray } from "/lib/array.js";
import { Money } from "/lib/money.js";
import { Player } from "/lib/player.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

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
 * Whether each node in our Hacknet farm is fully upgraded.
 *
 * @param ns The Netscript API.
 * @return true if each node in our Hacknet farm is fully upgraded;
 *     false otherwise.
 */
function is_fully_upgraded(ns) {
    const farm = hacknet_nodes(ns);
    const MAXED_OUT = true;
    const NOT_MAXED_OUT = !MAXED_OUT;
    // These constants are taken from the source file
    // https://github.com/danielyxie/bitburner/blob/dev/src/Hacknet/data/Constants.ts
    const max_core = 16;
    const max_ram = 64;
    // Iterate through each node of our Hacknet farm.
    for (const node of farm) {
        const stat = ns.hacknet.getNodeStats(node);
        if (stat.cores < max_core) {
            return NOT_MAXED_OUT;
        }
        if (stat.level < max_level()) {
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
 * Whether it is time to upgrade the Cores and RAM.  Upgrading either the Cores
 * or RAM is many times more expensive than upgrading the Level of a Hacknet
 * node.  Make sure we upgrade the Cores or RAM sparingly.  That is, the
 * interval between successive upgrades of the Cores or RAM should usually be
 * longer than the corresponding interval for Level.
 *
 * @param ns The Netscript API.
 * @return true if it is time to ugprade the Cores and RAM;
 *     false otherwise.
 */
function is_upgrade_core_ram(ns) {
    // Each time we upgrade the RAM by one unit, we effectively double the
    // current amount of RAM.  Starting from 1GB, upgrading the RAM once would
    // result in 2GB.  Upgrading the RAM another time would result in 4GB.  And
    // so on until we have reached 64GB.  Therefore we can upgrade the RAM 6
    // times.  Divide these 6 upgrades into the 200 Levels, we get the upgrade
    // schedule:
    //
    // (1) 1st upgrade at 30 Level
    // (2) 2nd upgrade at 60 Level
    // (3) 3rd upgrade at 90 Level
    // (4) 4th upgrade at 120 Level
    // (5) 5th upgrade at 150 Level
    // (6) 6th upgrade at 180 Level
    //
    // On the other hand, upgrading the Cores once would add one point to the
    // current number of Cores.  As we have a maximum of 16 Cores and we start
    // with 1 Core, we can upgrade the Cores a total of 15 times.  We follow
    // the same upgrade schedule as per the schedule for upgrading RAM.
    //
    // Whenever it is time to upgrade the Cores and RAM, it might happen that
    // we do not have sufficient funds to finance the upgrades.  In that case,
    // we must skip the upgrade.  It is very likely that the Level of a Hacknet
    // node is at maximum whereas its Cores and RAM are yet to be maxed out.
    // Thus 200 Level is also part of the upgrade schedule for Cores and RAM.
    const IS_TIME = true;
    const NOT_TIME = !IS_TIME;
    // Use the first Hacknet node to help us make a decision that affects the
    // Cores and RAM of all nodes.
    const idx = 0;
    if (node_level(ns, idx) == max_level()) {
        return IS_TIME;
    }
    const interval = 30;
    const remainder = node_level(ns, idx) % interval;
    if (0 == remainder) {
        return IS_TIME;
    }
    return NOT_TIME;
}

/**
 * The maximum Level of a Hacknet node.  This number is taken from the file
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Hacknet/data/Constants.ts
 */
function max_level() {
    return 200;
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
    const time = update_interval();
    while (player.money() < money) {
        await ns.sleep(time);
    }
    // Add more nodes to our farm and fully upgrade each node.
    await setup_farm(ns, nNode);
    while (!is_fully_upgraded(ns)) {
        update(ns, nNode);
        await ns.sleep(time);
    }
}

/**
 * The Level of a Hacknet node.
 *
 * @param ns The Netscript API.
 * @param i The ID of a Hacknet node.  Must be non-negative.
 * @return The Level of the Hacknet node whose ID is i.
 */
function node_level(ns, i) {
    assert(i >= 0);
    return ns.hacknet.getNodeStats(i).level;
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
    const time = update_interval();
    // We already have a farm of n or more Hacknet nodes.
    if (ns.hacknet.numNodes() >= nNode) {
        return;
    }
    // Purchase Hacknet nodes for our farm.
    for (let i = ns.hacknet.numNodes(); i < nNode; i++) {
        // Wait until we have sufficient funds to purchase another Hacknet node.
        while (player.money() < ns.hacknet.getPurchaseNodeCost()) {
            await ns.sleep(time);
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
    const time = update_interval();
    // Bootstrap our farm in case we have zero nodes.
    await setup_farm(ns, nNode);
    // Fully upgrade each node.
    while (!is_fully_upgraded(ns)) {
        update(ns);
        await ns.sleep(time);
    }
}

/**
 * Upgrade the stats of each Hacknet node by one point.  Assume we have
 * at least one node.
 *
 * @param ns The Netscript API.
 */
function update(ns) {
    const farm = hacknet_nodes(ns);
    assert(farm.length > 0);
    upgrade_level(ns, farm);
    // Should we also upgrade the Cores and RAM?
    if (!is_upgrade_core_ram(ns)) {
        return;
    }
    upgrade_core(ns, farm);
    upgrade_ram(ns, farm);
}

/**
 * The interval between successive updates.
 */
function update_interval() {
    const t = new Time();
    return t.minute();
}

/**
 * Upgrade the Core of each Hacknet node in our farm.  Our objective is to
 * upgrade the Core of each node by one point.  Call this function multiple
 * times to max out the number of Cores.
 *
 * @param ns The Netscript API.
 * @param farm An array of IDs of all Hacknet nodes in our farm.
 */
function upgrade_core(ns, farm) {
    assert(farm.length > 0);
    const player = new Player(ns);
    const howmany = 1;  // Upgrade this many Cores at a time.
    // Add another Core to each Hacknet node.
    for (const node of farm) {
        // The number of Cores of a node is at maximum if the cost of upgrading
        // to another Core is Infinity.
        if (isFinite(ns.hacknet.getCoreUpgradeCost(node, howmany))) {
            const cost = ns.hacknet.getCoreUpgradeCost(node, howmany);
            if (player.money() < cost) {
                continue;
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
function upgrade_level(ns, farm) {
    assert(farm.length > 0);
    const player = new Player(ns);
    const level = 1;  // Upgrade this many Levels at a time.
    // Add another Level to each Hacknet node.
    for (const node of farm) {
        // The Level of a node is at maximum if the cost of upgrading
        // to another Level is Infinity.
        if (isFinite(ns.hacknet.getLevelUpgradeCost(node, level))) {
            const cost = ns.hacknet.getLevelUpgradeCost(node, level);
            if (player.money() < cost) {
                continue;
            }
            assert(ns.hacknet.upgradeLevel(node, level));
        }
    }
}

/**
 * Upgrade the RAM of each Hacknet node in our farm.
 *
 * @param ns The Netscript API.
 * @param farm An array of IDs of all Hacknet nodes in our farm.
 */
function upgrade_ram(ns, farm) {
    assert(farm.length > 0);
    const player = new Player(ns);
    const howmany = 1;  // Upgrade the RAM this many times.
    // Double the current RAM of each Hacknet node.
    for (const node of farm) {
        // The amount of RAM of a node is at maximum if the cost of upgrading
        // the RAM is Infinity.
        if (isFinite(ns.hacknet.getRamUpgradeCost(node, howmany))) {
            const cost = ns.hacknet.getRamUpgradeCost(node, howmany);
            if (player.money() < cost) {
                continue;
            }
            assert(ns.hacknet.upgradeRam(node, howmany));
        }
    }
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
    const m = new Money();
    const threshold = [
        10 * m.million(), 100 * m.million(), m.billion(), 100 * m.billion(),
        m.trillion()
    ];
    const node = [6, 12, 24, 30, 33];
    // Bootstrap our farm of Hacknet nodes.
    await stage_one(ns, 3);
    // Add increasingly more nodes to the farm.
    let i = 0;
    const t = new Time();
    const time = 10 * t.minute();
    for (const mon of threshold) {
        await next_stage(ns, node[i], mon);
        i++;
        await ns.sleep(time);
    }
}
