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

import { bitnode } from "/quack/lib/constant/bn.js";
import { home, home_t } from "/quack/lib/constant/server.js";
import { log } from "/quack/lib/io.js";
import { has_singularity_api } from "/quack/lib/source.js";
import {
    assert, exec, farm_hack_xp, init_sleeves,
} from "/quack/lib/util.js";

/**
 * Determine which batcher to use.  Here are the candidates:
 *
 * (1) Sequential batcher.  Good for when our home server has limited RAM.
 * (2) Proto batcher.  Good for when our home server has a huge amount of RAM.
 *     A proto batcher generates more money and Hack XP than a sequential
 *     batcher, but is RAM intensive.
 *
 * @param {NS} ns The Netscript API.
 * @returns {string} Name of the batcher script to use.
 */
function choose_batcher(ns) {
    if (ns.getServerMaxRam(home) >= home_t.RAM_HUGE) {
        return "/quack/hgw/batcher/joe.js";
    }
    return "/quack/hgw/world.js";
}

/**
 * This function should be run immediately after the soft reset of installing a
 * bunch of Augmentations.  Our purpose is to gain some money and Hack XP
 * early on when our stats are low.
 *
 * @param {NS} ns The Netscript API.
 */
async function reboot(ns) {
    const script = [
        "/quack/gang/program.js",
        // "hnet-farm.js",
        "/quack/sleeve/homicide.js",
        "/quack/stock/go.js",
        "/quack/cct/solver.js",
        // "hram.js",
    ];
    script.forEach((s) => exec(ns, s));
    await farm_hack_xp(ns);

    const other_script = [choose_batcher(ns)];
    // In "BitNode-9: Hacktocracy", we cannot buy servers so there is no point
    // in setting up a farm of purchased servers.
    if (bitnode.Hacktocracy !== ns.getPlayer().bitNodeN) {
        other_script.unshift("/quack/hgw/pserv.js");
    }
    other_script.forEach((s) => exec(ns, s));

    await init_sleeves(ns);
}

/**
 * NOTE: Assume our home server to have at least 512GB RAM.
 *
 * Restart our source of income and Hack XP.  This script is useful whenever we
 * have installed a bunch of Augmentations and we want to automatically restart
 * our chain of scripts.
 *
 * Usage: run quack/go-high.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    log(ns, "Home server is high-end. Bootstrap with all scripts.");
    assert(has_singularity_api(ns));
    await reboot(ns);
    exec(ns, "/quack/chain/money.js");
}
