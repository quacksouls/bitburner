/**
 * Copyright (C) 2022--2023 Duck McSouls
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

import { MyArray } from "/quack/lib/array.js";
import { bool } from "/quack/lib/constant/bool.js";
import { hnet_t } from "/quack/lib/constant/hacknet.js";
import { money } from "/quack/lib/money.js";
import { has_hacknet_server_api } from "/quack/lib/source.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";
import { assert } from "/quack/lib/util.js";

/**
 * Assume we have millions or even billions of dollars.  Add more nodes to our
 * Hacknet farm.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} n Increase the number of nodes to this amount.  Must be a
 *     positive integer.
 */
async function expand_farm(ns, n) {
    const nNode = Math.floor(n);
    assert(nNode > 0);
    await setup_farm(ns, nNode);
}

/**
 * All nodes in our Hacknet farm.
 *
 * @param {NS} ns The Netscript API.
 * @returns {array<number>} An array of node IDs.  An empty array if we have
 *     zero nodes.
 */
function hacknet_nodes(ns) {
    const n = ns.hacknet.numNodes();
    return n < 1 ? [] : MyArray.sequence(n);
}

/**
 * Whether we have sufficient money to cover a given cost.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} cost Do we have enough funds to cover this cost?
 * @returns {boolean} True if we have funds to cover the given cost;
 *     false otherwise.
 */
function has_funds(ns, cost) {
    assert(cost > 0);
    return money(ns) > cost;
}

/**
 * Whether a node (or Hacknet server) has reached the maximum Level.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} idx The ID of a node (or Hacknet server).
 * @returns {boolean} True if the given node/server has reached its maximum
 *     Level; false otherwise.
 */
function has_max_level(ns, idx) {
    if (has_hacknet_server_api(ns)) {
        return node_level(ns, idx) === hnet_t.server.MAX_LEVEL;
    }
    return node_level(ns, idx) === hnet_t.MAX_LEVEL;
}

/**
 * Whether it is time to upgrade the Cores, RAM, and Cache of a Hacknet node or
 * Hacknet server.  Upgrading the Cores or RAM or Cache is many times more
 * expensive than upgrading the Level.  Make sure we upgrade the Cores, RAM, or
 * Cache sparingly.  That is, the interval between successive upgrades of the
 * Cores, RAM, or Cache should usually be longer than the corresponding interval
 * for Level.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} idx Whether to upgrade the Cores, RAM, or Cache of the
 *     Hacknet node/server having this ID.
 * @returns {boolean} True if it is time to upgrade the Cores, RAM, or Cache;
 *     false otherwise.
 */
function is_upgrade_core_ram_cache(ns, idx) {
    // Each time we upgrade the RAM of a Hacknet node by one unit, we
    // effectively double the current amount of RAM.  Starting from 1GB,
    // upgrading the RAM once would result in 2GB.  Upgrading the RAM another
    // time would result in 4GB.  And so on until we have reached 64GB, the
    // maximum amount of RAM for a Hacknet node.  Therefore we can upgrade the
    // RAM 6 times.  Divide these 6 upgrades into the 200 Level of a node, we
    // get the upgrade schedule:
    //
    // (1) 1st upgrade at 30 Level
    // (2) 2nd upgrade at 60 Level
    // (3) 3rd upgrade at 90 Level
    // (4) 4th upgrade at 120 Level
    // (5) 5th upgrade at 150 Level
    // (6) 6th upgrade at 180 Level
    //
    // Note that a Hacknet server has a maximum of 300 Level and 8,192GB RAM.
    //
    // On the other hand, upgrading the Cores once would add one point to the
    // current number of Cores.  Since a Hacknet node has a maximum of 16 Cores
    // and we start with 1 Core, we can upgrade the Cores a total of 15 times.
    // Follow the same upgrade schedule as per the schedule for upgrading RAM.
    //
    // Whenever it is time to upgrade the Cores and RAM, it might happen that
    // we do not have sufficient funds to finance the upgrades.  In that case,
    // we must skip the upgrade.  It is very likely that the Level of a Hacknet
    // node (or server) is at maximum whereas its Cores and RAM and Cache are
    // yet to be maxed out.  Thus the maximum Level is also part of the upgrade
    // schedule for Cores, RAM, and Cache (for server).
    //
    // If we have access to Hacknet servers, we want a shorter upgrade interval.
    if (has_max_level(ns, idx)) {
        return bool.IS_TIME;
    }
    const interval = has_hacknet_server_api(ns) ? 10 : 30;
    const remainder = node_level(ns, idx) % interval;
    return remainder === 0;
}

/**
 * The money and node/server thresholds.  We use the money threshold to gauge
 * how many nodes/servers we should have at a particular stage.
 *
 * @param {NS} ns The Netscript API.
 * @returns {array<array<number, number>>} An array [money, node] as follows:
 *     (1) money := An array of money thresholds.  Higher money threshold means
 *         we can afford more nodes or servers.
 *     (2) node := An array of node or server thresholds.
 */
function money_node_thresholds(ns) {
    const money_t = Array.from(hnet_t.MONEY);
    let node = Array.from(hnet_t.NODE);
    if (has_hacknet_server_api(ns)) {
        node = Array.from(hnet_t.SERVER);
    }
    return [money_t, node];
}

/**
 * The Level of a Hacknet node or server.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} i The ID of a Hacknet node or server.  Must be non-negative.
 * @returns {number} The Level of the Hacknet node/server whose ID is i.
 */
function node_level(ns, i) {
    assert(i >= 0);
    return ns.hacknet.getNodeStats(i).level;
}

/**
 * Setup our farm of Hacknet nodes/servers.  We leave each node/server at
 * Level 1, 1GB RAM, 1 Core, and Cache Level 1.  Our objective is to setup a
 * farm of n Hacknet nodes/servers, each at base stat.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} n How many Hacknet nodes/servers in our farm.  Must be a
 *     positive integer.
 */
async function setup_farm(ns, n) {
    const nNode = Math.floor(n);
    assert(nNode > 0);
    assert(nNode <= ns.hacknet.maxNumNodes());
    // We already have a farm of n or more Hacknet nodes/servers.
    if (ns.hacknet.numNodes() >= nNode) {
        return;
    }
    // Purchase Hacknet nodes/servers for our farm.
    for (let i = ns.hacknet.numNodes(); i < nNode; i++) {
        if (!has_funds(ns, ns.hacknet.getPurchaseNodeCost())) {
            await ns.sleep(update_interval());
            continue;
        }
        const id = ns.hacknet.purchaseNode();
        assert(id !== -1);
        const s = has_hacknet_server_api(ns) ? "server" : "node";
        log(ns, `Purchased Hacknet ${s}: ${id}`);
    }
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
}

/**
 * The interval between successive updates.
 *
 * @returns {number} The waiting interval in milliseconds.
 */
function update_interval() {
    return wait_t.MINUTE;
}

/**
 * Upgrade the stats of each Hacknet node/server by one point.  Assume we have
 * at least one node/server.
 *
 * @param {NS} ns The Netscript API.
 */
function upgrade(ns) {
    upgrade_level(ns);
    // Should we also upgrade the Cores, RAM, and Cache?
    hacknet_nodes(ns)
        .filter((node) => is_upgrade_core_ram_cache(ns, node))
        .forEach((node) => {
            upgrade_core(ns, node);
            upgrade_ram(ns, node);
            upgrade_cache(ns, node);
        });
}

/**
 * Upgrade the Cache of a Hacknet server in our farm by one point.  Call this
 * function multiple times to max out the Cache level of a server.  This
 * function is applicable only to Hacknet servers.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} idx Upgrade the Cache of the Hacknet server having this ID.
 */
function upgrade_cache(ns, idx) {
    if (!has_hacknet_server_api(ns)) {
        return;
    }
    const farm = new Set(hacknet_nodes(ns));
    assert(farm.has(idx));
    // Add another Cache level to the Hacknet server.  The Cache level of a
    // server is at maximum if the cost of upgrading to the next Cache level is
    // Infinity.
    const howmany = 1; // Upgrade the Cache level this many times.
    const cost = ns.hacknet.getCacheUpgradeCost(idx, howmany);
    if (Number.isFinite(cost) && has_funds(ns, cost)) {
        assert(ns.hacknet.upgradeCache(idx, howmany));
    }
}

/**
 * Upgrade the Cores of a Hacknet node/server in our farm by one point.  Call
 * this function multiple times to max out the number of Cores.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} idx Upgrade the Cores of the Hacknet node/server having this
 *     ID.
 */
function upgrade_core(ns, idx) {
    const farm = new Set(hacknet_nodes(ns));
    assert(farm.has(idx));
    // Add another Core to the Hacknet node/server.  The number of Cores of a
    // node/server is at maximum if the cost of upgrading to another Core is
    // Infinity.
    const howmany = 1; // Upgrade this many Cores at a time.
    const cost = ns.hacknet.getCoreUpgradeCost(idx, howmany);
    if (Number.isFinite(cost) && has_funds(ns, cost)) {
        assert(ns.hacknet.upgradeCore(idx, howmany));
    }
}

/**
 * Upgrade the Level of each Hacknet node/server in our farm by one point.
 *
 * @param {NS} ns The Netscript API.
 */
function upgrade_level(ns) {
    const howmany = 1; // Upgrade this many Levels at a time.
    hacknet_nodes(ns).forEach((node) => {
        // The Level of a node/server is at maximum if the cost of upgrading to
        // another Level is Infinity.
        const cost = ns.hacknet.getLevelUpgradeCost(node, howmany);
        if (Number.isFinite(cost) && has_funds(ns, cost)) {
            assert(ns.hacknet.upgradeLevel(node, howmany));
        }
    });
}

/**
 * Upgrade the RAM of a Hacknet node/server in our farm.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} idx Upgrade the RAM of the Hacknet node/server having this
 *     ID.
 */
function upgrade_ram(ns, idx) {
    const farm = new Set(hacknet_nodes(ns));
    assert(farm.has(idx));
    // The amount of RAM of a node/server is at maximum if the cost of upgrading
    // the RAM is Infinity.
    const howmany = 1; // Upgrade the RAM this many times.
    const cost = ns.hacknet.getRamUpgradeCost(idx, howmany);
    if (Number.isFinite(cost) && has_funds(ns, cost)) {
        assert(ns.hacknet.upgradeRam(idx, howmany));
    }
}

/**
 * Purchase and manage a farm of Hacknet nodes or Hacknet servers.
 *
 * Usage: run quack/hnet.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    await setup_farm(ns, hnet_t.SEED_NODE);
    // Occassionally expand and upgrade the nodes/servers.
    const [money_t, node] = money_node_thresholds(ns);
    for (;;) {
        if (!MyArray.is_empty(money_t) && has_funds(ns, money_t[0])) {
            await expand_farm(ns, node[0]);
            // Ensure our Hacknet farm has at least the given number of
            // nodes/servers before moving on to the next money/node thresholds.
            if (ns.hacknet.numNodes() >= node[0]) {
                money_t.shift();
                node.shift();
            }
        }
        upgrade(ns);
        await ns.sleep(update_interval());
    }
}
