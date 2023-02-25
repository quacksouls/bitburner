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

import { darkweb } from "/quack/lib/constant/misc.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";
import { has_singularity_api } from "/quack/lib/source.js";
import {
    assert, exec, has_program, init_sleeves,
} from "/quack/lib/util.js";

/**
 * Launch scripts to purchase port opener programs.
 *
 * @param ns The Netscript API.
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
 * @param ns The Netscript API.
 */
async function reboot(ns) {
    // Execute a script, let it run for a while, kill the script, and run
    // another script.  Assume we do not have enough RAM to let multiple
    // scripts running at the same time.
    // const script = ["hnet-farm.js", "low-end.js"];
    // for (const s of script) {
    //     exec(ns, s);
    //     await ns.sleep(wait_t.DEFAULT);
    //     assert(ns.kill(s, home));
    // }
    await init_sleeves(ns);
    await init_popen(ns);
}

/**
 * NOTE: This script assumes our home server has a small amount of RAM,
 * possibly less than 64GB RAM.
 *
 * Restart our source of income and Hack XP.  This script is useful whenever we
 * have installed a bunch of Augmentations and we want to automatically restart
 * scripts to:
 *
 * (1) Purchase Hacknet nodes and manage our farm of nodes.
 * (2) Buy servers and use each purchased server to hack a target server in the
 *     game world.
 * (3) Gain root access to servers in the game world (excluding purchased
 *     servers) and use each server to hack itself or a low-end server.
 *
 * Our goal in this script is to raise the amount of RAM on our home server to
 * at least 512GB.
 *
 * Usage: run quack/go-low.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    log(
        ns,
        "Home server is low-end. Bootstrap with a small number of scripts."
    );
    assert(has_singularity_api(ns));
    await reboot(ns);
    exec(ns, "/quack/chain/money.js");
}
