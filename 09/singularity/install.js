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

import { MyArray } from "/lib/array.js";
import { exclusive_aug, stock_tick } from "/lib/constant.js";
import { TRP } from "/lib/constant.augmentation.js";
import { all_programs } from "/lib/constant.exe.js";
import { Gangster } from "/lib/gangster.js";
import { reassign_vigilante } from "/lib/gangster.util.js";
import { Player } from "/lib/player.js";
import { join_all_factions } from "/lib/singularity.faction.js";
import { assert, trade_bot_resume, trade_bot_stop_buy } from "/lib/util.js";

/**
 * Purchase Augmentations that are exclusive to various factions.  If we have
 * a gang within a faction, the faction allows us to purchase Augmentations
 * that are exclusive to other factions.  Exploit this feature to speed up our
 * progression through all factions.
 *
 * @param ns The Netscript API.
 */
function buy_exclusive_augmentations(ns) {
    // The faction within which we created our gang.
    const gang_faction = ns.gang.getGangInformation().faction;
    // Attempt to purchase the exclusive Augmentations.
    const player = new Player(ns);
    const installed = new Set(installed_augmentations(ns));
    for (const faction of Object.keys(exclusive_aug)) {
        for (const aug of exclusive_aug[faction]) {
            if (installed.has(aug) || (aug == TRP)) {
                continue;
            }
            const fac_rep = ns.singularity.getFactionRep(gang_faction);
            const aug_rep = ns.singularity.getAugmentationRepReq(aug);
            if (fac_rep < aug_rep) {
                continue;
            }
            const cost = ns.singularity.getAugmentationPrice(aug);
            if (player.money() < cost) {
                continue;
            }
            assert(ns.singularity.purchaseAugmentation(gang_faction, aug));
        }
    }
}

/**
 * Purchase programs via the dark web as many times as possible.  At this
 * stage, we do not need any more programs to help us with our hacking and
 * faction work.  We buy the programs over and over again to help raise our
 * Intelligence XP.
 */
async function buy_programs(ns) {
    const player = new Player(ns);
    assert(player.has_tor());
    const db = cost_program(ns);
    const time = 1;  // Millisecond.
    // Try to buy at most this many times to prevent the script from hanging.
    // If our income rises faster than our spending on programs, then it is
    // possible for this function to hang and buys indefinitely.
    let ntry = 0;
    const maxtry = 1000;
    while (true) {
        let nbought = 0;
        for (const [c, p] of db) {
            if (player.money() < c) {
                continue;
            }
            const success = ns.singularity.purchaseProgram(p);
            if (success) {
                nbought++;
                assert(ns.rm(p, player.home()));
            }
        }
        if (nbought < 1) {
            break;
        }
        ntry++;
        if (ntry >= maxtry) {
            break;
        }
        await ns.sleep(time);
    }
}

/**
 * The cost of each program that can be purchased via the dark web.
 *
 * @param ns The Netscript API.
 * @return An array of arrays.  Each element is a 2-tuple [c, p] as follows:
 *
 *     (1) c := The cost of buying the given program.
 *     (2) p := A string representing the name of a program available via the
 *         dark web.
 *
 *     The returned array is sorted in ascending order, using the first element
 *     of each 2-tuple.
 */
function cost_program(ns) {
    // The program name and its cost.
    const db = new Array();
    const player = new Player(ns);
    for (const p of all_programs().keys()) {
        // Must delete the program on our home server, otherwise its cost would
        // be zero.
        if (player.has_program(p)) {
            ns.rm(p, player.home());
        }
        const cost = ns.singularity.getDarkwebProgramCost(p);
        db.push([cost, p]);
    }
    assert(db.length > 0);
    const array = new MyArray();
    return array.sort_ascending_tuple(db);
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
    const player = new Player(ns);
    if (ns.isRunning(script, player.home(), faction)) {
        assert(ns.kill(script, player.home(), faction));
    }
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
    await buy_programs(ns);
    trade_bot_resume(ns);
    // Set our gang to a state where it at least is working to lower the
    // penalty.
    set_neutral_gang(ns);
    // Install all Augmentations and soft reset.
    install(ns);
}
