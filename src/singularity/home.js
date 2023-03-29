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

import { home, home_t } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { wse } from "/quack/lib/constant/wse.js";
import { hacknet_liquidate } from "/quack/lib/hnet.js";
import { log } from "/quack/lib/io.js";
import { Server } from "/quack/lib/server.js";
import { choose_hardware_company } from "/quack/lib/singularity/util.js";
import { exec, to_second } from "/quack/lib/util.js";
import { trade_bot_resume, trade_bot_stop_buy } from "/quack/lib/wse.js";

/**
 * Whether the RAM on the home server is at the artificial limit.  Even though
 * the RAM is at maximum, this does not necessarily mean we cannot purchase more
 * RAM for the home server.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if the RAM is at maximum; false otherwise.
 */
function is_at_limit(ns) {
    const server = new Server(ns, home);
    return server.ram_max() >= home_t.RAM;
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    ns.disableLog("singularity.applyToCompany");
    ns.disableLog("singularity.workForCompany");
}

/**
 * Upgrade the RAM on the home server.
 *
 * @param {NS} ns The Netscript API.
 */
async function upgrade(ns) {
    // Relocate to increase Intelligence XP.
    const shop = await choose_hardware_company(ns);
    ns.singularity.goToLocation(shop);

    // Suppose our home server already has the greatest number of RAM.  This
    // does not necessarily mean we cannot purchase any more or RAM for the
    // server.  We place an artificial limit on the RAM to avoid having to wait
    // too long to accumulate sufficient funds.  Initially, we are willing to
    // wait to upgrade the RAM up to and including the given limit.  After the
    // limit on RAM has been reached, we do not want to wait to accumulate money
    // for upgrading the RAM.  We simply upgrade if our current funds allow.
    if (is_at_limit(ns)) {
        if (ns.singularity.upgradeHomeRam()) {
            log(ns, "Upgrade home RAM");
        }
        return;
    }

    // Wait to accumulate funds to purchase upgrades.
    await upgrade_ram(ns);
}

/**
 * Upgrade the RAM on the home server.
 *
 * @param {NS} ns The Netscript API.
 */
async function upgrade_ram(ns) {
    log(ns, "Upgrade home RAM");
    const success = ns.singularity.upgradeHomeRam();

    // We are willing to wait some time for our funds to increase.  After the
    // waiting period is over, try to upgrade the RAM again.  If we are still
    // unsuccessful at the second attempt, then move on.
    if (!success) {
        await ns.sleep(wait_t.MINUTE);
        ns.singularity.upgradeHomeRam();
    }
}

/**
 * Upgrade our home server.
 *
 * Usage: run quack/singularity/home.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);

    // Raise some money.
    await trade_bot_stop_buy(ns);
    hacknet_liquidate(ns);
    const time = 3 * wse.TICK;
    await ns.sleep(time);
    log(ns, `Wait ${to_second(time)} seconds to raise money to upgrade home`);

    await upgrade(ns);
    trade_bot_resume(ns);
    // The next script in the load chain.
    exec(ns, "/quack/chain/install.js");
}
