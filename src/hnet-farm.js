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
import { bool } from "/lib/constant/bool.js";
import { hnet_t } from "/lib/constant/hacknet.js";
import { wait_t } from "/lib/constant/time.js";
import { log } from "/lib/io.js";
import { Player } from "/lib/player.js";
import { assert } from "/lib/util.js";

/**
 * Assume we have millions or even billions of dollars.  Add more nodes to our
 * Hacknet farm.
 *
 * @param ns The Netscript API.
 * @param n Increase the number of nodes to this amount.  Must be a positive
 *     integer.
 */
async function expand_farm(ns, n) {
    const nNode = Math.floor(n);
    assert(nNode > 0);
    await setup_farm(ns, nNode);
}

/**
 * All nodes in our Hacknet farm.
 *
 * @param ns The Netscript API.
 * @return An array of node IDs.  An empty array if we have zero nodes.
 */
function hacknet_nodes(ns) {
    const n = ns.hacknet.numNodes();
    return n < 1 ? [] : MyArray.sequence(n);
}

/**
 * Whether it is time to upgrade the Cores and RAM of a Hacknet node.
 * Upgrading either the Cores or RAM is many times more expensive than
 * upgrading the Level of a Hacknet node.  Make sure we upgrade the Cores or
 * RAM sparingly.  That is, the interval between successive upgrades of the
 * Cores or RAM should usually be longer than the corresponding interval for
 * Level.
 *
 * @param ns The Netscript API.
 * @param idx Whether to upgrade the Cores and RAM of the Hacknet node having
 *     this ID.
 * @return True if it is time to upgrade the Cores and RAM; false otherwise.
 */
function is_upgrade_core_ram(ns, idx) {
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
    if (node_level(ns, idx) === hnet_t.MAX_LEVEL) {
        return bool.IS_TIME;
    }
    const interval = 30;
    const remainder = node_level(ns, idx) % interval;
    return remainder === 0;
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
        if (player.money() < ns.hacknet.getPurchaseNodeCost()) {
            await ns.sleep(time);
            continue;
        }
        const id = ns.hacknet.purchaseNode();
        assert(id !== -1);
        log(ns, `Purchased Hacknet node: ${id}`);
    }
}

/**
 * The interval between successive updates.
 */
function update_interval() {
    return wait_t.MINUTE;
}

/**
 * Upgrade the stats of each Hacknet node by one point.  Assume we have at
 * least one node.
 *
 * @param ns The Netscript API.
 */
function upgrade(ns) {
    upgrade_level(ns);
    // Should we also upgrade the Cores and RAM?
    const farm = hacknet_nodes(ns);
    assert(farm.length > 0);
    for (const node of farm) {
        if (is_upgrade_core_ram(ns, node)) {
            upgrade_core(ns, node);
            upgrade_ram(ns, node);
        }
    }
}

/**
 * Upgrade the Cores of a Hacknet node in our farm.  Our objective is to
 * upgrade the Cores of the node by one point.  Call this function multiple
 * times to max out the number of Cores.
 *
 * @param ns The Netscript API.
 * @param idx We want to upgrade the Cores of the Hacknet node having this ID.
 */
function upgrade_core(ns, idx) {
    const farm = new Set(hacknet_nodes(ns));
    assert(farm.has(idx));
    // Add another Core to the Hacknet node.  The number of Cores of a node is
    // at maximum if the cost of upgrading to another Core is Infinity.
    const player = new Player(ns);
    const howmany = 1; // Upgrade this many Cores at a time.
    const cost = ns.hacknet.getCoreUpgradeCost(idx, howmany);
    if (Number.isFinite(cost)) {
        if (player.money() < cost) {
            return;
        }
        assert(ns.hacknet.upgradeCore(idx, howmany));
    }
}

/**
 * Upgrade the Level of each Hacknet node in our farm.  Our objective is to
 * upgrade the Level of each node by one point.
 *
 * @param ns The Netscript API.
 */
function upgrade_level(ns) {
    const farm = hacknet_nodes(ns);
    assert(farm.length > 0);
    const player = new Player(ns);
    const level = 1; // Upgrade this many Levels at a time.
    // Add another Level to each Hacknet node.
    for (const node of farm) {
        // The Level of a node is at maximum if the cost of upgrading to
        // another Level is Infinity.
        const cost = ns.hacknet.getLevelUpgradeCost(node, level);
        if (Number.isFinite(cost)) {
            if (player.money() < cost) {
                continue;
            }
            assert(ns.hacknet.upgradeLevel(node, level));
        }
    }
}

/**
 * Upgrade the RAM of a Hacknet node in our farm.
 *
 * @param ns The Netscript API.
 * @param idx We want to upgrade the RAM of the Hacknet node having this ID.
 */
function upgrade_ram(ns, idx) {
    const farm = new Set(hacknet_nodes(ns));
    assert(farm.has(idx));
    // Double the current RAM of the given Hacknet node.  The amount of RAM of
    // a node is at maximum if the cost of upgrading the RAM is Infinity.
    const player = new Player(ns);
    const howmany = 1; // Upgrade the RAM this many times.
    const cost = ns.hacknet.getRamUpgradeCost(idx, howmany);
    if (Number.isFinite(cost)) {
        if (player.money() < cost) {
            return;
        }
        assert(ns.hacknet.upgradeRam(idx, howmany));
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
    const threshold = Array.from(hnet_t.MONEY);
    const node = Array.from(hnet_t.NODE);
    // Bootstrap our Hacknet farm with a small number of nodes.
    await setup_farm(ns, hnet_t.SEED_NODE);
    // Add increasingly more nodes to the farm.  Also upgrade the nodes.
    const time = update_interval();
    const player = new Player(ns);
    for (;;) {
        if (threshold.length > 0) {
            if (player.money() > threshold[0]) {
                await expand_farm(ns, node[0]);
                // Ensure our Hacknet farm has at least the given number of
                // nodes before moving on to the next money/node thresholds.
                if (ns.hacknet.numNodes() >= node[0]) {
                    threshold.shift();
                    node.shift();
                }
            }
        }
        upgrade(ns);
        await ns.sleep(time);
    }
}
