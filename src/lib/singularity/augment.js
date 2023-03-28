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

/// ///////////////////////////////////////////////////////////////////////
// Miscellaneous helper functions related to Augmentations.
/// ///////////////////////////////////////////////////////////////////////

import { bool } from "/quack/lib/constant/bool.js";
import { augment } from "/quack/lib/constant/faction.js";
import { work_hack_lvl } from "/quack/lib/constant/misc.js";
import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";
import { commit_crime } from "/quack/lib/singularity/crime.js";
import { work } from "/quack/lib/singularity/work.js";
import { assert, is_valid_faction } from "/quack/lib/util.js";
import { trade_bot_resume, trade_bot_stop_buy } from "/quack/lib/wse.js";

/**
 * Augmentations we still need to purchase from a faction.  From all
 * Augmentations that are yet to be purchased, we choose n Augmentations where
 * one of these has reputation requirement higher than the remaining n - 1.  We
 * order the Augmentations from least reputation requirement to highest
 * reputation requirement and make our decision using this ascending list.  For
 * example, if n = 5 we would be purchasing the first 5 Augmentations that have
 * the lowest reputation requirements.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} fac We want to purchase all Augmentations from this faction.
 * @returns {array<string>} Augmentation names.  We do not yet have these
 *     Augmentations.  This array never includes the NeuroFlux Governor
 *     Augmentation.  An empty array if there are no Augmentations to buy from
 *     the given faction.
 */
export function augment_to_buy(ns, fac) {
    assert(is_valid_faction(fac));

    // All Augmentations we have not yet purchased from the given faction.
    // Exclude the NeuroFlux Governor.
    const owned_aug = new Set(
        ns.singularity.getOwnedAugmentations(bool.PURCHASED)
    );
    let fac_aug = ns.singularity.getAugmentationsFromFaction(fac);
    fac_aug = fac_aug
        .filter((a) => !owned_aug.has(a))
        .filter((b) => b !== augment.NFG);
    if (fac_aug.length === 0) {
        return [];
    }

    // Choose n Augmentations that have the least reputation requirements.
    const tobuy = [];
    let i = 0;
    while (i < augment.BUY_TAU) {
        const aug = lowest_reputation(ns, fac_aug);
        tobuy.push(aug);
        fac_aug = fac_aug.filter((a) => a !== aug);
        if (fac_aug.length === 0) {
            break;
        }
        i++;
    }
    assert(tobuy.length > 0);
    return tobuy;
}

/**
 * Augmentations we have purchased and are yet to be installed.
 *
 * @param {NS} ns The Netscript API.
 * @returns {array<string>} Augmentation names.  These are Augmentations we have
 *     bought, but we have not yet installed them.  Can be an empty array.
 */
export function augment_to_install(ns) {
    const purchased_aug = ns.singularity.getOwnedAugmentations(bool.PURCHASED);
    const installed_aug = owned_augment(ns);
    return purchased_aug.filter((a) => !installed_aug.has(a));
}

/**
 * Choose the most expensive Augmentation to buy.  Why should we buy the most
 * expensive Augmentation first?  The answer is simple.  After we have
 * purchased an Augmentation from a faction, the cost of each remaining
 * Augmentation is raised by a multiplier.  Had we not purchased the most
 * expensive Augmentation, its cost would now be much higher than previously.
 *
 * @param {NS} ns The Netscript API.
 * @param {array<string>} candidate Augmentation names.  Cannot be empty array.
 * @returns {string} The name of the most expensive Augmentation from the given
 *     array.
 */
export function choose_augment(ns, candidate) {
    assert(candidate.length > 0);
    let max = -Infinity;
    let aug = "";
    for (const a of candidate) {
        const cost = Math.ceil(ns.singularity.getAugmentationPrice(a));
        if (max < cost) {
            max = cost;
            aug = a;
        }
    }
    assert(aug !== "");
    return aug;
}

/**
 * Whether we have a given Augmentation.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} aug Check this Augmentation.
 * @returns {boolean} True if we have already purchased the given Augmentation;
 *     false otherwise.
 */
export function has_augment(ns, aug) {
    const candidate = new Set(
        ns.singularity.getOwnedAugmentations(bool.PURCHASED)
    );
    return candidate.has(aug);
}

/**
 * Determine an Augmentation that requires the least reputation points.
 *
 * @param {NS} ns The Netscript API.
 * @param {array<string>} candidate Augmentation names.  This array does not
 *     include the NeuroFlux Governor.
 * @returns {string} The name of an Augmentation that requires the lowest amount
 *     of reputation points.
 */
function lowest_reputation(ns, candidate) {
    assert(candidate.length > 0);
    assert(!candidate.includes(augment.NFG));
    let min = Infinity;
    let min_aug = "";
    for (const aug of candidate) {
        const rep = Math.ceil(ns.singularity.getAugmentationRepReq(aug));
        if (min > rep) {
            min = rep;
            min_aug = aug;
        }
    }
    assert(min_aug !== "");
    return min_aug;
}

/**
 * The number of Augmentations we have purchased.  This number only includes
 * those that have been bought and not yet installed.
 *
 * @param {NS} ns The Netscript API.
 * @returns {number} How many Augmentations we have bought and yet to install.
 */
function num_augment(ns) {
    const owned_aug = ns.singularity.getOwnedAugmentations(bool.NOT_PURCHASED);
    const owned_bought_aug = ns.singularity.getOwnedAugmentations(
        bool.PURCHASED
    );
    assert(owned_bought_aug.length >= owned_aug.length);
    const npurchase = owned_bought_aug.length - owned_aug.length;
    return npurchase;
}

/**
 * All Augmentations we own and have already installed.
 *
 * @param {NS} ns The Netscript API.
 * @returns {set} A set of all Augmentations we own.  These Augmentations are
 *     already installed.
 */
export function owned_augment(ns) {
    return new Set(ns.singularity.getOwnedAugmentations(bool.NOT_PURCHASED));
}

/**
 * All pre-requisites of an Augmentation.  Include only pre-requisites we have
 * not yet purchased.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} aug The name of an Augmentation.
 * @returns {array} Augmentation names.  Each Augmentation in the array is a
 *     pre-requisite of the given Augmentation.  Return an empty array if the
 *     given Augmentation has no pre-requisites or we have already purchased
 *     all of its pre-requisites.
 */
export function prerequisites(ns, aug) {
    assert(aug !== "");
    const prereq = ns.singularity.getAugmentationPrereq(aug);
    if (prereq.length === 0) {
        return [];
    }
    return prereq.filter((a) => !has_augment(ns, a));
}

/**
 * Purchase a bunch of Augmentations from a faction.  Buying Augmentations can
 * be expensive.  If our trade bot is running, tell it to stop buying and start
 * selling all shares.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} fac We want to buy Augmentations from this faction.
 * @param {boolean} stop_trade Whether the trade bot should stop buying shares.
 * @param {boolean} buy_nfg Whether to upgrade the NeuroFlux Governor
 *     Augmentation.
 * @param {boolean} raise_money Whether we should raise funds to buy
 *     Augmentations.  We can raise funds by working at a company or committing
 *     crimes.
 */
export async function purchase_augment(
    ns,
    fac,
    stop_trade,
    buy_nfg,
    raise_money
) {
    // Sanity checks.
    assert(is_valid_faction(fac));
    let candidate = augment_to_buy(ns, fac);
    if (candidate.length === 0) {
        return;
    }

    // Tell the trade bot to stop buying shares of stocks.  We want to cash in
    // on our shares and raise money to buy Augmentations.
    if (stop_trade) {
        await trade_bot_stop_buy(ns);
    }

    // Below is our purchasing strategy.
    //
    // (1) Purchase the most expensive Augmentation first.
    // (2) If an Augmentation has a pre-requisite that we have not yet bought,
    //     purchase the pre-requisite first.
    // (3) Leave the NeuroFlux Governor Augmentation to last.
    const fac_aug = new Set(ns.singularity.getAugmentationsFromFaction(fac));
    const fac_has_aug = (a) => fac_aug.has(a);
    while (candidate.length > 0) {
        if (num_augment(ns) >= augment.BUY_TAU) {
            break;
        }

        // Choose the most expensive Augmentation.
        const aug = choose_augment(ns, candidate);
        if (has_augment(ns, aug)) {
            candidate = candidate.filter((a) => a !== aug);
            continue;
        }

        // If the most expensive Augmentation has no pre-requisites or we have
        // already purchased all of its pre-requisites, then purchase the
        // Augmentation.
        let prereq = prerequisites(ns, aug);
        if (prereq.length === 0) {
            await purchase_aug(ns, aug, fac, raise_money);
            candidate = candidate.filter((a) => a !== aug);
            continue;
        }

        // If the Augmentation has one or more pre-requisites we have not yet
        // purchased, then first purchase the pre-requisites.  Ensure that the
        // faction has the pre-requisites as well.
        if (!prereq.every(fac_has_aug)) {
            candidate = candidate.filter((a) => a !== aug);
            continue;
        }
        while (prereq.length > 0) {
            const pre = choose_augment(ns, prereq);
            await purchase_aug(ns, pre, fac, raise_money);
            prereq = prereq.filter((a) => a !== pre);
        }
        await purchase_aug(ns, aug, fac, raise_money);
        candidate = candidate.filter((a) => a !== aug);
    }

    // Level up the NeuroFlux Governor Augmentation as high as our funds allows.
    if (buy_nfg) {
        let cost = Math.ceil(ns.singularity.getAugmentationPrice(augment.NFG));
        let nfg_rep = Math.ceil(
            ns.singularity.getAugmentationRepReq(augment.NFG)
        );
        let fac_rep = Math.floor(ns.singularity.getFactionRep(fac));
        let money = ns.getServerMoneyAvailable(home);
        while (cost <= money && nfg_rep <= fac_rep) {
            assert(ns.singularity.purchaseAugmentation(fac, augment.NFG));
            cost = Math.ceil(ns.singularity.getAugmentationPrice(augment.NFG));
            nfg_rep = Math.ceil(
                ns.singularity.getAugmentationRepReq(augment.NFG)
            );
            fac_rep = Math.floor(ns.singularity.getFactionRep(fac));
            money = ns.getServerMoneyAvailable(home);
        }
    }

    // The trade bot can now resume buying and selling shares.
    if (stop_trade) {
        trade_bot_resume(ns);
    }
}

/**
 * Purchase an Augmentation.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} aug We want to purchase this Augmentation.
 * @param {string} fac We want to purchase the Augmentation from this faction.
 * @param {boolean} raise_money Whether we should raise funds to buy the given
 *     Augmentation.  Raise funds by working at a company or committing crimes.
 */
async function purchase_aug(ns, aug, fac, raise_money) {
    // Purchase any pre-requisites first.
    let prereq = prerequisites(ns, aug);
    while (prereq.length > 0) {
        const pre = choose_augment(ns, prereq);
        await purchase_aug(ns, pre, fac, raise_money);
        prereq = prereq.filter((a) => a !== pre);
    }

    // Having purchased all pre-requisites of an Augmentation, now purchase
    // the Augmentation.
    let success = false;
    const cost = Math.ceil(ns.singularity.getAugmentationPrice(aug));
    while (!success) {
        if (has_augment(ns, aug)) {
            break;
        }
        if (ns.getServerMoneyAvailable(home) < cost) {
            if (raise_money) {
                if (ns.getHackingLevel() < work_hack_lvl) {
                    log(ns, `Raising Hack stat to target: ${work_hack_lvl}`);
                    await commit_crime(ns, cost);
                } else {
                    log(
                        ns,
                        `Raising money to target: ${ns.nFormat(
                            cost,
                            "$0,0.00a"
                        )}`
                    );
                    await work(ns, cost);
                }
            }
        }
        await ns.sleep(wait_t.SECOND);
        success = ns.singularity.purchaseAugmentation(fac, aug);
    }
    assert(has_augment(ns, aug));
    log(ns, `Purchased ${aug} from ${fac}`);
}
