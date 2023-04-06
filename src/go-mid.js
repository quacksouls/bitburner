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

import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { choose_batcher_pserv } from "/quack/lib/hgw.js";
import { log } from "/quack/lib/io.js";
import { has_singularity_api } from "/quack/lib/source.js";
import { assert, exec, farm_hack_xp } from "/quack/lib/util.js";

/**
 * This function should be run immediately after the soft reset of installing a
 * bunch of Augmentations.  Our purpose is to gain some money and Hack XP
 * early on when our stats are low.
 *
 * @param {NS} ns The Netscript API.
 */
async function reboot(ns) {
    const pid = exec(ns, "/quack/sleeve/homicide.js");
    while (ns.isRunning(pid)) {
        await ns.sleep(wait_t.SECOND);
    }

    // Run scripts, wait a while, and then kill scripts to free up some RAM on
    // the home server.
    const script = ["/quack/cct/solver.js"];
    script.forEach((s) => exec(ns, s));
    await ns.sleep(wait_t.MINUTE);
    script.forEach((s) => assert(ns.kill(s, home)));

    exec(ns, "/quack/gang/program.js");
    await farm_hack_xp(ns);
    exec(ns, "/quack/hgw/world.js");
    exec(ns, choose_batcher_pserv(ns));
}

/**
 * Disable various messages in the script log.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("sleep");
}

/**
 * NOTE: Assume our home server has at least 128GB RAM.
 *
 * Restart our source of income and Hack XP.  This script is useful whenever we
 * have installed a bunch of Augmentations and we want to automatically restart
 * scripts to farm Hack XP and money.
 *
 * Usage: run quack/go-mid.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    log(ns, "Home server is mid-end. Bootstrap with some scripts.");
    assert(has_singularity_api(ns));
    await reboot(ns);
    exec(ns, "/quack/chain/money.js");
}
