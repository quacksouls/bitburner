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

import { home, trade_bot_stop } from "/lib/constant.js";
import { Server } from "/lib/server.js";
import { choose_hardware_company } from "/lib/singularity.util.js";
import { work } from "/lib/singularity.work.js";
import { assert } from "/lib/util.js";

/**
 * Determine which to upgrade on the home server: Cores or RAM.
 *
 * @param ns The Netscript API.
 * @return A string having exactly one of the following values.
 *     (1) "Cores" := Upgrade the Cores on the home server.
 *     (2) "RAM" := Upgrade the RAM on the home server.
 *     (3) "" := The empty string, meaning do not upgrade anything on the home
 *         server.
 */
function choose_upgrade(ns) {
    // Do not upgrade anything.
    if (is_at_limits(ns)) {
        return "";
    }
    // Upgrade the Cores.
    const server = new Server(ns, home);
    const core_cost = Math.ceil(ns.singularity.getUpgradeHomeCoresCost());
    const ram_cost = Math.ceil(ns.singularity.getUpgradeHomeRamCost());
    if (core_cost < ram_cost) {
        if (server.cores() < core_limit()) {
            return "Cores";
        }
    }
    // Upgrade the RAM.
    assert((ram_cost <= core_cost) || (server.cores() == core_limit()));
    assert(server.ram_max() < ram_limit());
    return "RAM";
}

/**
 * The maximum number of Cores on the home server.  This is not necessarily the
 * greatest number of Cores the home server can have.
 */
function core_limit() {
    const limit = 4;
    return limit;
}

/**
 * Whether the Cores and RAM on the home server are at the artificial limits.
 * Even though the Cores or RAM, or both, are at maximum, this does not
 * necessarily mean we cannot purchase more Cores or RAM for the home server.
 *
 * @param ns The Netscript API.
 * @return true if both Cores and RAM are at maximum; false otherwise.
 */
function is_at_limits(ns) {
    const server = new Server(ns, home);
    if (
        (server.cores() >= core_limit())
            && (server.ram_max() >= ram_limit())
    ) {
        return true;
    }
    return false;
}

/**
 * The maximum amount of RAM on the home server.  This is not necessarily the
 * largest amount of RAM the home server can have.
 */
function ram_limit() {
    const limit = 262144;
    return limit;
}

/**
 * Tell the trade bot to resume its transactions.  It can now buy and sell
 * shares of stocks.
 *
 * @param ns The Netscript API.
 */
function trade_bot_resume(ns) {
    if (ns.fileExists(trade_bot_stop, home)) {
        ns.rm(trade_bot_stop, home);
    }
}

/**
 * Tell the trade bot to stop buying shares of stocks.  We do not want to spend
 * any more money on buying shares.  However, the trade bot can sell shares.
 * The idea is to cash in on the shares we have.
 *
 * @param ns The Netscript API.
 */
async function trade_bot_stop_buy(ns) {
    const fname = trade_bot_stop;
    const data = "Trade bot stop buy.";
    const write_mode = "w";
    await ns.write(fname, data, write_mode);
}

/**
 * Upgrade the Cores or RAM on the home server.
 *
 * @param ns The Netscript API.
 */
async function upgrade(ns) {
    // Relocate to increase Intelligence XP.
    const shop = await choose_hardware_company(ns);
    ns.singularity.goToLocation(shop);
    // Suppose our home server already has the greatest number of Cores and
    // RAM.  This does not necessarily mean we cannot purchase any more Cores
    // or RAM for the server.  We place artificial limits on the Cores and RAM
    // to avoid having to wait too long to accumulate sufficient funds.
    // Initially, we are willing to wait to upgrade the Cores or RAM up to and
    // including the given limits.  After the limits on Cores and RAM are
    // reached, we do not want to wait to accumulate money for upgrading Cores
    // or RAM.  We simply upgrade if our current funds allow.
    if (is_at_limits(ns)) {
        ns.singularity.upgradeHomeCores();
        ns.singularity.upgradeHomeRam();
        return;
    }
    // Wait to accumulate funds to purchase upgrades.
    const attribute = choose_upgrade(ns);
    assert("" != attribute);
    if ("Cores" == attribute) {
        await upgrade_cores(ns);
        return;
    }
    assert("RAM" == attribute);
    await upgrade_ram(ns);
}

/**
 * Upgrade the Cores on the home server.
 *
 * @param ns The Netscript API.
 */
async function upgrade_cores(ns) {
    const core_cost = ns.singularity.getUpgradeHomeCoresCost();
    let success = ns.singularity.upgradeHomeCores();
    while (!success) {
        await work(ns, core_cost);
        success = ns.singularity.upgradeHomeCores();
    }
}

/**
 * Upgrade the RAM on the home server.
 *
 * @param ns The Netscript API.
 */
async function upgrade_ram(ns) {
    const ram_cost = ns.singularity.getUpgradeHomeRamCost();
    let success = ns.singularity.upgradeHomeRam();
    while (!success) {
        await work(ns, ram_cost);
        success = ns.singularity.upgradeHomeRam();
    }
}

/**
 * Upgrade the Cores and RAM on our home server.
 *
 * Usage: run singularity/home.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Less verbose log.
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    ns.disableLog("singularity.applyToCompany");
    ns.disableLog("singularity.workForCompany");

    await trade_bot_stop_buy(ns);
    await upgrade(ns);
    trade_bot_resume(ns);
    // The next script in the load chain.
    const script = "/singularity/install.js";
    const nthread = 1;
    ns.exec(script, home, nthread);
}
