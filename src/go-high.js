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
import { log } from "/quack/lib/io.js";
import { has_singularity_api } from "/quack/lib/source.js";
import { assert, exec, init_sleeves } from "/quack/lib/util.js";

/**
 * This function should be run immediately after the soft reset of installing a
 * bunch of Augmentations.  Our purpose is to gain some money and Hack XP
 * early on when our stats are low.
 *
 * @param ns The Netscript API.
 */
async function reboot(ns) {
    const script = [
        "/quack/hgw/world.js",
        "/quack/gang/program.js",
        // "hnet-farm.js",
        "/quack/stock/go.js",
        "/quack/cct/solver.js",
        // "hram.js",
    ];
    // In "BitNode-9: Hacktocracy", we cannot buy servers so there is no point
    // in setting up a farm of purchased servers.
    if (bitnode.Hacktocracy !== ns.getPlayer().bitNodeN) {
        // script.unshift("buy-server.js");
        script.unshift("/quack/hgw/pserv.js");
    }
    script.forEach((s) => exec(ns, s));
    await init_sleeves(ns);
}

/**
 * NOTE: Assume our home server to have at least 512GB RAM.
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
 * Usage: run quack/go-high.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    log(ns, "Home server is high-end. Bootstrap with all scripts.");
    assert(has_singularity_api(ns));
    await reboot(ns);
    exec(ns, "/quack/chain/money.js");
}
