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

import { bool } from "/lib/constant/bool.js";
import {
    armour,
    gang_aug_crime,
    gang_t,
    members,
    penalty_t,
    task_t,
    vehicle,
    weapon,
} from "/lib/constant/gang.js";
import { wait_t } from "/lib/constant/time.js";
import { Gangster } from "/lib/gang/gangster.js";
import {
    reassign_vigilante,
    strongest_member,
} from "/lib/gang/util.js";
import { Player } from "/lib/player.js";
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
 * Marshall our forces on the border and be ready for war.
 *
 * @param ns The Netscript API.
 */
function casus_belli(ns) {
    assert(ns.gang.getGangInformation().territoryWarfareEngaged);
    assert(has_max_members(ns));
    const gangster = new Gangster(ns);
    gangster.turf_war(ns.gang.getMemberNames());
}

/**
 * Create a gang within the given criminal organization.  If we are in a
 * BitNode other than BN2.x, we must have a certain amount of negative karma
 * as a pre-requisite for creating a gang.
 *
 * @param ns The Netscript API.
 * @param fac A string representing the name of a criminal organization.
 */
async function create_gang(ns, fac) {
    assert(is_valid_faction(fac));
    if (ns.gang.inGang()) {
        return;
    }
    const player = new Player(ns);
    while (player.karma() > gang_t.KARMA) {
        await ns.sleep(wait_t.MINUTE);
    }
    assert(ns.gang.createGang(fac));
}

/**
 * Re-assign gang members to various tasks that help to lower our penalty.
 * Choose a number of our best gangsters and set them to vigilante justice.
 * The remaining members are given jobs that attract less wanted levels than
 * their current jobs.
 *
 * @param ns The Netscript API.
 */
function decrease_penalty(ns) {
    reassign_vigilante(ns, members.VIGILANTE);
    const name = new Array();
    const gangster = new Gangster(ns);
    for (const s of ns.gang.getMemberNames()) {
        if (gangster.is_vigilante(s)) {
            continue;
        }
        if (gangster.needs_training(s)) {
            gangster.train_combat([s]);
            continue;
        }
        name.push(s);
    }
    graduate(ns);
    gangster.extort(name);
}

/**
 * Whether to engage in territory warfare against a rival gang.  By default,
 * we do not engage in turf warfare.  However, we enable turf warfare provided
 * that the following conditions are satisfied:
 *
 * (1) We have the maximum number of gang members.
 * (2) Our chance of winning against a rival gang is at least 75%.
 *
 * However, if our gang already has taken over 100% of the territory, then
 * there is no need to engage in turf warfare.
 *
 * @param ns The Netscript API.
 * @return true if we are to engage in territory warfare against another gang;
 *     false otherwise.
 */
function enable_turf_war(ns) {
    if (has_all_turf(ns)) {
        return bool.NO_WAR;
    }
    if (has_max_members(ns) && (min_victory_chance(ns) >= gang_t.WIN)) {
        return bool.WAR;
    }
    return bool.NO_WAR;
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
            if (gangster.has_augment(s, aug)) {
                continue;
            }
            const success = gangster.equip_augment(s, aug);
            if (success) {
                break;
            }
        }
        // Try to equip a new weapon.
        for (const wpn of Object.values(weapon)) {
            if (gangster.has_weapon(s, wpn)) {
                continue;
            }
            const success = gangster.equip_weapon(s, wpn);
            if (success) {
                break;
            }
        }
        // Try to equip a new armour piece.
        for (const amr of Object.values(armour)) {
            if (gangster.has_armour(s, amr)) {
                continue;
            }
            const success = gangster.equip_armour(s, amr);
            if (success) {
                break;
            }
        }
        // Try to equip a new vehicle.
        for (const vhc of Object.values(vehicle)) {
            if (gangster.has_vehicle(s, vhc)) {
                continue;
            }
            const success = gangster.equip_vehicle(s, vhc);
            if (success) {
                break;
            }
        }
    }
}

/**
 * Once a new member has completed their training, graduate and assign them
 * their first job.
 *
 * @param ns The Netscript API.
 */
function graduate(ns) {
    const member = ns.gang.getMemberNames();
    const gangster = new Gangster(ns);
    gangster.graduate_combatant(member, task_t.COMBAT);
    gangster.graduate_hacker(member, task_t.HACK);
    gangster.graduate_other(member, task_t.CHARISMA);
}

/**
 * Whether our gang already controls 100% of the territory.
 *
 * @param ns The Netscript API.
 * @return true if we already have control over 100% of the territory;
 *     false otherwise.
 */
function has_all_turf(ns) {
    return ns.gang.getGangInformation().territory >= 1;
}

/**
 * Whether we have the maximum number of members in our gang.
 *
 * @param ns The Netscript API.
 * @return true if our gang is at capacity; false otherwise.
 */
function has_max_members(ns) {
    return members.MAX == ns.gang.getMemberNames().length;
}

/**
 * Whether any of our gang members are currently committing acts of terrorism.
 *
 * @param ns The Netscript API.
 * @return true if at least one gang member is committing acts of terrorism;
 *     false otherwise.
 */
function has_terrorist(ns) {
    const gangster = new Gangster(ns);
    for (const s of ns.gang.getMemberNames()) {
        if (gangster.is_terrorist(s)) {
            return true;
        }
    }
    return false;
}

/**
 * Whether any of our gang members are currently on vigilante justice.
 *
 * @param ns The Netscript API.
 * @return true if at least one gang member is currently assigned to vigilante
 *     justice; false otherwise.
 */
function has_vigilante(ns) {
    const gangster = new Gangster(ns);
    for (const s of ns.gang.getMemberNames()) {
        if (gangster.is_vigilante(s)) {
            return true;
        }
    }
    return false;
}

/**
 * Whether our gang is engaged in turf warfare.
 *
 * @param ns The Netscript API.
 * @return true if our gang is engaged in turf warfare against a rival gang;
 *     false otherwise.
 */
function is_in_war(ns) {
    if (!ns.gang.getGangInformation().territoryWarfareEngaged) {
        return false;
    }
    const gangster = new Gangster(ns);
    const warrior = ns.gang.getMemberNames().filter(
        s => gangster.is_warrior(s)
    );
    return warrior.length == members.MAX;
}

/**
 * Whether we are currently in a new tick.  Each tick lasts for approximately
 * the time period as defined by the constant gang_t.TICK.  At the start of
 * each tick, there is a chance for our gang to clash against a rival gang.
 *
 * @param ns The Netscript API.
 * @param other An object containing information about other gangs.  The data
 *     in the object should be from the previous tick.
 * @return true if we are in a new tick; false otherwise.
 */
function is_new_tick(ns, other) {
    const current = ns.gang.getOtherGangInformation();
    for (const g of Object.keys(current)) {
        if (
            (current[g].power != other[g].power)
                || (current[g].territory != other[g].territory)
        ) {
            return bool.NEW;
        }
    }
    return bool.NOT_NEW;
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
 * The maximum number of gang members to re-assign to acts of terrorism.  We
 * usually assign members to acts of terrorism because this task greatly
 * increases respect, which in turn helps to recruit new members.  However, if
 * we already have the maximum number of members, there is no reason to have
 * any terrorists around.
 *
 * @param ns The Netscript API.
 * @return An integer between 0 and the maximum number of members we can have
 *     in our gang.
 */
function max_terrorist(ns) {
    if (has_max_members(ns)) {
        return 0;
    }
    return 1;
}

/**
 * The minimum chance of winning a clash against any rival gang.  The chance is
 * reported as an integer percentage.  For example, if our chance to win a
 * clash is 0.6879, we convert this to the percentage of 68.79 and take only
 * the integer part, which in this case is 68%.
 *
 * @param ns The Netscript API.
 * @return The minimum chance as an integer percentage of winning a clash
 *     against any rival gang.
 */
function min_victory_chance(ns) {
    let chance = Infinity;
    const our_gang = ns.gang.getGangInformation().faction;
    const other_gang = ns.gang.getOtherGangInformation();
    for (const g of Object.keys(other_gang)) {
        if (our_gang == g) {
            continue;
        }
        chance = Math.min(chance, ns.gang.getChanceToWinClash(g));
    }
    return Math.floor(chance * 100);
}

/**
 * Si vis pacem, para bellum.  Make preparation to increase our power.  We do
 * not engage in turf warfare yet.  First, build our gang power.
 *
 * @param ns The Netscript API.
 */
function para_bellum(ns) {
    // If we already control 100% of the territory, there is no need to send
    // any gang member to turf warfare.
    if (has_all_turf(ns)) {
        return;
    }
    // We want at most members.WARRIOR members to be engaged in territory
    // warfare.  The remaining members should be in as high-paying jobs as
    // possible.
    const threshold = members.MAX - members.WARRIOR;
    // Not yet time to send gang members to turf warfare.
    const gangster = new Gangster(ns);
    const trafficker = ns.gang.getMemberNames().filter(
        s => gangster.is_arms_trafficker(s)
    );
    if (trafficker.length <= threshold) {
        return;
    }
    // Choose the strongest member and re-assign them to turf warfare.
    assert(trafficker.length > threshold);
    const best = strongest_member(ns, trafficker);
    gangster.turf_war([best]);
}

/**
 * The penalty p is defined as the ratio of the wanted level over our respect.
 * Multiply p by 100 and we see that the penalty expresses the wanted level as
 * a percentage of our respect.  Tasks that our gang members engage in would
 * take p percent longer as compared to when our wanted level is zero.  Note
 * that the wanted level can never be lower than 1.  Aim to keep the penalty p
 * below a certain fraction.
 *
 * @param ns The Netscript API.
 * @return The penalty as a percentage.
 */
function penalty(ns) {
    const wanted = ns.gang.getGangInformation().wantedLevel;
    const respect = ns.gang.getGangInformation().respect;
    const p = Math.floor(100 * (wanted / respect));
    assert(p >= 0);
    return p;
}

/**
 * Re-assign gang members to some other tasks.
 *
 * @param ns The Netscript API.
 */
function reassign(ns) {
    // Assign gang members with mid- to advanced-level stats to more
    // profitable jobs.
    reassign_extortion(ns, task_t.EXTORT, task_t.ROBBERY);
    reassign_robbery(ns, task_t.ROBBERY, task_t.TRAFFICK);
    // Try to have at least one gang member assigned to commit acts of
    // terrorism.  This should help to increase our respect so we can recruit
    // more members.  However, if we already have the maximum number of
    // gangsters, then there is no need to have anyone be terrorists.
    reassign_terrorism(ns, task_t.TERROR, Infinity);
    // Assign other high-level members to trafficking illegal arms.
    reassign_trafficking(ns, task_t.TRAFFICK, Infinity);
}

/**
 * Re-assign mid-level gang members to strongarm civilians on our turf.
 * Re-assign gang members if their Strength stat is in the half-open interval
 * [min, max).  That is, we include the minimum threshold but exclude the
 * maximum threshold.
 *
 * @param ns The Netscript API.
 * @param min The minimum value for the Strength stat.
 * @param max The maximum value for the Strength stat.
 */
function reassign_extortion(ns, min, max) {
    const member = new Array();
    const gangster = new Gangster(ns);
    for (const s of ns.gang.getMemberNames()) {
        if ((min <= gangster.strength(s)) && (gangster.strength(s) < max)) {
            member.push(s);
        }
    }
    gangster.extort(member);
}

/**
 * Re-assign above mid-level gang members to armed robbery.  Re-assign gang
 * members if their Strength stat is in the half-open interval [min, max).
 * That is, we include the minimum threshold but exclude the maximum threshold.
 *
 * @param ns The Netscript API.
 * @param min The minimum value for the Strength stat.
 * @param max The maximum value for the Strength stat.
 */
function reassign_robbery(ns, min, max) {
    const member = new Array();
    const gangster = new Gangster(ns);
    for (const s of ns.gang.getMemberNames()) {
        if ((min <= gangster.strength(s)) && (gangster.strength(s) < max)) {
            member.push(s);
        }
    }
    gangster.robbery(member);
}

/**
 * Re-assign advanced-level gang members to commit acts of terrorism.
 * Re-assign gang members if their Strength stat is in the half-open interval
 * [min, max).  That is, we include the minimum threshold but exclude the
 * maximum threshold.  Terrorism gains enormous respect, but zero income.  For
 * this reason, we should only assign a limited number of members to terrorism.
 * In case we already have the maximum number of members in our gang, there is
 * no need to assign anyone to commit acts of terrorism.
 *
 * @param ns The Netscript API.
 * @param min The minimum value for the Strength stat.
 * @param max The maximum value for the Strength stat.
 */
function reassign_terrorism(ns, min, max) {
    if (has_terrorist(ns) && !has_max_members(ns)) {
        return;
    }
    // We already have the maximum number of gang members.  Re-assign the
    // terrorists to trafficking illegal arms.
    const gangster = new Gangster(ns);
    if (has_max_members(ns)) {
        const name = ns.gang.getMemberNames().filter(
            s => gangster.is_terrorist(s)
        );
        gangster.traffick_arms(name);
        return;
    }
    assert(!has_terrorist(ns));
    assert(!has_max_members(ns));
    // Assign at most this many members to terrorism.
    const threshold = max_terrorist(ns);
    assert(threshold > 0);
    // Choose the members who would be re-assigned to terrorism.
    const member = new Array();
    for (const s of ns.gang.getMemberNames()) {
        if (gangster.is_warrior(s)) {
            continue;
        }
        if ((min <= gangster.strength(s)) && (gangster.strength(s) < max)) {
            member.push(s);
        }
        if (member.length >= threshold) {
            break;
        }
    }
    gangster.terrorism(member);
}

/**
 * Re-assign high-level gang members to trafficking illegal arms.  Re-assign
 * gang members if their Strength stat is in the half-open interval [min, max).
 * That is, we include the minimum threshold but exclude the maximum threshold.
 *
 * @param ns The Netscript API.
 * @param min The minimum value for the Strength stat.
 * @param max The maximum value for the Strength stat.
 */
function reassign_trafficking(ns, min, max) {
    const member = new Array();
    const gangster = new Gangster(ns);
    for (const s of ns.gang.getMemberNames()) {
        if (!has_all_turf(ns)) {
            if (gangster.is_terrorist(s) || gangster.is_warrior(s)) {
                continue;
            }
        }
        if ((min <= gangster.strength(s)) && (gangster.strength(s) < max)) {
            member.push(s);
        }
    }
    gangster.traffick_arms(member);
}

/**
 * Recruit as many new members as possible.  Set the newbies to train their
 * various stats.
 *
 * @param ns The Netscript API.
 */
function recruit(ns) {
    const gangster = new Gangster(ns);
    if (ns.gang.getMemberNames().length < members.MAX) {
        const newbie = gangster.recruit();
        gangster.train(newbie);
    }
}

/**
 * Train the combat stats of other members as necessary.
 *
 * @param ns The Netscript API.
 */
function retrain(ns) {
    const member = new Array();
    const gangster = new Gangster(ns);
    for (const s of ns.gang.getMemberNames()) {
        if (gangster.needs_training(s)) {
            member.push(s);
        }
    }
    gangster.train_combat(member);
}

/**
 * Manage our criminal gang.
 *
 * @param ns The Netscript API.
 */
function update(ns) {
    recruit(ns);
    // Do we have anyone on vigilante justice?
    if (has_vigilante(ns)) {
        if (penalty(ns) < penalty_t.LOW) {
            reassign(ns);
            return;
        }
    }
    // Is our penalty too high?  If our penalty percentage exceeds a given
    // threshold, then re-assign some gang members to vigilante justice in
    // order to lower our penalty.  Furthermore, re-assign the remaining
    // members to jobs that attract a lower wanted level.
    if (penalty(ns) >= penalty_t.HIGH) {
        decrease_penalty(ns);
        return;
    }
    // Ascend a gang member before we spend any more money on them.  After the
    // ascension, the member would lose all equipment and their stats would
    // reset.  We ascend the member now so down the pipeline we can retrain
    // and re-equip them.
    ascend(ns);
    // Some training and easy jobs for greenhorn gangsters.
    retrain(ns);
    graduate(ns);
    reassign(ns);
    equip(ns);
    // Prepare for war.
    para_bellum(ns);
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
    ns.disableLog("gang.setTerritoryWarfare");
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
    // Create our criminal gang and recruit the first crop of gangsters.  By
    // default, we disable territory warfare.  Instead, we concentrate on
    // recruitment and building the strengths of our gang members.
    await create_gang(ns, faction);
    ns.gang.setTerritoryWarfare(bool.DISABLE);
    recruit(ns);
    // Manage our gang.
    // A tick is a period of time as defined by the constant gang_t.TICK.  At
    // the start of each tick, there is a chance for our gang to clash against
    // any rival gang.  The tick threshold is the time near the start of a new
    // tick.  If we are at the tick threshold, then do whatever is necessary to
    // prepare for a clash against a rival gang.
    let other_gang = ns.gang.getOtherGangInformation();
    const gangster = new Gangster(ns);
    let tick_threshold = 1;
    while (true) {
        if (enable_turf_war(ns)) {
            if (!ns.gang.getGangInformation().territoryWarfareEngaged) {
                ns.gang.setTerritoryWarfare(bool.ENABLE);
            }
        } else {
            if (ns.gang.getGangInformation().territoryWarfareEngaged) {
                ns.gang.setTerritoryWarfare(bool.DISABLE);
            }
        }
        // Are we in a new tick?  If we are having a turf war, then let our
        // gang members fight until a new tick occurs.
        if (is_in_war(ns) && is_new_tick(ns, other_gang)) {
            // The tick threshold should be a little under gang_t.TICK.
            tick_threshold = Date.now() + (gang_t.TICK - wait_t.SECOND);
            other_gang = ns.gang.getOtherGangInformation();
            gangster.traffick_arms(ns.gang.getMemberNames());
            update(ns);
            await ns.sleep(wait_t.MILLISECOND);
            continue;
        }
        // We are in the same tick.  Is it time to go to war?
        if (Date.now() > tick_threshold) {
            if (ns.gang.getGangInformation().territoryWarfareEngaged) {
                casus_belli(ns);
                await ns.sleep(wait_t.MILLISECOND);
                continue;
            }
        }
        update(ns);
        await ns.sleep(wait_t.MILLISECOND);
    }
}
