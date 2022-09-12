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

import { exclusive_aug, home, stock_tick } from "/lib/constant.js";
import { Gangster } from "/lib/gangster.js";
import { reassign_vigilante } from "/lib/gangster.util.js";
import { Player } from "/lib/player.js";
import { join_all_factions } from "/lib/singularity.faction.js";
import { assert, trade_bot_resume, trade_bot_stop_buy } from "/lib/util.js";

/**
 * Purchase Augmentations that are exclusive to the faction within which we
 * created our gang.
 *
 * @param ns The Netscript API.
 */
function buy_exclusive_augmentations(ns) {
    // The faction within which we created our gang.
    const faction = ns.gang.getGangInformation().faction;
    // Attempt to purchase the exclusive Augmentations.
    const installed = new Set(installed_augmentations(ns));
    for (const aug of exclusive_aug[faction]) {
        if (installed.has(aug)) {
            continue;
        }
        const fac_rep = ns.singularity.getFactionRep(faction);
        const aug_rep = ns.singularity.getAugmentationRepReq(aug);
        if (fac_rep < aug_rep) {
            continue;
        }
        const money = ns.getServerMoneyAvailable(home);
        const cost = ns.singularity.getAugmentationPrice(aug);
        if (money < cost) {
            continue;
        }
        assert(ns.singularity.purchaseAugmentation(faction, aug));
    }
}

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
 * Prepare our gang for the soft reset.  After the soft reset, there would be a
 * period of time during which our gang script would not run.  Set our gang to
 * be in a neutral state during this waiting period.  At minimum, during the
 * waiting period our gang should be doing the following:
 *
 * (1) Have some members engage in vigilante justice to decrease the penalty.
 * (2) If a member is currently in training, set them to mug random people.
 *
 * @param ns The Netscript API.
 */
function set_neutral_gang(ns) {
    if (!ns.gang.inGang()) {
        return;
    }
    // First, kill our gang script.
    const script = "/gang/crime.js";
    const faction = ns.gang.getGangInformation().faction;
    assert(ns.kill(script, home, faction));
    // Assign vigilantes.
    const nmember = 1;
    reassign_vigilante(ns, nmember);
    // Put anyone in combat training to mug people.
    const newbie = new Array();
    const gangster = new Gangster(ns);
    for (const s of ns.gang.getMemberNames()) {
        if (gangster.is_training(s)) {
            newbie.push(s);
        }
    }
    gangster.mug(newbie);
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
    buy_exclusive_augmentations(ns);
    buy_programs(ns);
    trade_bot_resume(ns);
    // Set our gang to a state where it at least is working to lower the
    // penalty.
    set_neutral_gang(ns);
    // Install all Augmentations and soft reset.
    install(ns);
}
