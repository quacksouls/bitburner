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

import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { assert } from "/lib/util.js";

/**
 * This function should be run immediately after the soft reset of installing a
 * bunch of Augmentations or after visiting a new BitNode.  Our purpose is to
 * gain some money and Hack experience points early on when our stats are low.
 *
 * @param ns The Netscript API.
 */
async function reboot(ns) {
    // Execute a script, let it run for a while, kill the script, and run
    // another script.  Assume we do not have enough RAM to let multiple
    // scripts running at the same time.
    const nthread = 1;
    const script = ["hnet-farm.js", "world-server.js"];
    for (const s of script) {
        ns.exec(s, home, nthread);
        await ns.sleep(wait_t.DEFAULT);
        assert(ns.kill(s, home));
    }
}

/**
 * Start a load chain.  Each script in the chain uses functions from the
 * Singularity API.  Each function from this API tends to use a huge amount
 * of RAM.
 *
 * @param ns The Netscript API.
 */
function singularity_scripts(ns) {
    const script = "/singularity/study.js";
    const nthread = 1;
    ns.exec(script, home, nthread);
}

/**
 * NOTE: This script assumes our home server has a small amount of RAM,
 * possibly less than 64GB RAM.
 *
 * Restart our source of income and Hack experience points.  This script is
 * useful whenever we have installed a bunch of Augmentations and we want to
 * automatically restart scripts to:
 *
 * (1) Purchase Hacknet nodes and manage our farm of nodes.
 * (2) Buy servers and use each purchased server to hack a target server in the
 *     game world.
 * (3) Gain root access to servers in the game world (excluding purchased
 *     servers) and use each server to hack itself.
 *
 * Our goal in this script is to raise the amount of RAM on our home server to
 * at least 512GB.
 *
 * Usage: run go-low.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    await reboot(ns);
    singularity_scripts(ns);
}