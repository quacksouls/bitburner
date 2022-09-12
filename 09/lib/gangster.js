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
    armour, FAILURE, gang_aug_crime, home, money_reserve, SUCCESS, task,
    vehicle, weapon
} from "/lib/constant.js";
import { Time } from "/lib/time.js";
import { random_integer } from "/lib/random.js";
import { assert } from "/lib/util.js";

/**
 * A class that holds various information about a gangster.
 */
export class Gangster {
    /**
     * The cost or expenditure multiplier.  Equipment and Augmentations for a
     * gang member are expensive.  Whenever we make a decision to purchase a
     * new equipment or Augmentation for a gang member, we multiply the cost of
     * the equipment or Augmentation by this multiplier.  In case we do buy the
     * new equipment, at least we would not have spent all our funds.  Do not
     * want to go bankrupt because we decided to purchase an expensive
     * equipment.
     */
    #cost_mult;
    /**
     * An array of names.  Assign one of these names to a new gang member.
     */
    #name;
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
        this.#cost_mult = 5;
        this.#name = [
            "Al Capone", "Alfhild", "Al Swearengen", "Anna Nzinga",
            "Anne Bonny", "Anne Dieu le Veut", "Artemisia of Caria",
            "Black Bart", "Blackbeard", "Bonnie Parker", "Boudicca",
            "Captain Haddock", "Captain Hook", "Charlotte Badger",
            "Clyde Barrow",
            "Donbot", "Don Corleone", "Don Logan",
            "Elise Eskilsdotter", "Elvira Hancock",
            "Fat Tony", "Francois l'Olonnais", "Fu Hao",
            "Gemma Teller Morrow", "Grace O'Malley",
            "Jack Sparrow", "Jacquotte Delahaye", "Jeanne de Clisson",
            "Joan of Arc",
            "Lady Trieu", "Long Ben", "Long John Silver",
            "Ma Barker", "Ma Beagle", "Mark Gor", "Mary Read", "Mia Wallace",
            "Nucky Thompson",
            "O-Ren Ishii",
            "Rani Velu Nachiyar", "Red Rackham", "Rusla",
            "Sadie Farrell", "Sayyida al Hurra", "Sir Francis Drake",
            "Sir Henry Morgan", "Snaps Provolone", "Stephanie St. Clair",
            "Stringer Bell",
            "Tomoe Gozen", "Tom Stall", "Tony Montana", "Tony Soprano",
            "Virginia Hill",
            "William Kidd",
            "Zheng Yi Sao"
        ];
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
        // The minimum percentage boost to a stat of a member.  Let x be the
        // ascension multiplier of a member, gained by having ascended one or
        // more times.  Let y be the next ascension multiplier, a boost to x
        // after ascending the member another time.  The value of y is
        // represented as 1.p, where 100 * p is the percentage boost to x.
        // After the next ascension, the new ascension multiplier of the member
        // would be x * y.  We want the value of y to be at least the given
        // threshold.
        const threshold = 1.25;
        // This is the y value for each stat, as explained above.
        const asc = this.#ns.gang.getAscensionResult(name);
        if (undefined == asc) {
            return FAILURE;
        }
        // Convert a number in the form 1.xyz to 1xy.  We multiply the number
        // by 100 and take the integer part.  So 1.25 would be 125.  We do this
        // because comparing floating point numbers can be tricky and result in
        // unexpected behaviour.  It is easier and simpler to compare integers.
        function to_int(x) {
            return Math.floor(100 * x);
        }
        // Ascend this gang member.
        const tau = to_int(threshold);
        if (
            (to_int(asc.agi) > tau)
                || (to_int(asc.cha) > tau)
                || (to_int(asc.def) > tau)
                || (to_int(asc.dex) > tau)
                || (to_int(asc.str) > tau)
        ) {
            const result = this.#ns.gang.ascendMember(name);
            if (undefined != result) {
                return SUCCESS;
            }
        }
        return FAILURE;
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
        if (funds < (this.#cost_mult * cost)) {
            return FAILURE;
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
        if (funds < (this.#cost_mult * cost)) {
            return FAILURE;
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
        if (funds < (this.#cost_mult * cost)) {
            return FAILURE;
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
        if (funds < (this.#cost_mult * cost)) {
            return FAILURE;
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
            const current_task = this.#ns.gang.getMemberInformation(s).task;
            if (task.EXTORT != current_task) {
                assert(this.#ns.gang.setMemberTask(s, task.EXTORT));
            }
        }
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
     * Whether the given name belongs to a member of our gang.
     *
     * @param name A string representing the name of a gang member.
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
     * @return true if the given member is enage in vigilante justice;
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
     * @return true if the given member is enage in turf warfare;
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
     * The player's total amount of money.
     */
    #player_money() {
        return this.#ns.getServerMoneyAvailable(home);
    }

    /**
     * A random name with which to assign a new gang member.
     */
    #random_name() {
        const min = 0;
        const max = this.#name.length - 1;
        const i = random_integer(min, max);
        return this.#name[i];
    }

    /**
     * Recruit as many new gang members as possible.  There is a maximum to how
     * many members can be in our gang.
     *
     * @return An array of the names of the new recruits.  Return an empty
     *     array if we cannot recruit any new members.
     */
    recruit() {
        const member = new Set(this.#ns.gang.getMemberNames());
        const newbie = new Array();
        while (this.#ns.gang.canRecruitMember()) {
            let name = this.#random_name();
            while (member.has(name)) {
                name = this.#random_name();
            }
            assert(this.#ns.gang.recruitMember(name));
            member.add(name);
            newbie.push(name);
        }
        return newbie;
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
     * Stop whatever task a gang member is involved in.
     *
     * @param name An array each of whose elements is a string that represents
     *     a member name.
     */
    stop_task(name) {
        // Sanity checks.
        assert(name.length > 0);
        name.map(
            s => assert(this.is_member(s))
        );
        // Stop the task.
        name.map(
            s => assert(this.#ns.gang.setMemberTask(s, task.IDLE))
        );
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
     * @param threshold Train the given members in combat until each of their
     *     combat stats is at least this amount.  Must be a positive integer.
     */
    async train_combat(name, threshold) {
        // Sanity checks.
        if (0 == name.length) {
            return;
        }
        name.map(
            s => assert(this.is_member(s))
        );
        const min = Math.floor(threshold);
        assert(min > 0);
        // Combat training.
        let member = Array.from(name);
        member.map(
            s => assert(this.#ns.gang.setMemberTask(s, task.COMBAT))
        );
        const t = new Time();
        const time = t.millisecond();
        while (member.length > 0) {
            for (const s of member) {
                if (
                    (this.strength(s) >= min)
                        && (this.defense(s) >= min)
                        && (this.dexterity(s) >= min)
                        && (this.agility(s) >= min)
                ) {
                    member = member.filter(m => m != s);
                    break;
                }
            }
            await this.#ns.sleep(time);
        }
        // The combat stats of each member is at least the given threshold.
        // Now quit training.
        this.stop_task(name);
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
