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

import { all_programs, exclusive_aug, home } from "/lib/constant.js";
import { join_all_factions } from "/lib/singularity.faction.js";
import { assert, has_program } from "/lib/util.js";

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
 * Purchase any remaining programs via the dark web.  At this stage, we do not
 * need any more programs to help us with our hacking and faction work.  We buy
 * the remaining programs to help raise our Intelligence XP.
 */
function buy_programs(ns) {
    for (const p of all_programs().keys()) {
        if (has_program(ns, p)) {
            continue;
        }
        const money = ns.getServerMoneyAvailable(home);
        const cost = ns.singularity.getDarkwebProgramCost(p);
        if (money < cost) {
            continue;
        }
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
    // Raise some more Intelligence XP.
    join_all_factions(ns);
    buy_exclusive_augmentations(ns);
    buy_programs(ns);
    // Install all Augmentations and soft reset.
    install(ns);
}
