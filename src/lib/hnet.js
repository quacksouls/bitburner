/**
 * Copyright (C) 2023 Duck McSouls
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

/// ///////////////////////////////////////////////////////////////////////
// Miscellaneous helper functions for Hacknet
/// ///////////////////////////////////////////////////////////////////////

import { hnet_t } from "/quack/lib/constant/hacknet.js";
import { io } from "/quack/lib/constant/io.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { money } from "/quack/lib/money.js";

/**
 * Spend all hashes we have.
 *
 * @param {NS} ns The Netscript API.
 */
export function hacknet_liquidate(ns) {
    const fname = hnet_t.LIQUIDATE;
    const data = "Spend all hashes.";
    ns.write(fname, data, io.WRITE);
}

/**
 * Setup and upgrade a Hacknet farm to satisfy various requirements for
 * receiving an invitation from Netburners.  The specific requirements for our
 * Hacknet farm are:
 *
 * (1) A total Hacknet Level of 100.  This means that all of our Hacknet nodes
 *     (or servers) have a collective Level of 100.
 * (2) A total Hacknet RAM of 8GB.  All of our Hacknet nodes/servers have a
 *     collective RAM of 8GB.
 * (3) A total Hacknet Cores of 4.  All of our Hacknet nodes/servers
 *     collectively have at least 4 Cores.
 *
 * @param {NS} ns The Netscript API.
 */
export async function satisfy_netburners_requirements(ns) {
    // Purchase one Hacknet node/server.
    let node = ns.hacknet.purchaseNode();
    while (node === hnet_t.INVALID_NODE) {
        while (money(ns) < ns.hacknet.getPurchaseNodeCost()) {
            await ns.sleep(wait_t.DEFAULT);
        }
        node = ns.hacknet.purchaseNode();
        await ns.sleep(wait_t.SECOND);
    }

    // Upgrade to at least Level 100.
    const extra_lvl = 99;
    let success = ns.hacknet.upgradeLevel(node, extra_lvl);
    while (!success) {
        while (money(ns) < ns.hacknet.getLevelUpgradeCost(node, extra_lvl)) {
            await ns.sleep(wait_t.DEFAULT);
        }
        success = ns.hacknet.upgradeLevel(node, extra_lvl);
        await ns.sleep(wait_t.SECOND);
    }

    // Upgrade to at least 8GB RAM.
    const nupgrade = 3;
    success = ns.hacknet.upgradeRam(node, nupgrade);
    while (!success) {
        while (money(ns) < ns.hacknet.getRamUpgradeCost(node, nupgrade)) {
            await ns.sleep(wait_t.DEFAULT);
        }
        success = ns.hacknet.upgradeRam(node, nupgrade);
        await ns.sleep(wait_t.SECOND);
    }

    // Upgrade to at least 4 Cores.
    const extra_core = 3;
    success = ns.hacknet.upgradeCore(node, extra_core);
    while (!success) {
        while (money(ns) < ns.hacknet.getCoreUpgradeCost(node, extra_core)) {
            await ns.sleep(wait_t.DEFAULT);
        }
        success = ns.hacknet.upgradeCore(node, extra_core);
        await ns.sleep(wait_t.SECOND);
    }
}
