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
import { log } from "/quack/lib/io.js";
import { Money } from "/quack/lib/money.js";
import { assert, exec } from "/quack/lib/util.js";

/**
 * Choose the threshold amount of money to raise.
 *
 * @param ns The Netscript API.
 * @return The amount of money to raise.
 */
function choose_threshold(ns) {
    // If our server is not high-end, then the threshold is the cost of
    // upgrading the RAM.
    if (ns.getServer(home).maxRam < home_t.RAM_HIGH) {
        return Math.ceil(ns.singularity.getUpgradeHomeRamCost());
    }
    // The default threshold.
    const m = new Money();
    return 5 * m.million();
}

/**
 * Commit various crimes to raise money.
 *
 * @param ns The Netscript API.
 * @param threshold Continue to commit crimes until our money is at least this
 *     amount.
 */
async function commit_crimes(ns, threshold) {
    assert(threshold > 0);
    log(ns, "Commit crimes to raise money and lower karma");
    const script = "/quack/singularity/crime.js";
    const nthread = 1;
    ns.exec(script, home, nthread, threshold);
    // Wait for the crime script to end.
    while (ns.scriptRunning(script, home)) {
        await ns.sleep(wait_t.DEFAULT);
    }
}

/**
 * Whether to upgrade the RAM of our home server.
 *
 * @param ns The Netscript API.
 * @return True if we need to upgrade the RAM of our home server;
 *     false otherwise.
 */
function is_upgrade_home_ram(ns) {
    const home_ram = ns.getServer(home).maxRam;
    return home_ram < home_t.RAM_HIGH;
}

/**
 * Run the next script in the load chain.
 *
 * @param ns The Netscript API.
 */
function load_chain(ns) {
    exec(ns, "/quack/chain/misc.js");
}

/**
 * Commit crimes to raise some money as well earn negative karma.  Assume that
 * our home server has 32GB RAM.  Try to keep the RAM cost of this script as
 * low as possible.  Do not add anything to the script unless absolutely
 * necessary.
 *
 * Usage: run singularity/money.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Suppress various log messages.
    ns.disableLog("sleep");
    // Commit crime to raise some money.
    const player_money = ns.getServerMoneyAvailable(home);
    const threshold = choose_threshold(ns);
    if (player_money > threshold && !is_upgrade_home_ram(ns)) {
        load_chain(ns);
        return;
    }
    await commit_crimes(ns, threshold);

    // If our home server is not high-end, upgrade the RAM on the home server.
    if (is_upgrade_home_ram(ns)) {
        log(ns, "Raise money to upgrade home RAM");
        // Upgrade the RAM on the home server.
        const cost = ns.singularity.getUpgradeHomeRamCost();
        let success = ns.singularity.upgradeHomeRam();
        while (!success) {
            await commit_crimes(ns, cost);
            success = ns.singularity.upgradeHomeRam();
        }
        // Reboot to take advantage of the newly upgraded home server.
        ns.singularity.softReset("/quack/go.js");
    }
    load_chain(ns);
}
