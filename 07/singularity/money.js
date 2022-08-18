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

import { high_ram, home } from "/lib/constant.js";
import { Money } from "/lib/money.js";
import { Time } from "/lib/time.js";
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
    if (ns.getServer(home).maxRam < high_ram) {
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
    const t = new Time();
    const time = 10 * t.second();
    while (ns.scriptRunning(script, home)) {
        await ns.sleep(time);
    }
}

/**
 * Chain load the next scripts.  The script "/singularity/daemon.js" determines
 * whether we should be hacking the w0r1d_d43m0n server.  It terminates if the
 * conditions are not met for the server to appear in the game world.  The
 * script "/singularity/program.js" attempts to purchase port opener programs.
 *
 * @param ns The Netscript API.
 */
function load_chain(ns) {
    const script = ["/singularity/daemon.js", "/singularity/program.js"];
    const nthread = 1;
    for (const s of script) {
        ns.exec(s, home, nthread);
    }
}

/**
 * Commit crimes to raise some money as well earn negative karma.
 *
 * Usage: run singularity/money.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Commit crime to raise some money.
    const player_money = ns.getServerMoneyAvailable(home);
    const home_ram = ns.getServer(home).maxRam;
    const threshold = choose_threshold(ns);
    if ((player_money > threshold) && (home_ram >= high_ram)) {
        load_chain(ns);
        return;
    }
    await commit_crimes(ns, threshold);
    // If our home server is not high-end, upgrade the RAM on the home server.
    if (home_ram < high_ram) {
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
    load_chain(ns);
}
