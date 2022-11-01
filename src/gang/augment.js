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

import { augment } from "/lib/constant/faction.js";
import { colour } from "/lib/constant/misc.js";
import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { log } from "/lib/io.js";
import { Player } from "/lib/player.js";
import { owned_augment } from "/lib/singularity/augment.js";
import { has_gang_api } from "/lib/source.js";
import { assert } from "/lib/util.js";

/**
 * Purchase Augmentations from our gang faction.
 *
 * @param ns The Netscript API.
 */
async function buy_augment(ns) {
    // Sanity check.
    const aug = choose_augment(ns);
    if (aug.length === 0) {
        return;
    }
    // Accumulate enough money to purchase Augmentations.
    const player = new Player(ns);
    while (aug.length > 0) {
        const a = aug.pop();
        const { faction } = ns.gang.getGangInformation();
        const fac_rep = Math.floor(ns.singularity.getFactionRep(faction));
        const rep = Math.ceil(ns.singularity.getAugmentationRepReq(a));
        const cost = Math.ceil(ns.singularity.getAugmentationPrice(a));
        while (player.money() < cost || fac_rep < rep) {
            await ns.sleep(wait_t.DEFAULT);
        }
        assert(player.money() >= cost);
        assert(fac_rep >= rep);
        assert(ns.singularity.purchaseAugmentation(faction, a));
    }
}

/**
 * Choose the cheapest Augmentation to purchase.  We skip over an Augmentation
 * that has pre-requisites.
 *
 * @param ns The Netscript API.
 * @param candidate Choose from among this array of Augmentation names.
 * @return The cheapest Augmentation.  Can be an empty string.
 */
function cheapest_augment(ns, candidate) {
    assert(candidate.length > 0);
    let min = Infinity;
    let aug = "";
    candidate.forEach((a) => {
        const prereq = ns.singularity.getAugmentationPrereq(a);
        if (prereq.length > 0) {
            return;
        }
        const cost = Math.ceil(ns.singularity.getAugmentationPrice(a));
        if (min > cost) {
            min = cost;
            aug = a;
        }
    });
    return aug;
}

/**
 * Choose a number of cheapest Augmentations from our gang faction.
 *
 * @param ns The Netscript API.
 * @return An array of Augmentation names.  An empty array if there are no more
 *     Augmentations to be bought from our gang faction.  Going from left to
 *     right, the Augmentations in the array are sorted from cheapest to most
 *     expensive.
 */
function choose_augment(ns) {
    // Augmentations to exclude.
    const installed = owned_augment(ns);
    // Other Augmentations available from our gang faction.
    const { faction } = ns.gang.getGangInformation();
    let aug = ns.singularity
        .getAugmentationsFromFaction(faction)
        .filter((a) => a !== augment.TRP)
        .filter((b) => !installed.includes(b));
    if (aug.length <= augment.BUY_TAU) {
        // TODO: Sort this array in ascending order of price.
        return aug;
    }
    // Determine a bunch of cheapest Augmentations.
    const candidate = [];
    const ntry = 10;
    for (let i = 0; i < ntry; i++) {
        if (candidate.length >= augment.BUY_TAU) {
            break;
        }
        const a = cheapest_augment(ns, aug);
        if (a === "") {
            continue;
        }
        candidate.push(a);
        aug = aug.filter((b) => b !== a);
    }
    assert(candidate.length > 0);
    return candidate;
}

/**
 * Purchase Augmentations from the faction in which we created a gang.
 *
 * Usage: run gang/augment.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Less verbose log.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Sanity check.
    if (!has_gang_api(ns)) {
        log(ns, "No access to Gang API", colour.RED);
        return;
    }
    // The update loop.
    while (!ns.gang.inGang()) {
        await ns.sleep(wait_t.DEFAULT);
    }
    await buy_augment(ns);
    // The next script in the load chain.
    const script = "/singularity/home.js";
    const nthread = 1;
    ns.exec(script, home, nthread);
}
