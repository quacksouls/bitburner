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

import {
    armour, gang_aug_crime, max_gangster, vehicle, weapon
} from "/lib/constant.js";
import { Gangster } from "/lib/gangster.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Ascend a gang member.  Ascension provides a permanent boost to a member's
 * stat multipliers.  However, the costs include:
 *
 * (1) Reset the member's progress and stats.
 * (2) Lose all non-Augmentation equipment.
 * (3) Lose all respect points gained by the member.  The respect points gained
 *     by this member will be deducted from your total respect.
 *
 * @param ns The Netscript API.
 */
function ascend(ns) {
    const member = ns.gang.getMemberNames();
    if (0 == member.length) {
        return;
    }
    const gangster = new Gangster(ns);
    member.map(
        s => gangster.ascend(s)
    );
}

/**
 * The threshold for the combat stats that any new recruit must attain.  Each
 * new recruit is immediately assigned to train their combat stats.  They
 * graduate out of training after their combat stats are at least this
 * threshold.
 */
function combat_threshold() {
    return 15;
}

/**
 * Create a gang within the given criminal organization.
 *
 * @param ns The Netscript API.
 * @param fac A string representing the name of a criminal organization.
 */
function create_gang(ns, fac) {
    assert(is_valid_faction(fac));
    if (ns.gang.inGang()) {
        return;
    }
    assert(ns.gang.createGang(fac));
}

/**
 * Attempt to equip each gang member with each of the following:
 *
 * (1) Augmentation
 * (2) weapon
 * (3) armour
 * (4) vehicle
 *
 * If a gang member already has an Augmentation, weapon, armour, or vehicle
 * then we attempt to give them another piece of equipment.  Our attempt can
 * succeed or fail, depending on whether we have sufficient funds to purchase
 * equipment.
 *
 * @param ns The Netscript API.
 */
function equip(ns) {
    const gangster = new Gangster(ns);
    for (const s of ns.gang.getMemberNames()) {
        // Always try to first purchase an Augmentation because the effects of
        // Augmentations are persistent after an ascension.
        for (const aug of Object.values(gang_aug_crime)) {
            if (!gangster.has_augment(s, aug)) {
                const success = gangster.equip_augment(s, aug);
                if (success) {
                    break;
                }
            }
        }
        // Try to equip a new weapon.
        for (const wpn of Object.values(weapon)) {
            if (!gangster.has_weapon(s, wpn)) {
                const success = gangster.equip_weapon(s, wpn);
                if (success) {
                    break;
                }
            }
        }
        // Try to equip a new armour piece.
        for (const amr of Object.values(armour)) {
            if (!gangster.has_armour(s, amr)) {
                const success = gangster.equip_armour(s, amr);
                if (success) {
                    break;
                }
            }
        }
        // Try to equip a new vehicle.
        for (const vhc of Object.values(vehicle)) {
            if (!gangster.has_vehicle(s, vhc)) {
                const success = gangster.equip_vehicle(s, vhc);
                if (success) {
                    break;
                }
            }
        }
    }
}

/**
 * Whether the given string represents the name of a criminal organization
 * within which we can create a criminal gang.
 *
 * @param fac A string representing the name of a criminal organization.
 * @return true if we can create a criminal gang within the given faction;
 *     false otherwise.
 */
function is_valid_faction(fac) {
    assert(fac.length > 0);
    const organization = [
        "Slum Snakes",
        "Speakers for the Dead",
        "Tetrads",
        "The Dark Army",
        "The Syndicate"
    ];
    return organization.includes(fac);
}

/**
 * Recruit as many new members as possible.  Set the newbies to train their
 * combat stats.  After graduating from training, assign the newbies to mug
 * random people on the streets.
 *
 * @param ns The Netscript API.
 */
async function recruit(ns) {
    const gangster = new Gangster(ns);
    let newbie = [];
    if (ns.gang.getMemberNames().length < max_gangster) {
        newbie = gangster.recruit();
        await gangster.train_combat(newbie, combat_threshold());
    }
    gangster.mug(newbie);
}

/**
 * Train the combat stats of other members as necessary.  Once they graduate,
 * get them to start generating some income.
 *
 * @param ns The Netscript API.
 */
async function retrain(ns) {
    const member = new Array();
    const gangster = new Gangster(ns);
    for (const s of ns.gang.getMemberNames()) {
        if (
            (gangster.strength(s) < combat_threshold())
                || (gangster.defense(s) < combat_threshold())
                || (gangster.dexterity(s) < combat_threshold())
                || (gangster.agility(s) < combat_threshold())
        ) {
            member.push(s);
        }
    }
    await gangster.train_combat(member, combat_threshold());
    gangster.mug(member);
}

/**
 * Manage our criminal gang.
 *
 * @param ns The Netscript API.
 */
async function update(ns) {
    // Ascend a gang member before we spend any more money on them.  After the
    // ascension, the member would lose all equipment and their stats would
    // reset.  We ascend the member now so down the pipeline we can retrain
    // and re-equip them.
    ascend(ns);
    await recruit(ns);
    await retrain(ns);
    equip(ns);
}

/**
 * Create and manage a criminal gang.  Our objective is to get a criminal gang
 * started.  We let members train their stats.  Once a member graduates out of
 * training, we set them to generate some money.  In the early stage of a
 * BitNode, we need as many sources of income as possible and a criminal gang
 * happens to be a source of revenue.
 *
 * This script accepts a command line argument, i.e. the name of the faction
 * within which to create a criminal gang.  The faction must be a criminal
 * organization.   We can create a criminal gang within any of the following
 * criminal organizations:
 *
 * (1) Slum Snakes
 * (2) Tetrads
 * (3) The Syndicate
 * (4) The Dark Army
 * (5) Speakers for the Dead
 *
 * Usage: run gang/crime.js [faction]
 * Example: run gang/crime.js "Slum Snakes"
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Suppress various log messages.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Sanity checks.
    if (ns.args.length != 1) {
        ns.tprint("Must provide the name of a criminal organization.");
        return;
    }
    const faction = ns.args[0];
    if (!is_valid_faction(faction)) {
        ns.tprint("Cannot create criminal gang within faction: " + faction);
        return;
    }
    // Create and manage a criminal gang.
    create_gang(ns, faction);
    const t = new Time();
    const time = t.second();
    while (true) {
        await update(ns);
        await ns.sleep(time);
    }
}
