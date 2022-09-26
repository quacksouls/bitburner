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

import { bool } from "/lib/constant/bool.js";
import { crimes } from "/lib/constant/crime.js";
import { factions, faction_req, faction_t } from "/lib/constant/faction.js";
import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { job_area } from "/lib/constant/work.js";
import { Player } from "/lib/player.js";
import { augment_to_buy } from "/lib/singularity/augment.js";
import { visit_city } from "/lib/singularity/network.js";
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
    while (!invite.has(fac)) {
        await ns.sleep(wait_t.DEFAULT);
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
function is_megacorp_faction(fac) {
    return factions.megacorp.includes(fac);
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
    if (is_megacorp_faction(fac)) {
        if ("Fulcrum Secret Technologies" == fac) {
            company = "Fulcrum Technologies";
        }
        ns.singularity.applyToCompany(company, job_area.SOFTWARE);
        ns.singularity.workForCompany(company, bool.FOCUS);
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
    if (is_megacorp_faction(fac)) {
        ns.singularity.stopAction();
        ns.singularity.quitJob(company);
    }
}

/**
 * Raise each of our combat stats to a given level.  An easy way to raise our
 * combat stats is to go to the slum of any city and either mug someone or
 * commit homicide.  Mugging yields more XP for all our combat stats than
 * homicide.  However, there are two reasons why we should choose homicide.
 * First, it yields more negative karma than mugging.  We need lots of negative
 * karma in order to create a gang.  Second, homicide yields more money than
 * mugging.  Commit homicide until we meet the requirements for receiving an
 * invitation from Slum Snakes.  Join Slum Snakes and perform Field Work for
 * the faction to rapidly raise all our combat stats.  Another option is to
 * join Tetrads and carry out Field Work for this other faction.  Choose Slum
 * Snakes or Tetrads, depending on whether we have a gang within the other
 * faction.  For example, if we have a gang within Slum Snakes, we are not
 * allowed to perform Field Work for Slum Snakes.  In that case, join Tetrads.
 *
 * @param ns The Netscript API.
 * @param threshold Each of our combat stats should be raised to at least this
 *     value.  Must be a positive integer.
 */
export async function raise_combat_stats(ns, threshold) {
    // Sanity checks.
    const tau = Math.ceil(threshold);
    assert(tau > 0);
    const player = new Player(ns);
    if (
        (player.strength() >= tau)
            && (player.defense() >= tau)
            && (player.dexterity() >= tau)
            && (player.agility() >= tau)
    ) {
        return;
    }
    // Commit homicide to raise all our combat stats.
    let target = "Slum Snakes";
    let city = "Sector-12";
    if (ns.gang.inGang()) {
        if (ns.gang.getGangInformation().faction == target) {
            target = "Tetrads";
            city = faction_req[target].city;
        }
    }
    await visit_city(ns, city);
    ns.singularity.commitCrime(crimes.KILL, bool.FOCUS);
    // Wait to receive an invitation from Slum Snakes (or Tetrads) and perform
    // Field Work for the faction.  Among the criminal organizations, Slum
    // Snakes has the lowest requirements.  Tetrads has slightly higher
    // requirements.
    const joined_faction = player.faction();
    if (!joined_faction.includes(target)) {
        await await_invitation(ns, target);
        ns.singularity.joinFaction(target);
    }
    ns.singularity.workForFaction(target, job_area.FIELD, bool.FOCUS);
    while (
        (player.strength() < tau)
            || (player.defense() < tau)
            || (player.dexterity() < tau)
            || (player.agility() < tau)
    ) {
        await ns.sleep(wait_t.DEFAULT);
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
    // Join a faction.  Choose from one of the early factions we should have
    // already joined.  See whether we can join one of them and perform
    // Hacking Contracts.
    const invite = new Set(ns.singularity.checkFactionInvitations());
    let target = "";
    for (const f of factions.early) {
        if (invite.has(f)) {
            target = f;
            ns.singularity.joinFaction(f);
            break;
        }
    }
    assert("" != target);
    // Carry out Hacking Contracts for the faction.
    ns.singularity.workForFaction(target, job_area.HACK, bool.FOCUS);
    while (player.hacking_skill() < threshold) {
        await ns.sleep(wait_t.DEFAULT);
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
    const augment = augment_to_buy(ns, fac);
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
    assert((job_area.HACK == work_type) || (job_area.FIELD == work_type));
    const threshold = total_reputation(ns, fac);
    ns.singularity.workForFaction(fac, work_type, bool.FOCUS);
    while (ns.singularity.getFactionRep(fac) < threshold) {
        // Donate some money to the faction in exchange for reputation points.
        const amount = Math.floor(
            faction_t.DONATE_MULT * ns.getServerMoneyAvailable(home)
        );
        ns.singularity.donateToFaction(fac, amount);
        await ns.sleep(wait_t.DEFAULT);
    }
    ns.singularity.stopAction();
}
