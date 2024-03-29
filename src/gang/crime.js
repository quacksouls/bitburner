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

import { MyArray } from "/quack/lib/array.js";
import { bool } from "/quack/lib/constant/bool.js";
import {
    armour,
    gang_augment,
    gang_t,
    members,
    penalty_t,
    rootkit,
    task_t,
    vehicle,
    weapon,
} from "/quack/lib/constant/gang.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { Gangster } from "/quack/lib/gang/gangster.js";
import { reassign_vigilante, strongest_member } from "/quack/lib/gang/util.js";
import { log } from "/quack/lib/io.js";
import { is_ghost_of_wall_street } from "/quack/lib/source.js";
import { assert } from "/quack/lib/util.js";

/**
 * Ascend a gang member.  Ascension provides a permanent boost to a member's
 * stat multipliers.  However, the costs include:
 *
 * (1) Reset the member's progress and stats.
 * (2) Lose all non-Augmentation equipment.
 * (3) Lose all respect points gained by the member.  The respect points gained
 *     by this member will be deducted from our total respect.
 *
 * @param {NS} ns The Netscript API.
 */
function ascend(ns) {
    const member = ns.gang.getMemberNames();
    if (MyArray.is_empty(member)) {
        return;
    }
    const gangster = new Gangster(ns);
    member.forEach((s) => gangster.ascend(s));
}

/**
 * Marshall our forces on the border and be ready for war.
 *
 * @param {NS} ns The Netscript API.
 */
function casus_belli(ns) {
    assert(ns.gang.getGangInformation().territoryWarfareEngaged);
    assert(has_max_members(ns));
    const gangster = new Gangster(ns);
    gangster.turf_war(ns.gang.getMemberNames());
}

/**
 * Choose gang members to be assigned to territory warfare.  This is territory
 * warfare to help increase our gang power, not a clash against a rival gang.
 * We want the following members to engage in turf war:
 *
 * (1) Vanguard x 1
 * (2) Artillery x 1
 * (3) Pilot x 1
 * (4) Punk x 1
 *
 * As we have multiple gang members who hold the role of Punk, choose the
 * strongest of those members.
 *
 * @param {NS} ns The Netscript API.
 * @returns {array} Member names.  This is never an empty array.
 */
function choose_warriors(ns) {
    const gangster = new Gangster(ns);
    const combatant = ns.gang
        .getMemberNames()
        .filter(
            (s) => gangster.is_vanguard(s)
                || gangster.is_artillery(s)
                || gangster.is_pilot(s)
        );
    assert(!MyArray.is_empty(combatant));

    // We want at most 1 Punk assigned to territory warfare.
    const punk = ns.gang.getMemberNames().filter((s) => gangster.is_punk(s));
    const punk_warrior = punk.filter((p) => gangster.is_warrior(p));
    assert(!MyArray.is_empty(punk));
    let warrior = [];
    if (!MyArray.is_empty(punk_warrior)) {
        warrior = combatant.concat([]);
    } else {
        warrior = combatant.concat([strongest_member(ns, punk)]);
    }
    assert(warrior.length > 0);
    assert(warrior.length <= members.WARRIOR);
    return warrior;
}

/**
 * Create a gang within the given criminal organization.  If we are in a
 * BitNode other than BN2.x, we must have a certain amount of negative karma
 * as a pre-requisite for creating a gang.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} fac The name of a criminal organization.
 */
async function create_gang(ns, fac) {
    assert(is_valid_faction(fac));
    if (ns.gang.inGang()) {
        log(ns, `Manage a gang in ${fac}`);
        return;
    }
    log(ns, `Create and manage a gang in ${fac}`);
    while (!ns.gang.inGang()) {
        ns.gang.createGang(fac);
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * Reassign gang members to various tasks that help to lower our penalty.  As
 * this is a criminal gang, our members can only engage in vigilante justice
 * and are not able to engage in ethical hacking.  Choose a number of our
 * gangsters and set them to vigilante justice.  The remaining members are given
 * jobs that attract less wanted levels than their current jobs.
 *
 * @param {NS} ns The Netscript API.
 */
function decrease_penalty(ns) {
    reassign_vigilante(ns);
    const gangster = new Gangster(ns);
    const candidate = ns.gang
        .getMemberNames()
        .filter((s) => !gangster.is_vigilante(s));

    const trainee = candidate.filter((s) => gangster.needs_training(s));
    const other = candidate.filter((s) => !trainee.includes(s));
    gangster.train(trainee);
    graduate(ns);
    gangster.extort(other);
}

/**
 * All Augmentations that raise the defense of a gang member.
 *
 * @returns {array} Augmentation names.
 */
function defensive_equipment_augment() {
    return Object.values(gang_augment).filter(
        (a) => a !== gang_augment.ARMS
            && a !== gang_augment.LEGS
            && a !== gang_augment.HEART
            && a !== gang_augment.WIRE
            && a !== gang_augment.NEURAL
            && a !== gang_augment.DATA
    );
}

/**
 * All weapons that raise the defense of a gang member.
 *
 * @returns {array} Weapon names.
 */
function defensive_equipment_weapon() {
    return Object.values(weapon).filter((w) => w !== weapon.AWM);
}

/**
 * Whether to engage in territory warfare against a rival gang.  By default,
 * we do not engage in turf warfare.  However, we enable turf warfare provided
 * that the following conditions are satisfied:
 *
 * (1) We have the maximum number of gang members.
 * (2) Our chance of winning against a rival gang is at least a given
 *     percentage.
 *
 * However, if our gang already has taken over 100% of the territory, then
 * there is no need to engage in turf warfare.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we are to engage in territory warfare against
 *     another gang; false otherwise.
 */
function enable_turf_war(ns) {
    if (has_all_turf(ns)) {
        return bool.NO_WAR;
    }
    if (has_max_members(ns) && min_victory_chance(ns) >= gang_t.WIN) {
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
 * (5) rootkit
 *
 * If a member already has an Augmentation, weapon, armour, vehicle, or rootkit
 * then we attempt to give them another piece of equipment.  Our attempt can
 * succeed or fail, depending on whether we have sufficient funds to purchase
 * equipment.
 *
 * @param {NS} ns The Netscript API.
 */
function equip(ns) {
    // Only equip if this is not "BitNode-8: Ghost of Wall Street".
    if (is_ghost_of_wall_street(ns)) {
        return;
    }

    const gangster = new Gangster(ns);
    for (const s of ns.gang.getMemberNames()) {
        // Equip items that raise a member's defense.  Higher defense translates
        // to a lower probability of death during a clash against a rival gang.
        // Always try to first purchase an Augmentation that raises defense
        // because the effects of Augmentations are persistent after an
        // ascension.  Next, we equip weapons that raise defense.  Not all
        // weapons raise the defense of a gang member.  Finally, we equip armour
        // pieces, all of which raise defense.
        equip_augment_def(ns, s);
        equip_weapon_def(ns, s);
        for (const amr of Object.values(armour)) {
            if (gangster.has_armour(s, amr)) {
                continue;
            }
            if (gangster.equip_armour(s, amr)) {
                break;
            }
        }

        // Now equip items that raise other stats.  Ensure we have first
        // equipped all items that raise defense.
        if (!has_all_def_equipment(ns, s)) {
            continue;
        }

        // Try to equip other Augmentations.
        const other_augment = Object.values(gang_augment).filter(
            (a) => !defensive_equipment_augment().includes(a)
        );
        for (const aug of other_augment) {
            if (gangster.has_augment(s, aug)) {
                continue;
            }
            if (gangster.equip_augment(s, aug)) {
                break;
            }
        }

        // Try to equip other weapons.
        const other_weapon = Object.values(weapon).filter(
            (w) => !defensive_equipment_weapon().includes(w)
        );
        for (const wpn of other_weapon) {
            if (gangster.has_weapon(s, wpn)) {
                continue;
            }
            if (gangster.equip_weapon(s, wpn)) {
                break;
            }
        }

        // Try to equip a new vehicle.
        for (const vhc of Object.values(vehicle)) {
            if (gangster.has_vehicle(s, vhc)) {
                continue;
            }
            if (gangster.equip_vehicle(s, vhc)) {
                break;
            }
        }

        // Try to equip a rootkit.  This should be low on our priority list
        // because members of a criminal gang primarily depend on their combat
        // stats and Charisma.
        for (const kit of Object.values(rootkit)) {
            if (gangster.has_rootkit(s, kit)) {
                continue;
            }
            if (gangster.equip_rootkit(s, kit)) {
                break;
            }
        }
    }
}

/**
 * Equip a gang member with various Augmentations that raise their defense.  The
 * effects of Augmentations are persistent and a member does not lose them after
 * an ascension.  We want to equip a member with Augmentations that raise their
 * defense.  The higher is the defense of a member, the lower is the probability
 * of death during a clash against a rival gang.  The following Augmentations
 * raise defense:
 *
 * (1) Bionic Spine: 1.15
 * (2) BrachiBlades: 1.4
 * (3) Nanofiber Weave: 1.2
 * (4) Synfibril Muscle: 1.3
 * (5) Graphene Bone Lacings: 1.7
 *
 * Unfortunately, the following Augmentations do not raise defense:
 *
 * (1) Bionic Arms
 * (2) Bionic Legs
 * (3) Synthetic Heart
 * (4) BitWire
 * (5) Neuralstimulator
 * (6) DataJack
 *
 * Refer to these files for more detail:
 *
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/Gang.ts
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/data/upgrades.ts
 *
 * @param {NS} ns The Netscript API.
 * @param {string} name The name of our gang member.
 */
function equip_augment_def(ns, name) {
    const gangster = new Gangster(ns);
    for (const aug of defensive_equipment_augment()) {
        if (gangster.has_augment(name, aug)) {
            continue;
        }
        if (gangster.equip_augment(name, aug)) {
            return;
        }
    }
}

/**
 * Equip a gang member with various weapons that raise their defense.  Weapons
 * are important because most of them raise a gangster's defense.  While engaged
 * in a clash against a rival gang, the defense of our gangster helps to lower
 * the chance of death.  The higher is our member's defense, the lower is the
 * probability of death.  The following weapons raise defense:
 *
 * (1) Baseball Bat: 1.04
 * (2) Katana: 1.08
 * (3) Glock 18C: 1.1
 * (4) P90C: 1.1
 * (5) Steyr AUG: 1.15
 * (6) AK-47: 1.2
 * (7) M15A10 Assault Rifle: 1.25
 *
 * Unfortunately, the AWM Sniper Rifle does not raise our member's defense.
 * Refer to these files for more detail:
 *
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/Gang.ts
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/data/upgrades.ts
 *
 * @param {NS} ns The Netscript API.
 * @param {string} name The name of our gang member.
 */
function equip_weapon_def(ns, name) {
    const gangster = new Gangster(ns);
    for (const wpn of defensive_equipment_weapon()) {
        if (gangster.has_weapon(name, wpn)) {
            continue;
        }
        if (gangster.equip_weapon(name, wpn)) {
            return;
        }
    }
}

/**
 * Once a new member has completed their training, graduate and assign them
 * their first job.
 *
 * @param {NS} ns The Netscript API.
 */
function graduate(ns) {
    const gangster = new Gangster(ns);
    gangster.graduate(ns.gang.getMemberNames(), task_t.COMBAT);
}

/**
 * Whether we have equipped all items that raise a gang member's defense.
 * Defense is important during a clash against a rival gang.  The higher is a
 * member's defense, the lower is the probability of death during the clash.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} name The name of a gang member.
 * @returns {boolean} True if a gang member has all equipment that raise their
 *     defense; false otherwise.
 */
function has_all_def_equipment(ns, name) {
    const gangster = new Gangster(ns);
    const has_augment = (aug) => gangster.has_augment(name, aug);
    const has_weapon = (wpn) => gangster.has_weapon(name, wpn);
    const has_armour = (amr) => gangster.has_armour(name, amr);
    return (
        defensive_equipment_augment().every(has_augment)
        && defensive_equipment_weapon().every(has_weapon)
        && Object.values(armour).every(has_armour)
    );
}

/**
 * Whether our gang already controls 100% of the territory.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we control 100% of the territory; false otherwise.
 */
function has_all_turf(ns) {
    return ns.gang.getGangInformation().territory >= 1;
}

/**
 * Whether we have the maximum number of members in our gang.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if our gang is at capacity; false otherwise.
 */
function has_max_members(ns) {
    return members.MAX === ns.gang.getMemberNames().length;
}

/**
 * Whether any of our gang members are currently on vigilante justice.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if at least one gang member is currently assigned to
 *     vigilante justice; false otherwise.
 */
function has_vigilante(ns) {
    const gangster = new Gangster(ns);
    const is_vigilante = (s) => gangster.is_vigilante(s);
    return ns.gang.getMemberNames().some(is_vigilante);
}

/**
 * Whether our gang is engaged in turf warfare.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if our gang is engaged in turf warfare against a
 *     rival gang; false otherwise.
 */
function is_in_war(ns) {
    if (!ns.gang.getGangInformation().territoryWarfareEngaged) {
        return false;
    }
    const gangster = new Gangster(ns);
    const warrior = ns.gang
        .getMemberNames()
        .filter((s) => gangster.is_warrior(s));
    return warrior.length === members.MAX;
}

/**
 * Whether we are currently in a new tick.  Each tick lasts for approximately
 * the time period as defined by the constant gang_t.TICK.  At the start of
 * each tick, there is a chance for our gang to clash against a rival gang.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} other An object containing information about other gangs.
 *     The data in the object should be from the previous tick.
 * @returns {boolean} True if we are in a new tick; false otherwise.
 */
function is_new_tick(ns, other) {
    const current = ns.gang.getOtherGangInformation();
    const changed_power = (g) => current[g].power !== other[g].power;
    const changed_turf = (g) => current[g].territory !== other[g].territory;
    const has_changed = (g) => changed_power(g) || changed_turf(g);
    return Object.keys(current).some(has_changed);
}

/**
 * Whether the given string represents the name of a criminal organization
 * within which we can create a criminal gang.
 *
 * @param {string} fac The name of a criminal organization.
 * @returns {boolean} True if we can create a criminal gang within the given
 *     faction; false otherwise.
 */
function is_valid_faction(fac) {
    assert(fac.length > 0);
    const organization = [
        "Slum Snakes",
        "Speakers for the Dead",
        "Tetrads",
        "The Dark Army",
        "The Syndicate",
    ];
    return organization.includes(fac);
}

/**
 * Manage our gang.  This is the update loop.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} faction The faction to which our gang belongs.
 */
async function manage(ns, faction) {
    // A tick is a period of time as defined by the constant gang_t.TICK.  At
    // the start of each tick, there is a chance for our gang to clash against
    // any rival gang.  The tick threshold is the time near the start of a new
    // tick.  If we are at the tick threshold, then do whatever is necessary to
    // prepare for a clash against a rival gang.
    let other_gang = ns.gang.getOtherGangInformation();
    let tick_threshold = 1;

    // The update loop.
    for (;;) {
        // Enable/disable territory warfare.
        if (enable_turf_war(ns)) {
            if (!ns.gang.getGangInformation().territoryWarfareEngaged) {
                log(ns, `Enable territory warfare for gang in ${faction}`);
                ns.gang.setTerritoryWarfare(bool.ENABLE);
            }
        } else if (ns.gang.getGangInformation().territoryWarfareEngaged) {
            log(ns, `Disable territory warfare for gang in ${faction}`);
            ns.gang.setTerritoryWarfare(bool.DISABLE);
        }

        // Are we in a new tick?  If we are having a turf war, then let our
        // gang members fight until a new tick occurs.
        if (is_in_war(ns) && is_new_tick(ns, other_gang)) {
            // The tick threshold should be a little under gang_t.TICK.
            tick_threshold = Date.now() + (gang_t.TICK - wait_t.SECOND);
            other_gang = ns.gang.getOtherGangInformation();
            reassign_after_warfare(ns);
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

/**
 * The minimum chance of winning a clash against any rival gang.  The chance is
 * reported as an integer percentage.  For example, if our chance to win a
 * clash is 0.6879, we convert this to the percentage of 68.79 and take only
 * the integer part, which in this case is 68%.
 *
 * @param {NS} ns The Netscript API.
 * @returns {number} The minimum chance as an integer percentage of winning a
 *     clash against any rival gang.
 */
function min_victory_chance(ns) {
    let chance = Infinity;
    const our_gang = ns.gang.getGangInformation().faction;
    const other_gang = ns.gang.getOtherGangInformation();
    for (const g of Object.keys(other_gang)) {
        if (our_gang === g) {
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
 * @param {NS} ns The Netscript API.
 */
function para_bellum(ns) {
    // If we already control 100% of the territory, there is no need to send
    // any gang member to turf warfare.
    if (has_all_turf(ns)) {
        return;
    }

    // We want at most members.WARRIOR members to be engaged in territory
    // warfare.  The remaining members should be in as high-paying jobs as
    // possible.  We can have 8 members be involved in trafficking illegal arms.
    // We also need 1 member to be committing acts of terrorism to help raise
    // our respect so we can recruit more members.  The number of members
    // engaged in trafficking illegal arms is effectively 7.  The subtraction of
    // 1 accounts for the lone member who commits acts of terrorism.
    const threshold = members.MAX - members.WARRIOR - 1;

    // Not yet time to send gang members to turf warfare.
    const gangster = new Gangster(ns);
    const trafficker = ns.gang
        .getMemberNames()
        .filter((s) => gangster.is_arms_trafficker(s));
    if (trafficker.length < threshold) {
        return;
    }

    // Choose various combatants and reassign them to turf warfare.
    assert(trafficker.length >= threshold);
    gangster.turf_war(choose_warriors(ns));
}

/**
 * The penalty p is defined as the ratio of the wanted level over our respect.
 * Multiply p by 100 and we see that the penalty expresses the wanted level as
 * a percentage of our respect.  Tasks that our gang members engage in would
 * take p percent longer as compared to when our wanted level is zero.  Note
 * that the wanted level can never be lower than 1.  Aim to keep the penalty p
 * below a certain fraction.
 *
 * @param {NS} ns The Netscript API.
 * @returns {number} The penalty as a percentage.
 */
function penalty(ns) {
    const wanted = ns.gang.getGangInformation().wantedLevel;
    const { respect } = ns.gang.getGangInformation();
    const p = Math.floor(100 * (wanted / respect));
    assert(p >= 0);
    return p;
}

/**
 * Reassign gang members to some other tasks.
 *
 * @param {NS} ns The Netscript API.
 */
function reassign(ns) {
    reassign_everyone(ns);
    reassign_from_neutral(ns);
}

/**
 * When we no longer need to lower our penalty, reassign our gang members to
 * other jobs.
 *
 * @param {NS} ns The Netscript API.
 */
function reassign_after_vigilante_justice(ns) {
    const gangster = new Gangster(ns);
    gangster.neutral(ns.gang.getMemberNames());
    update(ns);
}

/**
 * Following territory warfare against a rival gang, reassign our gang members
 * to other jobs.
 *
 * @param {NS} ns The Netscript API.
 */
function reassign_after_warfare(ns) {
    const gangster = new Gangster(ns);
    gangster.neutral(ns.gang.getMemberNames());
    update(ns);
}

/**
 * Reassign high-level gang members to trafficking illegal arms.
 *
 * @param {NS} ns The Netscript API.
 */
function reassign_arms_trafficking(ns) {
    const min = task_t.TRAFFICK_ARMS;
    const max = Infinity;
    const gangster = new Gangster(ns);
    const candidate = [];
    for (const s of ns.gang.getMemberNames()) {
        if (!has_all_turf(ns)) {
            if (gangster.is_terrorist(s) || gangster.is_warrior(s)) {
                continue;
            }
        }
        if (min <= gangster.strength(s) && gangster.strength(s) < max) {
            candidate.push(s);
        }
    }
    gangster.traffick_arms(candidate);
}

/**
 * Reassign gangsters to other jobs.
 *
 * @param {NS} ns The Netscript API.
 */
function reassign_everyone(ns) {
    // Assign gang members with mid- to advanced-level stats to more
    // profitable jobs.
    reassign_extortion(ns);
    reassign_robbery(ns);

    // Assign other high-level members to trafficking illegal arms.
    reassign_arms_trafficking(ns);

    // Assign as many members as possible to commit acts of terrorism.  This
    // should help to increase our respect so we can recruit more members.
    reassign_terrorism(ns);
}

/**
 * Reassign mid-level gang members to strongarm civilians on our turf.
 *
 * @param {NS} ns The Netscript API.
 */
function reassign_extortion(ns) {
    const min = task_t.EXTORT;
    const max = task_t.ROBBERY;
    const gangster = new Gangster(ns);
    const candidate = ns.gang
        .getMemberNames()
        .filter(
            (s) => min <= gangster.strength(s) && gangster.strength(s) < max
        );
    gangster.extort(candidate);
}

/**
 * Reassign anyone who is in the neutral state to a default task.
 *
 * @param {NS} ns The Netscript API.
 */
function reassign_from_neutral(ns) {
    const gangster = new Gangster(ns);
    const idle = ns.gang.getMemberNames().filter((s) => gangster.is_idle(s));
    if (MyArray.is_empty(idle)) {
        return;
    }
    gangster.extort(idle);
}

/**
 * Reassign above mid-level gang members to armed robbery.  Reassign gang
 * members if their Strength stat is in the half-open interval [min, max).
 * That is, we include the minimum threshold but exclude the maximum threshold.
 *
 * @param {NS} ns The Netscript API.
 */
function reassign_robbery(ns) {
    const min = task_t.ROBBERY;
    const max = task_t.TRAFFICK_ARMS;
    const gangster = new Gangster(ns);
    const candidate = ns.gang
        .getMemberNames()
        .filter(
            (s) => min <= gangster.strength(s) && gangster.strength(s) < max
        );
    gangster.robbery(candidate);
}

/**
 * Reassign advanced-level gang members to commit acts of terrorism.  We usually
 * assign members to acts of terrorism because this task greatly increases
 * respect, which in turn helps to recruit new members, but does not generate
 * income.
 *
 * @param {NS} ns The Netscript API.
 */
function reassign_terrorism(ns) {
    const gangster = new Gangster(ns);
    const member = ns.gang.getMemberNames();
    if (has_max_members(ns)) {
        gangster.traffick_arms(member);
        return;
    }

    // Reassign high-level candidates to terrorism.
    const min = task_t.TERROR;
    const max = Infinity;
    const candidate = member.filter(
        (s) => min <= gangster.strength(s) && gangster.strength(s) < max
    );
    if (MyArray.is_empty(candidate)) {
        return;
    }
    gangster.terrorism(candidate);
}

/**
 * Recruit as many new members as possible.  Set the newbies to train their
 * various stats.
 *
 * @param {NS} ns The Netscript API.
 */
function recruit(ns) {
    const gangster = new Gangster(ns);
    if (ns.gang.getMemberNames().length < members.MAX) {
        const newbie = gangster.recruit();
        gangster.train(newbie);
        if (!MyArray.is_empty(newbie)) {
            newbie.forEach((s) => log(ns, `Recruited new member ${s}`));
        }
    }
}

/**
 * Recruit the maximum number of members to our gang.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} fac The faction to which our gang belongs.
 */
async function recruit_full_house(ns, fac) {
    log(ns, `Recruit all members to gang in ${fac}`);
    while (!has_max_members(ns)) {
        recruit(ns);
        retrain(ns);
        graduate(ns);
        ascend(ns);
        equip(ns);
        reassign(ns);
        await ns.sleep(wait_t.DEFAULT);
    }
    log(ns, `Gang in ${fac} is at capacity`);
}

/**
 * Retrain the stats of gang members as necessary.
 *
 * @param {NS} ns The Netscript API.
 */
function retrain(ns) {
    const gangster = new Gangster(ns);
    const member = ns.gang
        .getMemberNames()
        .filter((s) => gangster.needs_training(s));
    gangster.train(member);
}

/**
 * Various sanity checks.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if the checks pass; false otherwise.
 */
function sanity_checks(ns) {
    if (ns.args.length !== 1) {
        log(ns, "Must provide the name of a criminal organization");
        return bool.FAILURE;
    }
    const faction = ns.args[0];
    if (!is_valid_faction(faction)) {
        log(ns, `Cannot create criminal gang within faction ${faction}`);
        return bool.FAILURE;
    }
    return bool.SUCCESS;
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("gang.setTerritoryWarfare");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
}

/**
 * Manage our criminal gang.
 *
 * @param {NS} ns The Netscript API.
 */
function update(ns) {
    recruit(ns);
    retrain(ns);
    graduate(ns);

    // Ascend a gang member before we spend any more money on them.  After the
    // ascension, the member would lose all equipment and their stats would
    // reset.  We ascend the member now so down the pipeline we can retrain
    // and re-equip them.
    ascend(ns);
    equip(ns);

    // Do we have anyone on vigilante justice?
    if (has_vigilante(ns)) {
        if (penalty(ns) <= penalty_t.LOW) {
            reassign_after_vigilante_justice(ns);
            return;
        }
    }

    // Initially, our gang has a small number of members.  Assigning one or
    // more members to vigilante justice would do precious little to decrease
    // our wanted level.  With such a small membership, it is more important to
    // raise the members' stats and recruit more members than to lower our
    // wanted level.
    if (ns.gang.getMemberNames().length > members.HALF) {
        // Is our penalty too high?  If our penalty percentage exceeds a given
        // threshold, then reassign some gang members to vigilante justice in
        // order to lower our penalty.  Furthermore, reassign the remaining
        // members to jobs that attract a lower wanted level.
        if (penalty(ns) >= penalty_t.HIGH) {
            decrease_penalty(ns);
            return;
        }
    }
    reassign(ns);

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
 * Usage: run quack/gang/crime.js [faction]
 * Example: run quack/gang/crime.js "Slum Snakes"
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    if (!sanity_checks(ns)) {
        return;
    }

    // Create our criminal gang and recruit the first crop of gangsters.  By
    // default, we disable territory warfare.  Instead, we concentrate on
    // recruitment and building the strengths of our gang members.
    const faction = ns.args[0];
    await create_gang(ns, faction);
    log(ns, `Disable territory warfare for gang in ${faction}`);
    ns.gang.setTerritoryWarfare(bool.DISABLE);
    assert(!ns.gang.getGangInformation().isHacking);

    await recruit_full_house(ns, faction);
    await manage(ns, faction);
}
