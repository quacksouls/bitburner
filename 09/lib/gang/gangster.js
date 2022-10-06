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
    gangster_t,
    members,
    task,
    task_t,
    vehicle,
    weapon,
} from "/lib/constant/gang.js";
import { money_reserve } from "/lib/constant/misc.js";
import { home } from "/lib/constant/server.js";
import { random_integer } from "/lib/random.js";
import { assert } from "/lib/util.js";

/**
 * A class that holds various information about a gangster.
 */
export class Gangster {
    /**
     * The Netscript API.
     */
    #ns;

    /**
     * Initialize a Gangster object.
     *
     * @param ns The Netscript API.
     */
    constructor(ns) {
        this.#ns = ns;
    }

    /**
     * The Agility stat of a gang member.
     *
     * @param name A string representing the name of a gang member.
     * @return The Agility stat of the given member.
     */
    agility(name) {
        assert(this.is_member(name));
        return this.#ns.gang.getMemberInformation(name).agi;
    }

    /**
     * Ascend a gang member.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the ascension is successful; false otherwise.
     */
    ascend(name) {
        assert(this.is_member(name));
        const asc = this.#ns.gang.getAscensionResult(name);
        if (undefined == asc) {
            return bool.FAILURE;
        }
        // Convert a number in the form 1.xyz to 1xy.  We multiply the number
        // by 100 and take the integer part.  So 1.25 would be 125.  We do this
        // because comparing floating point numbers can be tricky and result in
        // unexpected behaviour.  It is easier and simpler to compare integers.
        function to_int(x) {
            return Math.floor(100 * x);
        }
        // Ascend this gang member.
        const tau = to_int(gang_t.ASCEND);
        if (
            (to_int(asc.agi) > tau)
                || (to_int(asc.cha) > tau)
                || (to_int(asc.def) > tau)
                || (to_int(asc.dex) > tau)
                || (to_int(asc.str) > tau)
        ) {
            const result = this.#ns.gang.ascendMember(name);
            if (undefined != result) {
                return bool.SUCCESS;
            }
        }
        return bool.FAILURE;
    }

    /**
     * The Charisma stat of a gang member.
     *
     * @param name A string representing the name of a gang member.
     * @return The Charisma stat of the given member.
     */
    charisma(name) {
        assert(this.is_member(name));
        return this.#ns.gang.getMemberInformation(name).cha;
    }

    /**
     * Assign gang members to deal drugs.
     *
     * @param name An array of member names.
     */
    deal_drugs(name) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        // Let gang members be involved in dealing drugs.
        for (const s of name) {
            if (!this.is_dealing_drugs(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.DRUGS));
            }
        }
    }

    /**
     * The Defense stat of a gang member.
     *
     * @param name A string representing the name of a gang member.
     * @return The Defense stat of the given member.
     */
    defense(name) {
        assert(this.is_member(name));
        return this.#ns.gang.getMemberInformation(name).def;
    }

    /**
     * The Dexterity stat of a gang member.
     *
     * @param name A string representing the name of a gang member.
     * @return The Dexterity stat of the given member.
     */
    dexterity(name) {
        assert(this.is_member(name));
        return this.#ns.gang.getMemberInformation(name).dex;
    }

    /**
     * Purchase the given armour piece and equip it on a gang member.
     *
     * @param name A string representing the name of a gang member.
     * @param amr A string representing the name of an armour piece.
     * @return true if the armour is successfully purchased for the given
     *     member; false otherwise.
     */
    equip_armour(name, amr) {
        assert(this.is_member(name));
        const gang_armour = new Set(Object.values(armour));
        assert(gang_armour.has(amr));
        const cost = this.#ns.gang.getEquipmentCost(amr);
        const funds = this.#player_money() - money_reserve;
        if (funds < (gang_t.COST_MULT * cost)) {
            return bool.FAILURE;
        }
        return this.#ns.gang.purchaseEquipment(name, amr);
    }

    /**
     * Purchase the given Augmentation and equip it on a gang member.
     *
     * @param name A string representing the name of a gang member.
     * @param aug A string representing the name of an Augmentation.
     * @return true if the Augmentation is successfully purchased for the given
     *     member; false otherwise.
     */
    equip_augment(name, aug) {
        assert(this.is_member(name));
        const gang_augment = new Set(Object.values(gang_aug_crime));
        assert(gang_augment.has(aug));
        const cost = this.#ns.gang.getEquipmentCost(aug);
        const funds = this.#player_money() - money_reserve;
        if (funds < (gang_t.COST_MULT * cost)) {
            return bool.FAILURE;
        }
        return this.#ns.gang.purchaseEquipment(name, aug);
    }

    /**
     * Purchase the given vehicle and equip it on a gang member.
     *
     * @param name A string representing the name of a gang member.
     * @param vhc A string representing the name of a vehicle.
     * @return true if the vehicle is successfully purchased for the given
     *     member; false otherwise.
     */
    equip_vehicle(name, vhc) {
        assert(this.is_member(name));
        const gang_vehicle = new Set(Object.values(vehicle));
        assert(gang_vehicle.has(vhc));
        const cost = this.#ns.gang.getEquipmentCost(vhc);
        const funds = this.#player_money() - money_reserve;
        if (funds < (gang_t.COST_MULT * cost)) {
            return bool.FAILURE;
        }
        return this.#ns.gang.purchaseEquipment(name, vhc);
    }

    /**
     * Purchase the given weapon and equip it on a gang member.
     *
     * @param name A string representing the name of a gang member.
     * @param wpn A string representing the name of a weapon.
     * @return true if the weapon is successfully purchased for the given
     *     member; false otherwise.
     */
    equip_weapon(name, wpn) {
        assert(this.is_member(name));
        const gang_weapon = new Set(Object.values(weapon));
        assert(gang_weapon.has(wpn));
        const cost = this.#ns.gang.getEquipmentCost(wpn);
        const funds = this.#player_money() - money_reserve;
        if (funds < (gang_t.COST_MULT * cost)) {
            return bool.FAILURE;
        }
        return this.#ns.gang.purchaseEquipment(name, wpn);
    }

    /**
     * Assign gang members to extort civilians on our turf.
     *
     * @param name An array of member names.
     */
    extort(name) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        // Let gang members strongarm civilians.
        for (const s of name) {
            if (!this.is_extortionist(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.EXTORT));
            }
        }
    }

    /**
     * Graduate gang members who have been training their combat stats.  Assign
     * them to mug random people.
     *
     * @param name An array each of whose elements is a string that represents
     *     a member name.
     * @param threshold A combatant transitions to mugging once each of their
     *     combat stats is at least this amount.
     */
    graduate_combatant(name, threshold) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        const min = Math.floor(threshold);
        assert(min > 0);
        // After training their combat stats, members graduate to mugging
        // random people.
        const combatant = name.filter(s => this.is_combatant(s));
        const graduate = combatant.filter(
            s => this.is_training_combat(s)
                && (this.strength(s) >= min)
                && (this.defense(s) >= min)
                && (this.dexterity(s) >= min)
                && (this.agility(s) >= min)
        );
        this.mug(graduate);
    }

    /**
     * Graduate gang members who have been training their Hack stat.  Although
     * hackers primarily train their Hack stat, they could also benefit from
     * some training in their Charisma stat.  After a hacker has trained their
     * Hack and Charisma stats, assign them their first job of creating and
     * distributing ransomware.
     *
     * @param name An array each of whose elements is a string that represents
     *     a member name.
     * @param threshold A hacker transitions to ransomware once their Hack stat
     *     is at least this amount.  The transition is also affected by their
     *     Charisma stat.  If they do not have sufficient Charisma, they must
     *     train their Charisma stat before being assigned their first job.
     */
    graduate_hacker(name, threshold) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        const min = Math.floor(threshold);
        assert(min > 0);
        // After training their Hack stat, a hacker also trains their Charisma
        // stat.
        const hacker = name.filter(s => this.is_hacker(s));
        const hack_graduate = hacker.filter(
            s => this.is_training_hack(s)
                && (this.hack(s) >= min)
        );
        this.train_charisma(hack_graduate);
        // Once a hacker's Hack and Charisma stats are of minimum amounts,
        // assign them their first job.
        const charisma_graduate = hacker.filter(
            s => this.is_training_charisma(s)
                && (this.charisma(s) >= task_t.CHARISMA)
        );
        this.ransomware(charisma_graduate);
    }

    /**
     * Graduate miscellaneous members who have been training their Charisma
     * stat.  Although miscellaneous members primarily train their Charisma
     * stat, they could also benefit from some training in their combat stats.
     * After a miscellaneous member has trained their Charisma and combat stats,
     * assign them their first job of dealing drugs.
     *
     * @param name An array each of whose elements is a string that represents
     *     a member name.
     * @param threshold A miscellaneous member transitions to dealing drugs
     *     once their Charisma stat is at least this amount.  The transition is
     *     also affected by their combat stats.  If they do not have sufficient
     *     combat stats, they must train their combat stats before being
     *     assigned their first job.
     */
    graduate_other(name, threshold) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        const min = Math.floor(threshold);
        assert(min > 0);
        // After training their Charisma stat, a miscellaneous member also
        // trains their combat stats.
        const graduate = name.filter(s => this.is_miscellaneous(s));
        const charisma_graduate = graduate.filter(
            s => this.is_training_charisma(s)
                && (this.charisma(s) >= min)
        );
        this.train_combat(charisma_graduate);
        // Once the Charisma and combat stats of a miscellaneous member are of
        // minimum amounts, assign them their first job.
        const combat_graduate = graduate.filter(
            s => this.is_training_combat(s)
                && (this.strength(s) >= task_t.COMBAT)
                && (this.defense(s) >= task_t.COMBAT)
                && (this.dexterity(s) >= task_t.COMBAT)
                && (this.agility(s) >= task_t.COMBAT)
        );
        this.deal_drugs(combat_graduate);
    }

    /**
     * The Hack stat of a gang member.
     *
     * @param name A string representing the name of a gang member.
     * @return The Hack stat of the given member.
     */
    hack(name) {
        assert(this.is_member(name));
        return this.#ns.gang.getMemberInformation(name).hack;
    }

    /**
     * Whether a gang member has a particular armour piece.
     *
     * @param name A string representing the name of a gang member.
     * @param amr A string representing the name of an armour.
     * @return true if the gang member has the given armour piece;
     *     false otherwise.
     */
    has_armour(name, amr) {
        assert(this.is_member(name));
        const gang_armour = new Set(Object.values(armour));
        assert(gang_armour.has(amr));
        const equipment = new Set(
            this.#ns.gang.getMemberInformation(name).upgrades
        );
        return equipment.has(amr);
    }

    /**
     * Whether a gang member has a particular Augmentation.
     *
     * @param name A string representing the name of a gang member.
     * @param aug A string representing the name of an Augmentation.
     * @return true if the gang member has the given Augmentation;
     *     false otherwise.
     */
    has_augment(name, aug) {
        assert(this.is_member(name));
        const gang_augment = new Set(Object.values(gang_aug_crime));
        assert(gang_augment.has(aug));
        const equipment = new Set(
            this.#ns.gang.getMemberInformation(name).augmentations
        );
        return equipment.has(aug);
    }

    /**
     * Whether a gang member has a particular vehicle.
     *
     * @param name A string representing the name of a gang member.
     * @param vhc A string representing the name of a vehicle.
     * @return true if the gang member has the given vehicle; false otherwise.
     */
    has_vehicle(name, vhc) {
        assert(this.is_member(name));
        const gang_vehicle = new Set(Object.values(vehicle));
        assert(gang_vehicle.has(vhc));
        const equipment = new Set(
            this.#ns.gang.getMemberInformation(name).upgrades
        );
        return equipment.has(vhc);
    }

    /**
     * Whether a gang member has a particular weapon.
     *
     * @param name A string representing the name of a gang member.
     * @param wpn A string representing the name of a weapon.
     * @return true if the gang member has the given weapon; false otherwise.
     */
    has_weapon(name, wpn) {
        assert(this.is_member(name));
        const gang_weapon = new Set(Object.values(weapon));
        assert(gang_weapon.has(wpn));
        const equipment = new Set(
            this.#ns.gang.getMemberInformation(name).upgrades
        );
        return equipment.has(wpn);
    }

    /**
     * Whether a gang member is engaged in trafficking illegal arms.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is trafficking illegal arms;
     *     false otherwise.
     */
    is_arms_trafficker(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.TRAFFICK_ARMS == current_task;
    }

    /**
     * Whether a gang member is a combatant.  A gangster is a combatant if they
     * have been assigned one of these roles:
     *
     * (1) Artillery
     * (2) Pilot
     * (3) Punk
     * (4) Vanguard
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is a combatant; false otherwise.
     */
    is_combatant(name) {
        assert(this.is_member(name));
        const role = this.role(name);
        return (role == members.ROLE.artillery)
            || (role == members.ROLE.pilot)
            || (role == members.ROLE.punk)
            || (role == members.ROLE.vanguard);
    }

    /**
     * Whether a gang member is creating and distributing ransomware.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is involved in the creation and
     *     distribution of ransomware; false otherwise.
     */
    is_creating_ransomware(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.RANSOMWARE == current_task;
    }

    /**
     * Whether a gang member is involved in dealing drugs.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is dealing drugs; false otherwise.
     */
    is_dealing_drugs(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.DRUGS == current_task;
    }

    /**
     * Whether a gang member is engaged in ethical hacking.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is engaged in ethical hacking;
     *     false otherwise.
     */
    is_ethical_hacker(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.EHACK == current_task;
    }

    /**
     * Whether a gang member is strongarming civilians.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is strongarming civilians;
     *     false otherwise.
     */
    is_extortionist(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.EXTORT == current_task;
    }

    /**
     * Whether a gang member is a hacker.  A gangster is a hacker if they have
     * been assigned the role of Hacker.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is a hacker; false otherwise.
     */
    is_hacker(name) {
        assert(this.is_member(name));
        return this.role(name) == members.ROLE.hacker;
    }

    /**
     * Whether the given name belongs to a member of our gang.
     *
     * @param name A string representing the name of a gang member.  A member's
     *     name should be prefixed with their role, according to the format:
     *     "[Role] Full Name".
     * @return true if our gang has the specified member; false otherwise.
     */
    is_member(name) {
        assert(name.length > 0);
        const member = new Set(this.#ns.gang.getMemberNames());
        return member.has(name);
    }

    /**
     * Whether a gang member holds one of the following miscellaneous roles:
     *
     * (1) Medic
     * (2) Spy
     * (3) Thief
     * (4) Traitor
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member holds a miscellaneous role;
     *     false otherwise.
     */
    is_miscellaneous(name) {
        assert(this.is_member(name));
        const role = this.role(name);
        return (role == members.ROLE.medic)
            || (role == members.ROLE.spy)
            || (role == members.ROLE.thief)
            || (role == members.ROLE.traitor);
    }

    /**
     * Whether a gang member is mugging random people on the streets.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is mugging random people;
     *     false otherwise.
     */
    is_mugger(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.MUG == current_task;
    }

    /**
     * Whether a gang member is engaged in armed robbery.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is committing armed robbery;
     *     false otherwise.
     */
    is_robber(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.ROBBERY == current_task;
    }

    /**
     * Whether a gang member is committing acts of terrorism.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is committing acts of terrorism;
     *     false otherwise.
     */
    is_terrorist(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.TERROR == current_task;
    }

    /**
     * Whether a gang member is in combat, charisma, or hack training.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is in combat, charisma, or hack
     *     training; false otherwise.
     */
    is_training(name) {
        return this.is_training_charisma(name)
            || this.is_training_combat(name)
            || this.is_training_hack(name);
    }

    /**
     * Whether a gang member is in charisma training.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is in charisma training;
     *     false otherwise.
     */
    is_training_charisma(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.CHARISMA == current_task;
    }

    /**
     * Whether a gang member is in combat training.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is in combat training; false otherwise.
     */
    is_training_combat(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.COMBAT == current_task;
    }

    /**
     * Whether a gang member is in hack training.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is in hack training; false otherwise.
     */
    is_training_hack(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.HACK == current_task;
    }

    /**
     * Whether a gang member is engaged in vigilante justice.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is engaged in vigilante justice;
     *     false otherwise.
     */
    is_vigilante(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.VIGILANTE == current_task;
    }

    /**
     * Whether a gang member is engaged in turf warfare.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is engaged in turf warfare;
     *     false otherwise.
     */
    is_warrior(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.TURF_WAR == current_task;
    }

    /**
     * Assign gang members to mug random people on the street.
     *
     * @param name An array of member names.
     */
    mug(name) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        // Let gang members mug random people.
        for (const s of name) {
            if (!this.is_mugger(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.MUG));
            }
        }
    }

    /**
     * Whether a gang member needs to train their Charisma stat.
     * 
     * @param name A string representing the name of a gang member.
     * @return true if the given member needs Charisma training; false otherwise.
     */
    needs_charisma_training(name) {
        assert(this.is_member(name));
        return this.charisma(name) < task_t.CHARISMA;
    }

    /**
     * Whether a gang member needs to train their combat stats.
     * 
     * @param name A string representing the name of a gang member.
     * @return true if the given member needs combat training; false otherwise.
     */
    needs_combat_training(name) {
        assert(this.is_member(name));
        if (
            (this.strength(name) < task_t.COMBAT)
                || (this.defense(name) < task_t.COMBAT)
                || (this.dexterity(name) < task_t.COMBAT)
                || (this.agility(name) < task_t.COMBAT)
        ) {
            return true;
        }
        return false;
    }

    /**
     * Whether a gang member needs to train their Hack stat.
     * 
     * @param name A string representing the name of a gang member.
     * @return true if the given member needs Hack training; false otherwise.
     */
    needs_hack_training(name) {
        assert(this.is_member(name));
        return this.hack(name) < task_t.HACK;
    }

    /**
     * Whether a gang member needs training in various stats.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member needs training in one or more stats; false otherwise.
     */
    needs_training(name) {
        assert(this.is_member(name));
        if (this.is_combatant(name)) {
            return this.needs_combat_training(name);
        }
        if (this.is_hacker(name)) {
            return this.needs_hack_training(name) || this.needs_charisma_training(name);
        }
        assert(this.is_miscellaneous(name));
        return this.needs_charisma_training(name) || this.needs_combat_training(name);
    }

    /**
     * The player's total amount of money.
     */
    #player_money() {
        return this.#ns.getServerMoneyAvailable(home);
    }

    /**
     * A random name with which to assign a new gang member.
     *
     * @param name An array of potential names for our new recruit.  Use this
     *     array to randomly choose a name for our new member.
     * @return A string representing the name of our newest member.
     */
    #random_name(name) {
        assert(name.length > 0);
        const min = 0;
        const max = name.length - 1;
        const i = random_integer(min, max);
        return name[i];
    }

    /**
     * Assign gang members to create and distribute ransomware.
     *
     * @param name An array of member names.
     */
    ransomware(name) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        // Let gang members create and distribute ransomware.
        for (const s of name) {
            if (!this.is_creating_ransomware(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.RANSOMWARE));
            }
        }
    }

    /**
     * Recruit as many new gang members as possible.  There is a maximum to how
     * many members can be in our gang.  We want our gang to have the following
     * structure:
     *
     * (1) Artillery x 1.  A gun expert and ranged fighter.  Good with bow and
     *     arrows, or missiles.
     * (2) Hacker x 1.  The computer wizard.
     * (3) Medic x 1.  This is our doctor.
     * (4) Pilot x 1.  Air support from a helicopter, drone, or aeroplane.
     * (5) Punk x n.  Low level soldiers who rake in money for the gang by
     *     committing various crimes.  As many as we can recruit.
     * (6) Spy x 1.  An expert in espionage and reconnaissance.
     * (7) Thief x 1.  Someone who steals treasure.  A sneak.
     * (8) Traitor x 1.  Someone who would likely betray the gang.
     * (9) Vanguard x 1.  Our frontliner and tank.
     *
     * @return An array of the names of the new recruits.  Each name follows
     *     the format "[Role] Full Name".  Return an empty array if we cannot
     *     recruit any new members.
     */
    recruit() {
        const newbie = new Array();
        const roster = this.#roster();
        while (this.#ns.gang.canRecruitMember()) {
            let role = "";
            if (roster.vanguard < gang_t.ROSTER.vanguard) {
                role = members.ROLE.vanguard;
            } else if (roster.hacker < gang_t.ROSTER.hacker) {
                role = members.ROLE.hacker;
            } else if (roster.punk < gang_t.ROSTER.punk) {
                role = members.ROLE.punk;
            } else if (roster.artillery < gang_t.ROSTER.artillery) {
                role = members.ROLE.artillery;
            } else if (roster.medic < gang_t.ROSTER.medic) {
                role = members.ROLE.medic;
            } else if (roster.pilot < gang_t.ROSTER.pilot) {
                role = members.ROLE.pilot;
            } else if (roster.spy < gang_t.ROSTER.spy) {
                role = members.ROLE.spy;
            } else if (roster.thief < gang_t.ROSTER.thief) {
                role = members.ROLE.thief;
            } else if (roster.traitor < gang_t.ROSTER.traitor) {
                role = members.ROLE.traitor;
            }
            assert("" != role);
            const role_lowercase = role.toLowerCase();
            const name = this.#recruit_member(gangster_t[role_lowercase], role);
            roster[role_lowercase]++;
            newbie.push(name);
        }
        return newbie;
    }

    /**
     * Recruit a member to our gang.  Assume that we can recruit.
     *
     * @param name An array of potential names for our new recruit.  Choose a
     *     random name from this array.
     * @param role A string representing the role of our new recruit.
     * @return A string representing the role and name of our new member.
     *     Follow the format "[Role] Full Name".
     */
    #recruit_member(name, role) {
        assert(this.#ns.gang.canRecruitMember());
        assert(name.length > 0);
        assert(role.length > 0);
        let s = "[" + role + "] " + this.#random_name(name);
        while (this.is_member(s)) {
            s = "[" + role + "] " + this.#random_name(name);
        }
        assert(this.#ns.gang.recruitMember(s));
        return s;
    }

    /**
     * Assign gang members to armed robbery.
     *
     * @param name An array of member names.
     */
    robbery(name) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        // Let gang members engage in armed robbery.
        for (const s of name) {
            if (!this.is_robber(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.ROBBERY));
            }
        }
    }

    /**
     * The role of a gang member.  The name of a member follows the format:
     *
     * [Role] Full Name
     *
     * We can easily extract the role from this format.
     *
     * @param name A string representing the name of a gangster.
     * @return The role of the given gang member.
     */
    role(name) {
        assert(this.is_member(name));
        const prefix = name.split(" ")[0];
        return prefix.replace(/[^a-zA-Z]/g, "");
    }

    /**
     * Our current gang members and their roles.
     *
     * @return An object as follows:
     *
     *     {
     *         "artillery": number,
     *         "hacker": number,
     *         "medic": number,
     *         "pilot": number,
     *         "punk": number,
     *         "spy": number,
     *         "thief": number,
     *         "traitor": number,
     *         "vanguard": number,
     *     }
     *
     *     Each number represents the number of members who hold the
     *     corresponding role.
     */
    #roster() {
        const member = {
            "artillery": 0,
            "hacker": 0,
            "medic": 0,
            "pilot": 0,
            "punk": 0,
            "spy": 0,
            "thief": 0,
            "traitor": 0,
            "vanguard": 0,
        };
        // Assume the name of each member follows this format:
        //
        // [Role] Full Name
        for (const name of this.#ns.gang.getMemberNames()) {
            const role = this.role(name).toLowerCase();
            member[role]++;
        }
        return member;
    }

    /**
     * The Strength stat of a gang member.
     *
     * @param name A string representing the name of a gang member.
     * @return The Strength stat of the given member.
     */
    strength(name) {
        assert(this.is_member(name));
        return this.#ns.gang.getMemberInformation(name).str;
    }

    /**
     * Assign gang members to commit acts of terrorism.
     *
     * @param name An array of member names.
     */
    terrorism(name) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        // Let gang members engage in terrorism.
        for (const s of name) {
            if (!this.is_terrorist(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.TERROR));
            }
        }
    }

    /**
     * Assign gang members to trafficking illegal arms.
     *
     * @param name An array of member names.
     */
    traffick_arms(name) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        // Let gang members engage in trafficking illegal arms.
        for (const s of name) {
            if (!this.is_arms_trafficker(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.TRAFFICK_ARMS));
            }
        }
    }

    /**
     * Train one or more stats of a gang member.  The type of stats to train
     * depends on the role of a member.
     *
     * (1) Artillery, Pilot, Punk, Vanguard.  These roles specialize
     *     exclusively in combat stats.  Any gains in Hack or Charisma are
     *     incidental.
     * (2) Hacker.  This role focuses mostly on Hack stat, but also benefits
     *     from some investment in Charisma.
     * (3) Medic, Spy, Thief, Traitor.  These roles are primarily
     *     Charisma-based, but could benefit from some training in combat stats.
     *
     * @param name An array each of whose elements is a string that represents
     *     a member name.  Each name follows the format "[Role] Full Name".  We
     *     want to raise various stats of each of these members.
     */
    train(name) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        // Train various stats.  The stat(s) to train, and the amount of time
        // spent in training, depend on a member's role.
        const hacker = name.filter(s => this.is_hacker(s));
        const combatant = name.filter(s => this.is_combatant(s));
        const other = name.filter(s => this.is_miscellaneous(s));
        assert(
            (hacker.length > 0)
                || (combatant.length > 0)
                || (other.length > 0)
        );
        this.train_combat(combatant);
        this.train_hack(hacker);
        this.train_charisma(other);
    }

    /**
     * Raise the Charisma stat of gang members.
     *
     * @param name An array each of whose elements is a string that represents
     *     a member name.  We want to raise the Charisma stat of each of these
     *     members.
     */
    train_charisma(name) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        // Charisma training.
        for (const s of name) {
            if (this.is_training_charisma(s)) {
                continue;
            }
            assert(this.#ns.gang.setMemberTask(s, task.CHARISMA));
        }
    }

    /**
     * Raise the combat stats of gang members.
     *
     * @param name An array each of whose elements is a string that represents
     *     a member name.  We want to raise the combat stats of each of these
     *     members.
     */
    train_combat(name) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        // Combat training.
        for (const s of name) {
            if (this.is_training_combat(s)) {
                continue;
            }
            assert(this.#ns.gang.setMemberTask(s, task.COMBAT));
        }
    }

    /**
     * Raise the Hack stat of gang members.
     *
     * @param name An array each of whose elements is a string that represents
     *     a member name.  We want to raise the Hack stat of each of these
     *     members.
     */
    train_hack(name) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        // Hack training.
        for (const s of name) {
            if (this.is_training_hack(s)) {
                continue;
            }
            assert(this.#ns.gang.setMemberTask(s, task.HACK));
        }
    }

    /**
     * Assign gang members to engage in turf warfare.
     *
     * @param name An array of member names.
     */
    turf_war(name) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        // Let gang members engage in turf warfare.
        for (const s of name) {
            if (!this.is_warrior(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.TURF_WAR));
            }
        }
    }

    /**
     * Assign gang members to vigilante justice.
     *
     * @param name An array of member names.
     */
    vigilante(name) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        // Let gang members be vigilantes.
        for (const s of name) {
            if (!this.is_vigilante(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.VIGILANTE));
            }
        }
    }
}
