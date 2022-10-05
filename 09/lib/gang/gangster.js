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
     * Graduate each gang member and assign them to mug random people.
     *
     * @param name An array each of whose elements is a string that represents
     *     a member name.  These members are currently in training and we want
     *     to graduate them.
     * @param threshold A gang member transitions to mugging once each of their
     *     combat stats is at least this amount.
     */
    graduate(name, threshold) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        const min = Math.floor(threshold);
        assert(min > 0);
        // After training, graduate to mugging random people.
        const graduate = new Array();
        for (const s of name) {
            if (!this.is_training(s)) {
                continue;
            }
            if (
                (this.strength(s) >= min)
                    && (this.defense(s) >= min)
                    && (this.dexterity(s) >= min)
                    && (this.agility(s) >= min)
            ) {
                graduate.push(s);
            }
        }
        this.mug(graduate);
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
     * Whether a gang member is in combat training.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member is in combat training; false otherwise.
     */
    is_training(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.COMBAT == current_task;
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
     * Whether a gang member needs combat training.
     *
     * @param name A string representing the name of a gang member.
     * @return true if the given member needs combat training;
     *     false otherwise.
     */
    needs_training(name) {
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
     * @return An array of the names of the new recruits.  Return an empty
     *     array if we cannot recruit any new members.
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
            const prefix = name.split(" ")[0];
            switch (prefix) {
                case "[Artillery]":
                    member.artillery++;
                    break;
                case "[Hacker]":
                    member.hacker++;
                    break;
                case "[Medic]":
                    member.medic++;
                    break;
                case "[Pilot]":
                    member.pilot++;
                    break;
                case "[Punk]":
                    member.punk++;
                    break;
                case "[Spy]":
                    member.spy++;
                    break;
                case "[Thief]":
                    member.thief++;
                    break;
                case "[Traitor]":
                    member.traitor++;
                    break;
                case "[Vanguard]":
                    member.vanguard++;
                    break;
                default:
                    // Something is wrong.  We should have one of the above
                    // roles.
                    assert(false);
                    break;
            }
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
            if (this.is_training(s)) {
                continue;
            }
            assert(this.#ns.gang.setMemberTask(s, task.COMBAT));
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
