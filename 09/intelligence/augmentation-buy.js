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

import { intelligence, intelligence_gain } from "/intelligence/util.js";
import { bool } from "/lib/constant/bool.js";
import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import {
    choose_augment, has_augment, nfg, prerequisites
} from "/lib/singularity/augment.js";
import { assert, is_valid_faction } from "/lib/util.js";

/**
 * Augmentations we still need to purchase from a faction.
 *
 * @param ns The Netscript API.
 * @param fac We want to purchase all Augmentations from this faction.
 * @return An array of Augmentation names.  We do not yet have these
 *     Augmentations.  This array never includes the NeuroFlux Governor
 *     Augmentation.  Cannot be an empty array.
 */
function augmentations_to_buy(ns, fac) {
    // All Augmentations we have not yet purchased from the given faction.
    // Exclude the NeuroFlux Governor.
    const owned_aug = new Set(
        ns.singularity.getOwnedAugmentations(bool.PURCHASED)
    );
    let fac_aug = ns.singularity.getAugmentationsFromFaction(fac);
    fac_aug = fac_aug.filter(a => !owned_aug.has(a));
    if (fac_aug.includes(nfg())) {
        fac_aug = fac_aug.filter(a => a != nfg());
    }
    assert(fac_aug.length > 0);
    return fac_aug;
}

/**
 * Purchase all Augmentations from a faction.
 *
 * @param ns The Netscript API.
 * @param fac We want to buy all Augmentations from this faction.
 */
async function purchase_augmentations(ns, fac) {
    let augment = augmentations_to_buy(ns, fac);
    assert(augment.length > 0);
    // Below is our purchasing strategy.
    //
    // (1) Purchase the most expensive Augmentation first.
    // (2) If an Augmentation has a pre-requisite that we have not yet bought,
    //     purchase the pre-requisite first.
    // (3) Leave the NeuroFlux Governor Augmentation to last.
    while (augment.length > 0) {
        // Choose the most expensive Augmentation.
        const aug = choose_augment(ns, augment);
        if (has_augment(ns, aug)) {
            augment = augment.filter(a => a != aug);
            continue;
        }
        // If the most expensive Augmentation has no pre-requisites or we have
        // already purchased all of its pre-requisites, then purchase the
        // Augmentation.
        let prereq = prerequisites(ns, aug);
        if (0 == prereq.length) {
            await purchase_aug(ns, aug, fac);
            augment = augment.filter(a => a != aug);
            continue;
        }
        // If the Augmentation has one or more pre-requisites we have not yet
        // purchased, then first purchase the pre-requisites.
        while (prereq.length > 0) {
            const pre = choose_augment(ns, prereq);
            await purchase_aug(ns, pre, fac);
            prereq = prereq.filter(a => a != pre);
        }
        await purchase_aug(ns, aug, fac);
        augment = augment.filter(a => a != aug);
    }
    // Level up the NeuroFlux Governor Augmentation as high as our funds allows.
    let cost = Math.ceil(ns.singularity.getAugmentationPrice(nfg()));
    let nfg_rep = Math.ceil(ns.singularity.getAugmentationRepReq(nfg()));
    let fac_rep = Math.floor(ns.singularity.getFactionRep(fac));
    let money = ns.getServerMoneyAvailable(home);
    while ((cost <= money) && (nfg_rep <= fac_rep)) {
        const before = intelligence(ns);
        assert(ns.singularity.purchaseAugmentation(fac, nfg()));
        const after = intelligence(ns);
        const action = "Purchase Augmentation " + nfg() + " from " + fac;
        intelligence_gain(ns, before, after, action);
        cost = Math.ceil(ns.singularity.getAugmentationPrice(nfg()));
        nfg_rep = Math.ceil(ns.singularity.getAugmentationRepReq(nfg()));
        fac_rep = Math.floor(ns.singularity.getFactionRep(fac));
        money = ns.getServerMoneyAvailable(home);
    }
}

/**
 * Purchase an Augmentation.
 *
 * @param ns The Netscript API.
 * @param aug We want to purchase this Augmentation.
 * @param fac We want to purchase the given Augmentation from this faction.
 */
async function purchase_aug(ns, aug, fac) {
    // Purchase any pre-requisites first.
    let prereq = prerequisites(ns, aug);
    while (prereq.length > 0) {
        const pre = choose_augment(ns, prereq);
        await purchase_aug(ns, pre, fac);
        prereq = prereq.filter(a => a != pre);
    }
    // Having purchased all pre-requisites of an Augmentation, now purchase
    // the Augmentation.
    let success = false;
    const cost = Math.ceil(ns.singularity.getAugmentationPrice(aug));
    const before = intelligence(ns);
    if (has_augment(ns, aug)) {
        return;
    }
    while (!success) {
        assert(!has_augment(ns, aug));
        if (ns.getServerMoneyAvailable(home) < cost) {
            await ns.sleep(wait_t.DEFAULT);
        }
        success = ns.singularity.purchaseAugmentation(fac, aug);
    }
    const after = intelligence(ns);
    const action = "Purchase Augmentation " + aug + " from " + fac;
    intelligence_gain(ns, before, after, action);
    assert(has_augment(ns, aug));
}

/**
 * Determine the amount of Intelligence XP gained from purchasing
 * Augmentations.  This script accepts a command line argument.
 *
 * Usage: run intelligence/augmentation-buy.js [factionName]
 * Example: run intelligence/augmentation-buy.js Sector-12
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const faction = ns.args[0];
    assert(is_valid_faction(faction));
    await purchase_augmentations(ns, faction);
}
