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

import { factions } from "/lib/constant/faction.js";
import { home } from "/lib/constant/server.js";
import { Player } from "/lib/player.js";
import { augmentations_to_buy } from "/lib/singularity/augment.js";
import { Time } from "/lib/time.js";
import { assert, is_valid_faction } from "/lib/util.js";

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
 * Whether a given faction is a megacorporation faction.
 *
 * @param fac The name of a faction.
 * @return true if the given faction is a megacorporation faction;
 *     false otherwise.
 */
function is_megacorporation_faction(fac) {
    const faction = [
        "Bachman & Associates", "Blade Industries", "Clarke Incorporated",
        "ECorp", "Four Sigma", "Fulcrum Secret Technologies",
        "KuaiGong International", "MegaCorp", "NWO", "OmniTek Incorporated"
    ];
    return faction.includes(fac);
}

/**
 * Join as many factions as we can.  We typically do this to raise our
 * Intelligence stat.  Call this function prior to installing one or more
 * Augmentations, or before hacking the w0r1d_d43m0n server.
 */
export function join_all_factions(ns) {
    const invite = new Set(ns.singularity.checkFactionInvitations());
    for (const f of Array.from(factions)) {
        if (invite.has(f)) {
            ns.singularity.joinFaction(f);
        }
    }
}

/**
 * Join a faction.
 *
 * @param ns The Netscript API.
 * @param fac We want to join this faction.
 */
export async function join_faction(ns, fac) {
    assert(is_valid_faction(fac));
    // Since version 2.0 of the game, we must be working for a megacorporation
    // while waiting for an invitation from the corresponding faction.  We can
    // quit working once we have joined the faction.
    let company = fac;
    if (is_megacorporation_faction(fac)) {
        if ("Fulcrum Secret Technologies" == fac) {
            company = "Fulcrum Technologies";
        }
        const field = "Software";
        const focus = true;
        ns.singularity.applyToCompany(company, field);
        ns.singularity.workForCompany(company, focus);
        ns.singularity.setFocus(focus);
    }
    // Join the faction.
    const player = new Player(ns);
    const joined_faction = new Set(player.faction());
    if (!joined_faction.has(fac)) {
        await await_invitation(ns, fac);
        ns.singularity.joinFaction(fac);
    }
    // We are a member of the target faction.  Quit working for the
    // corresponding megacorporation.
    if (is_megacorporation_faction(fac)) {
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
    // You can join a particular company by being anywhere in the game world.
    // You do not have to be in the city where the company is located.
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
    ns.singularity.workForFaction(target, work_type, focus);
    while (
        (player.strength() < threshold)
            || (player.defense() < threshold)
            || (player.dexterity() < threshold)
            || (player.agility() < threshold)
    ) {
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
    ns.singularity.workForFaction(target, work_type, focus);
    while (player.hacking_skill() < threshold) {
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}

/**
 * The total amount of reputation points we need to earn in order to purchase
 * some Augmentations from a faction.  This is not necessarily the highest
 * reputation requirement of any Augmentation.
 *
 * @param ns The Netscript API.
 * @param fac We want to earn reputation points from this faction.
 * @return The maximum amount of reputation points we must earn from a faction.
 */
function total_reputation(ns, fac) {
    const augment = augmentations_to_buy(ns, fac);
    assert(augment.length > 0);
    // The total reputation points we need to earn.
    let max = -Infinity;
    for (const aug of augment) {
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
    ns.singularity.workForFaction(fac, work_type, focus);
    while (ns.singularity.getFactionRep(fac) < threshold) {
        // Donate some money to the faction in exchange for reputation points.
        const amount = Math.floor(0.2 * ns.getServerMoneyAvailable(home));
        ns.singularity.donateToFaction(fac, amount);
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}
