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

// Miscellaneous helper functions related to factions.

import { all_factions, home } from "/lib/constant.js";
import { Player } from "/lib/player.js";
import { owned_augmentations } from "/lib/singularity.augmentation.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Wait for an invitation from the target faction.
 *
 * @param ns The Netscript API.
 * @param fac We want an invitation from this faction.
 */
async function await_invitation(ns, fac) {
    assert(is_valid_faction(fac));
    let invite = new Set(ns.singularity.checkFactionInvitations());
    const t = new Time();
    const time = 5 * t.second();
    while (!invite.has(fac)) {
        await ns.sleep(time);
        invite = new Set(ns.singularity.checkFactionInvitations());
    }
}

/**
 * Whether the given name represents a valid faction.
 *
 * @param fac A string representing the name of a faction.
 * @return true if the given name represents a valid faction;
 *     false otherwise.
 */
function is_valid_faction(fac) {
    assert(fac.length > 0);
    const faction = new Set(all_factions());
    return faction.has(fac);
}

/**
 * Join a faction.
 *
 * @param ns The Netscript API.
 * @param fac We want to join this faction.
 */
export async function join_faction(ns, fac) {
    assert(is_valid_faction(fac));
    // Unlike other megacorporation factions, we must be working for Fulcrum
    // Technologies while waiting for a faction invitation.  We can quit
    // working once we have joined the faction.
    if ("Fulcrum Secret Technologies" == fac) {
        const company = "Fulcrum Technologies";
        const field = "Software"
        const focus = true;
        ns.singularity.applyToCompany(company, field);
        ns.singularity.workForCompany(company, focus);
    }
    const player = new Player(ns);
    const joined_faction = new Set(player.faction());
    if (!joined_faction.has(fac)) {
        await await_invitation(ns, fac);
        ns.singularity.joinFaction(fac);
    }
    if ("Fulcrum Secret Technologies" == fac) {
        const company = "Fulcrum Technologies";
        ns.singularity.stopAction();
        ns.singularity.quitJob(company);
    }
}

/**
 * Raise each of our combat stats to a given level.  An easy way to raise our
 * combat stats is to join a faction and carry out field work for the faction.
 *
 * @param ns The Netscript API.
 * @param threshold Each of our combat stats should be raised to at least this
 *     value.  Must be a positive integer.
 */
export async function raise_combat_stats(ns, threshold) {
    assert(threshold > 0);
    // Join a faction.
    const player = new Player(ns);
    const joined_faction = player.faction();
    assert("Sector-12" == player.city());
    const target = "MegaCorp";
    if (!joined_faction.includes(target)) {
        await await_invitation(ns, target);
        ns.singularity.joinFaction(target);
    }
    // Perform field work for the faction.
    const work_type = "Field Work";
    const focus = true;
    const t = new Time();
    const time = t.minute();
    while (
        (player.strength() < threshold)
            || (player.defense() < threshold)
            || (player.dexterity() < threshold)
            || (player.agility() < threshold)
    ) {
        ns.singularity.workForFaction(target, work_type, focus);
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}

/**
 * Raise our Hack stat.  Stop when our Hack stat is at least a given level.
 *
 * @param ns The Netscript API.
 * @param threshold We want our Hack stat to be at least this level.  Must be a
 *     positive integer.
 */
export async function raise_hack(ns, threshold) {
    assert(threshold > 0);
    const player = new Player(ns);
    if (player.hacking_skill() >= threshold) {
        return;
    }
    // Join a faction.
    const joined_faction = player.faction();
    assert("Sector-12" == player.city());
    const target = "MegaCorp";
    if (!joined_faction.includes(target)) {
        await await_invitation(ns, target);
        ns.singularity.joinFaction(target);
    }
    // Carry out field work for the faction.
    const work_type = "Field Work";
    const focus = true;
    const t = new Time();
    const time = t.minute();
    while (player.hacking_skill() < threshold) {
        ns.singularity.workForFaction(target, work_type, focus);
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}

/**
 * The total amount of reputation points we need to earn in order to purchase
 * all Augmentations from a faction.
 *
 * @param ns The Netscript API.
 * @param fac We want to earn reputation points from this faction.
 * @return The maximum amount of reputation points we must earn from a faction.
 */
function total_reputation(ns, fac) {
    // A list of Augmentations from the faction.  Filter out those
    // Augmentations we already own and have installed.
    const my_aug = owned_augmentations(ns);
    let fac_aug = ns.singularity.getAugmentationsFromFaction(fac);
    fac_aug = fac_aug.filter(a => !my_aug.has(a));
    assert(fac_aug.length > 0);
    // The total reputation points we need to earn.
    let max = -Infinity;
    for (const aug of fac_aug) {
        const rep = ns.singularity.getAugmentationRepReq(aug);
        if (max < rep) {
            max = rep;
        }
    }
    return max;
}

/**
 * Work for a faction.  Stop working when we have accumulated enough reputation
 * points to purchase all Augmentations from the faction.
 *
 * @param ns The Netscript API.
 * @param fac We want to work for this faction.
 * @param work_type The type of work to carry out for the given faction.
 *     Either "Hacking Contracts" or "Field Work".
 */
export async function work_for_faction(ns, fac, work_type) {
    assert(is_valid_faction(fac));
    assert(("Hacking Contracts" == work_type) || ("Field Work" == work_type));
    const threshold = total_reputation(ns, fac);
    const focus = true;
    const t = new Time();
    const time = t.minute();
    while (ns.singularity.getFactionRep(fac) < threshold) {
        // Donate some money to the faction in exchange for reputation points.
        const amount = Math.floor(0.2 * ns.getServerMoneyAvailable(home));
        ns.singularity.donateToFaction(fac, amount);
        // Work for faction to raise reputation.
        ns.singularity.workForFaction(fac, work_type, focus);
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}
