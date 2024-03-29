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

import { bool } from "/quack/lib/constant/bool.js";
import { exclusive_aug, augment } from "/quack/lib/constant/faction.js";
import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { darkweb } from "/quack/lib/constant/tor.js";
import { wse } from "/quack/lib/constant/wse.js";
import { Gangster } from "/quack/lib/gang/gangster.js";
import { reassign_soft_reset } from "/quack/lib/gang/util.js";
import { error, log } from "/quack/lib/io.js";
import { money } from "/quack/lib/money.js";
import { Player } from "/quack/lib/player.js";
import { join_all_factions } from "/quack/lib/singularity/faction.js";
import { has_ai_api } from "/quack/lib/source.js";
import { assert, cleanup } from "/quack/lib/util.js";
import {
    trade_bot_liquidate,
    trade_bot_resume,
    trade_bot_stop_buy,
} from "/quack/lib/wse.js";

/**
 * Purchase Augmentations that are exclusive to various factions.  If we have
 * a gang within a faction, the faction allows us to purchase Augmentations
 * that are exclusive to other factions.  Exploit this feature to speed up our
 * progression through all factions.
 *
 * @param {NS} ns The Netscript API.
 */
function buy_exclusive_augmentations(ns) {
    if (!ns.gang.inGang()) {
        return;
    }
    // The faction within which we created our gang.
    const gang_faction = ns.gang.getGangInformation().faction;

    // Attempt to purchase the exclusive Augmentations.
    const installed = new Set(installed_augmentations(ns));
    for (const faction of Object.keys(exclusive_aug)) {
        for (const aug of exclusive_aug[faction]) {
            if (installed.has(aug) || aug === augment.TRP) {
                continue;
            }
            const fac_rep = ns.singularity.getFactionRep(gang_faction);
            const aug_rep = ns.singularity.getAugmentationRepReq(aug);
            if (fac_rep < aug_rep) {
                continue;
            }
            if (money(ns) < ns.singularity.getAugmentationPrice(aug)) {
                continue;
            }
            ns.singularity.purchaseAugmentation(gang_faction, aug);
        }
    }
}

/**
 * Use our gang faction to purchase any other Augmentations we can.
 *
 * @param {NS} ns The Netscript API.
 */
function buy_other_augmentations(ns) {
    if (!ns.gang.inGang()) {
        return;
    }

    // Sets of Augmentations to exclude.
    const installed = new Set(installed_augmentations(ns));
    let exclusive = [];
    for (const fac of Object.keys(exclusive_aug)) {
        exclusive = exclusive.concat(exclusive_aug[fac]);
    }
    exclusive = exclusive.filter((a) => a !== augment.TRP);
    exclusive = exclusive.concat(purchased_augmentations(ns));
    exclusive = new Set(exclusive);

    // Buy other Augmentations available from our gang faction.
    const { faction } = ns.gang.getGangInformation();
    const aug = ns.singularity
        .getAugmentationsFromFaction(faction)
        .filter((a) => a !== augment.TRP);
    for (const a of aug) {
        if (installed.has(a) || exclusive.has(a)) {
            continue;
        }
        const fac_rep = ns.singularity.getFactionRep(faction);
        const aug_rep = ns.singularity.getAugmentationRepReq(a);
        if (fac_rep < aug_rep) {
            continue;
        }
        if (money(ns) < ns.singularity.getAugmentationPrice(a)) {
            continue;
        }
        assert(ns.singularity.purchaseAugmentation(faction, a));
    }
}

/**
 * Purchase programs via the dark web as many times as possible.  At this
 * stage, we do not need any more programs to help us with our hacking and
 * faction work.  We buy the programs over and over again to help raise our
 * Intelligence XP.
 *
 * @param {NS} ns The Netscript API.
 */
async function buy_programs(ns) {
    const player = new Player(ns);
    if (!player.has_tor()) {
        return;
    }

    // Try to buy at most this many times to prevent the script from hanging.
    // If our income rises faster than our spending on programs, then it is
    // possible for this function to hang and buys indefinitely.
    const maxtry = 1000;
    const p = darkweb.program.cheapest.NAME;
    const cost = darkweb.program.cheapest.COST;
    ns.rm(p, player.home());
    for (let i = 0; i < maxtry; i++) {
        for (let j = 0; j < maxtry; j++) {
            if (player.money() < cost) {
                return;
            }
            ns.singularity.purchaseProgram(p);
            assert(ns.rm(p, player.home()));
        }
        await ns.sleep(wait_t.MILLISECOND);
    }
}

/**
 * Whether we have Augmentations that are purchased and yet to be installed.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we have Augmentations that are yet to be
 *     installed; false otherwise.
 */
function has_augmentations(ns) {
    return purchased_augmentations(ns).length > 0;
}

/**
 * Install all purchased Augmentations.
 *
 * @param {NS} ns The Netscript API.
 */
function install(ns) {
    assert(has_augmentations(ns));
    log(ns, "Install Augmentations and soft reset");
    ns.singularity.installAugmentations("/quack/go.js");
}

/**
 * An array of Augmentations we have purchased and installed.
 *
 * @param {NS} ns The Netscript API.
 */
function installed_augmentations(ns) {
    return ns.singularity.getOwnedAugmentations(bool.NOT_PURCHASED);
}

/**
 * An array of Augmentations we have purchased, but not yet installed.
 *
 * @param {NS} ns The Netscript API.
 */
function purchased_augmentations(ns) {
    const purchased_aug = ns.singularity.getOwnedAugmentations(bool.PURCHASED);
    const installed_aug = installed_augmentations(ns);
    return purchased_aug.filter((a) => !installed_aug.includes(a));
}

/**
 * Prepare our gang for the soft reset.  After the soft reset, there would be a
 * period of time during which our gang script would not run.  Set our gang to
 * be in a neutral state during this waiting period.  At minimum, during the
 * waiting period our gang should be doing the following:
 *
 * (1) Have some members engage in vigilante justice to decrease the penalty.
 * (2) If a member is currently in training, set them to mug random people.
 * (3) Disengage from territory warfare.
 *
 * @param {NS} ns The Netscript API.
 */
function set_neutral_gang(ns) {
    if (!ns.gang.inGang()) {
        error(ns, "No access to Gang API");
        return;
    }
    log(ns, "Prepare gang for soft reset");

    // First, kill our gang script.
    const script = "/quack/gang/crime.js";
    const { faction } = ns.gang.getGangInformation();
    if (ns.isRunning(script, home, faction)) {
        assert(ns.kill(script, home, faction));
    }

    // Assign vigilantes.
    reassign_soft_reset(ns);

    // Put anyone in combat training to mug people.
    const gangster = new Gangster(ns);
    const newbie = ns.gang
        .getMemberNames()
        .filter((s) => gangster.is_training(s));
    gangster.mug(newbie);

    // Finally, disengage from turf warfare so members would not be killed
    // while we cannot run the script that manages our gang.
    ns.gang.setTerritoryWarfare(bool.DISABLE);
}

/**
 * Install all purchased Augmentations and run our bootstrap script.
 *
 * Usage: run quack/singularity/install.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    // Tell the trade bot to stop buying shares.  Wait a while for it to sell
    // some shares.
    trade_bot_stop_buy(ns);
    const time = 3 * wse.TICK;
    const time_fmt = `${time / wait_t.SECOND}`;
    const msg = `Wait ${time_fmt} seconds to sell shares of stocks (if any)`;
    log(ns, msg);
    await ns.sleep(time);
    trade_bot_resume(ns);

    // Now sell all shares of all remaining stocks.
    trade_bot_liquidate(ns);
    log(ns, "Liquidate all stocks (if any)");
    await ns.sleep(wse.TICK + wait_t.DEFAULT);

    // Raise some Intelligence XP.
    if (has_ai_api(ns)) {
        log(ns, "Raise Intelligence XP");
        join_all_factions(ns);
        buy_exclusive_augmentations(ns);
        buy_other_augmentations(ns);
        await buy_programs(ns);
    } else {
        error(ns, "No access to Artificial Intelligence API");
    }

    // Set our gang to a state where it at least is working to lower the
    // penalty.
    set_neutral_gang(ns);
    // Install all Augmentations and soft reset.
    cleanup(ns);
    install(ns);
}
