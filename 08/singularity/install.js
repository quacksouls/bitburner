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

import { home, stock_tick } from "/lib/constant.js";
import { Player } from "/lib/player.js";
import { join_all_factions } from "/lib/singularity.faction.js";
import { assert, trade_bot_resume, trade_bot_stop_buy } from "/lib/util.js";

/**
 * Purchase the cheapest program via the dark web as many times as possible.
 * At this stage, we do not need any more programs to help us with our hacking
 * and faction work.  We buy the cheapest program over and over again to help
 * raise our Intelligence XP.
 */
function buy_programs(ns) {
    // The programs BruteSSH.exe, ServerProfiler.exe, and DeepscanV1.exe are
    // the cheapest programs on offer from the dark web.  Choose any of these
    // programs and purchase it over and over again as our funds allows.
    const p = "BruteSSH.exe";
    const cost = 500 * 1000;
    const player = new Player(ns);
    assert(cost == ns.singularity.getDarkwebProgramCost(p));
    assert(player.has_tor());
    assert(player.has_program(p));
    while (player.money() >= cost) {
        assert(ns.rm(p, player.home()));
        assert(ns.singularity.purchaseProgram(p));
    }
}

/**
 * Whether we have Augmentations that are purchased and yet to be installed.
 *
 * @param ns The Netscript API.
 * @return true if we have Augmentations that are yet to be installed;
 *     false otherwise.
 */
function has_augmentations(ns) {
    const augment = purchased_augmentations(ns);
    return augment.length > 0;
}

/**
 * Install all purchased Augmentations.
 *
 * @param ns The Netscript API.
 */
function install(ns) {
    assert(has_augmentations(ns));
    const script = "go.js";
    ns.singularity.installAugmentations(script);
}

/**
 * An array of Augmentations we have purchased and installed.
 *
 * @param ns The Netscript API.
 */
function installed_augmentations(ns) {
    const purchase = false;
    return ns.singularity.getOwnedAugmentations(purchase);
}

/**
 * An array of Augmentations we have purchased, but not yet installed.
 *
 * @param ns The Netscript API.
 */
function purchased_augmentations(ns) {
    const purchase = true;
    const purchased_aug = ns.singularity.getOwnedAugmentations(purchase);
    const installed_aug = installed_augmentations(ns);
    return purchased_aug.filter(a => !installed_aug.includes(a));
}

/**
 * Install all purchased Augmentations and run our bootstrap script.
 *
 * Usage: run singularity/install.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Tell the trade bot to stop buying shares.  Wait a while for it to sell
    // some shares.
    trade_bot_stop_buy(ns);
    const time = 3 * stock_tick;
    await ns.sleep(time);
    // Raise some more Intelligence XP.
    join_all_factions(ns);
    buy_programs(ns);
    trade_bot_resume(ns);
    // Install all Augmentations and soft reset.
    install(ns);
}
