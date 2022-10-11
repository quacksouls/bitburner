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

import { home, home_t } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { Money } from "/lib/money.js";
import { assert } from "/lib/util.js";

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
    const script = "/singularity/crime.js";
    const nthread = 1;
    ns.exec(script, home, nthread, threshold);
    // Wait for the crime script to end.
    while (ns.scriptRunning(script, home)) {
        await ns.sleep(wait_t.DEFAULT);
    }
}

/**
 * Chain load the next scripts.  Here is a brief description of the purpose of
 * each script.
 *
 * (1) /singularity/daemon.js := This script determines whether we should be
 *     hacking the w0r1d_d43m0n server.  It terminates if the conditions are
 *     not met for the server to appear in the game world.
 * (2) /singularity/int-farm.js := This script passively farms Intelligence XP.
 * (3) /singularity/program.js := This script attempts to purchase port opener
 *     programs.  We need all five port opener programs so we can open all
 *     ports of each server.
 * (4) /gang/go.js := This utility script helps us to decide which criminal
 *     faction to join so we can create a gang within that faction.
 *
 * @param ns The Netscript API.
 */
async function load_chain(ns) {
    const gang_script = [
        "/gang/go.js",
        "/gang/slum-snakes.js",
        "/gang/dead-speakers.js",
    ];
    const script = [
        "/singularity/daemon.js",
        "/singularity/int-farm.js",
        gang_script[0],
    ];
    const nthread = 1;
    script.map((s) => ns.exec(s, home, nthread));
    // Wait until we have joined a criminal faction.  Then launch another
    // script.  We must wait because the script launched by "/gang/go.sh" needs
    // to perform tasks that require focus.  The script
    // "/singularity/program.js" also requires focus.  We can only focus on one
    // task at a time.
    let is_running = true;
    while (is_running) {
        is_running = false;
        for (const s of gang_script) {
            if (ns.scriptRunning(s, home)) {
                is_running = true;
                break;
            }
        }
        await ns.sleep(wait_t.SECOND);
    }
    ns.exec("/singularity/program.js", home, nthread);
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
    const home_ram = ns.getServer(home).maxRam;
    const threshold = choose_threshold(ns);
    if (player_money > threshold && home_ram >= home_t.RAM_HIGH) {
        await load_chain(ns);
        return;
    }
    await commit_crimes(ns, threshold);
    // If our home server is not high-end, upgrade the RAM on the home server.
    if (home_ram < home_t.RAM_HIGH) {
        // Upgrade the RAM on the home server.
        const cost = ns.singularity.getUpgradeHomeRamCost();
        let success = ns.singularity.upgradeHomeRam();
        while (!success) {
            await commit_crimes(ns, cost);
            success = ns.singularity.upgradeHomeRam();
        }
        // Reboot to take advantage of the newly upgraded home server.
        const script = "go.js";
        const nthread = 1;
        ns.exec(script, home, nthread);
        return;
    }
    await load_chain(ns);
}
