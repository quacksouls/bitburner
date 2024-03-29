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

import { wait_t } from "/quack/lib/constant/time.js";
import { darkweb } from "/quack/lib/constant/tor.js";
import { log } from "/quack/lib/io.js";
import { has_singularity_api } from "/quack/lib/source.js";
import {
    assert, exec, has_program, init_sleeves,
} from "/quack/lib/util.js";

/**
 * Launch scripts to purchase port opener programs.
 *
 * @param {NS} ns The Netscript API.
 */
async function init_popen(ns) {
    const pid = exec(ns, "/quack/sleeve/homicide.js");
    while (ns.isRunning(pid)) {
        await ns.sleep(wait_t.SECOND);
    }

    const pida = exec(ns, "/quack/gang/program.js");
    const pidb = exec(ns, "/quack/world.js");
    while (
        !has_program(ns, darkweb.program.brutessh.NAME)
        || !has_program(ns, darkweb.program.ftpcrack.NAME)
    ) {
        await ns.sleep(wait_t.DEFAULT);
    }
    ns.kill(pida);
    ns.kill(pidb);
}

/**
 * This function should be run immediately after the soft reset of installing a
 * bunch of Augmentations or after visiting a new BitNode.  Our purpose is to
 * gain some money and Hack XP early on when our stats are low.
 *
 * @param {NS} ns The Netscript API.
 */
async function reboot(ns) {
    await init_sleeves(ns);
    await init_popen(ns);
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
 * NOTE: This script assumes our home server has a small amount of RAM,
 * possibly less than 64GB RAM.
 *
 * Restart our source of income and Hack XP.  This script is useful whenever we
 * have installed a bunch of Augmentations and we want to automatically restart
 * scripts to farm Hack XP and money.
 *
 * Usage: run quack/go-low.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    log(ns, "Home server is low-end. Bootstrap with some scripts.");
    assert(has_singularity_api(ns));
    await reboot(ns);
    exec(ns, "/quack/chain/money.js");
}
