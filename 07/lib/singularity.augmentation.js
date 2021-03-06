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

// Miscellaneous helper functions related to Augmentations.

import {
    all_factions, aug_purchase_limit, home, work_hack_lvl
} from "/lib/constant.js";
import { commit_crime } from "/lib/singularity.crime.js";
import { work } from "/lib/singularity.work.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Augmentations we still need to purchase from a faction.  From all
 * Augmentations that are yet to be purchased, we choose n Augmentations where
 * one of these has reputation requirement higher than the remaining n - 1.  We
 * order the Augmentations from least reputation requirement to highest
 * reputation requirement and make our decision using this ascending list.  For
 * example, if n = 5 we would be purchasing the first 5 Augmentations that have
 * the lowest reputation requirements.
 *
 * @param ns The Netscript API.
 * @param fac We want to purchase all Augmentations from this faction.
 * @return An array of Augmentation names.  We do not yet have these
 *     Augmentations.  This array never includes the NeuroFlux Governor
 *     Augmentation.  Cannot be an empty array.
 */
export function augmentations_to_buy(ns, fac) {
    assert(is_valid_faction(fac));
    // All Augmentations we have not yet purchased from the given faction.
    // Exclude the NeuroFlux Governor.
    const purchased = true;
    const owned_aug = new Set(ns.singularity.getOwnedAugmentations(purchased));
    let fac_aug = ns.singularity.getAugmentationsFromFaction(fac);
    fac_aug = fac_aug.filter(a => !owned_aug.has(a));
    if (fac_aug.includes(nfg())) {
        fac_aug = fac_aug.filter(a => a != nfg());
    }
    assert(fac_aug.length > 0);
    // Choose n Augmentations that have the least reputation requirements.
    const tobuy = new Array();
    let i = 0;
    while (i < aug_purchase_limit) {
        const aug = lowest_reputation(ns, fac_aug);
        tobuy.push(aug);
        fac_aug = fac_aug.filter(a => a != aug);
        if (0 == fac_aug.length) {
            break;
        }
        i++;
    }
    assert(tobuy.length > 0);
    return tobuy;
}

/**
 * Choose the most expensive Augmentation to buy.  Why should we buy the most
 * expensive Augmentation first?  The answer is simple.  After we have
 * purchased an Augmentation from a faction, the cost of each remaining
 * Augmentation is raised by a multiplier.  Had we not purchased the most
 * expensive Augmentation, its cost would now be much higher than previously.
 *
 * @param ns The Netscript API.
 * @param augment An array of Augmentation names.  Cannot be an empty array.
 * @return The name of the most expensive Augmentation from the given array.
 */
function choose_augmentation(ns, augment) {
    assert(augment.length > 0);
    let max = -Infinity;
    let aug = "";
    for (const a of augment) {
        const cost = Math.ceil(ns.singularity.getAugmentationPrice(a));
        if (max < cost) {
            max = cost;
            aug = a;
        }
    }
    assert("" != aug);
    return aug;
}

/**
 * Whether we have a given Augmentation.
 *
 * @param ns The Netscript API.
 * @param aug Check this Augmentation.
 * @return true if we have already purchased the given Augmentation;
 *     false otherwise.
 */
function has_augmentation(ns, aug) {
    const purchased = true;
    const augment = new Set(ns.singularity.getOwnedAugmentations(purchased));
    return augment.has(aug);
}

/**
 * Whether a string represents a valid faction name.
 *
 * @param fac A string representing a faction name.  Cannot be an empty string.
 * @return true if the given string represents a valid faction name;
 *     false otherwise.
 */
function is_valid_faction(fac) {
    assert(fac.length > 0);
    const faction = new Set(all_factions());
    return faction.has(fac);
}

/**
 * Determine an Augmentation that requires the least reputation points.
 *
 * @param ns The Netscript API.
 * @param augment An array of Augmentation names.  This array does not include
 *     the NeuroFlux Governor.
 * @return A string representing the name of an Augmentation that requires the
 *     lowest amount of reputation points.
 */
function lowest_reputation(ns, augment) {
    assert(augment.length > 0);
    assert(!augment.includes(nfg()));
    let min = Infinity;
    let min_aug = "";
    for (const aug of augment) {
        const rep = Math.ceil(ns.singularity.getAugmentationRepReq(aug));
        if (min > rep) {
            min = rep;
            min_aug = aug;
        }
    }
    assert("" != min_aug);
    return min_aug;
}

/**
 * A string representing the name of the NeuroFlux Governor Augmentation.
 */
function nfg() {
    return "NeuroFlux Governor";
}

/**
 * The number of Augmentations we have purchased.  This number only includes
 * those that have been bought and not yet installed.
 *
 * @param ns The Netscript API.
 * @return How many Augmentations we have bought and yet to install.
 */
function num_augmentations(ns) {
    const purchased = true;
    const no_purchased = !purchased;
    const owned_aug = ns.singularity.getOwnedAugmentations(no_purchased);
    const owned_bought_aug = ns.singularity.getOwnedAugmentations(purchased);
    assert(owned_bought_aug.length >= owned_aug.length);
    const npurchase = owned_bought_aug.length - owned_aug.length;
    return npurchase;
}

/**
 * All Augmentations we own and have already installed.
 *
 * @param ns The Netscript API.
 * @return A set of all Augmentations we own.  These Augmentations are already
 *     installed.
 */
export function owned_augmentations(ns) {
    const purchased = false;
    return new Set(ns.singularity.getOwnedAugmentations(purchased));
}

/**
 * All pre-requisites of an Augmentation.  Include only pre-requisites we have
 * not yet purchased.
 *
 * @param ns The Netscript API.
 * @param aug A string representing the name of an Augmentation.
 * @return An array of Augmentation names.  Each Augmentation in the array is a
 *     pre-requisite of the given Augmentation.  Return an empty array if the
 *     given Augmentation has no pre-requisites or we have already purchased
 *     all of its pre-requisites.
 */
function prerequisites(ns, aug) {
    assert("" != aug);
    const augment = new Array();
    const prereq = ns.singularity.getAugmentationPrereq(aug);
    if (0 == prereq.length) {
        return augment;
    }
    // An array of Augmentation names.
    for (const a of prereq) {
        if (has_augmentation(ns, a)) {
            continue;
        }
        augment.push(a);
    }
    return augment;
}

/**
 * Purchase all Augmentations from a faction.
 *
 * @param ns The Netscript API.
 * @param fac We want to buy all Augmentations from this faction.
 */
export async function purchase_augmentations(ns, fac) {
    assert(is_valid_faction(fac));
    let augment = augmentations_to_buy(ns, fac);
    assert(augment.length > 0);
    // Below is our purchasing strategy.
    //
    // (1) Purchase the most expensive Augmentation first.
    // (2) If an Augmentation has a pre-requisite that we have not yet bought,
    //     purchase the pre-requisite first.
    // (3) Leave the NeuroFlux Governor Augmentation to last.
    while (augment.length > 0) {
        if (num_augmentations(ns) >= aug_purchase_limit) {
            break;
        }
        // Choose the most expensive Augmentation.
        const aug = choose_augmentation(ns, augment);
        if (has_augmentation(ns, aug)) {
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
            const pre = choose_augmentation(ns, prereq);
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
        assert(ns.singularity.purchaseAugmentation(fac, nfg()));
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
        const pre = choose_augmentation(prereq);
        await purchase_aug(ns, pre, fac);
        prereq = prereq.filter(a => a != pre);
    }
    // Having purchased all pre-requisites of an Augmentation, now purchase
    // the Augmentation.
    let success = false;
    const t = new Time();
    const time = t.second();
    const cost = Math.ceil(ns.singularity.getAugmentationPrice(aug));
    while (!success) {
        assert(!has_augmentation(ns, aug));
        if (ns.getServerMoneyAvailable(home) < cost) {
            if (ns.getHackingLevel() < work_hack_lvl) {
                await commit_crime(ns, cost);
            } else {
                await work(ns, cost);
            }
        }
        await ns.sleep(time);
        success = ns.singularity.purchaseAugmentation(fac, aug);
    }
    assert(has_augmentation(ns, aug));
}
