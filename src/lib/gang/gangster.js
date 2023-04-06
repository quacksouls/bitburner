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
    gangster_t,
    members,
    rootkit,
    task,
    task_t,
    vehicle,
    weapon,
} from "/quack/lib/constant/gang.js";
import { empty_string } from "/quack/lib/constant/misc.js";
import { money } from "/quack/lib/money.js";
import { random_integer } from "/quack/lib/random.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

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
     * @param {NS} ns The Netscript API.
     */
    constructor(ns) {
        this.#ns = ns;
    }

    /**
     * The Agility stat of a gang member.
     *
     * @param {string} name The name of a gang member.
     * @returns {number} The Agility stat of the given member.
     */
    agility(name) {
        assert(this.is_member(name));
        return this.#ns.gang.getMemberInformation(name).agi;
    }

    /**
     * Ascend a gang member.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the ascension is successful; false otherwise.
     */
    ascend(name) {
        assert(this.is_member(name));
        const asc = this.#ns.gang.getAscensionResult(name);
        if (undefined === asc) {
            return bool.FAILURE;
        }

        // Convert a number in the form 1.xyz to 1xy.  We multiply the number
        // by 100 and take the integer part.  So 1.25 would be 125.  We do this
        // because comparing floating point numbers can be tricky and result in
        // unexpected behaviour.  It is easier and simpler to compare integers.
        const to_int = (x) => Math.floor(100 * x);

        // See whether we can ascend this gang member.
        const stat = [asc.agi, asc.def, asc.dex, asc.str].map(to_int);
        const tau = to_int(gang_t.ASCEND);
        const over_threshold = (s) => s > tau;
        const ascend_this_member = stat.some(over_threshold);

        // Now ascend the gangster.
        if (ascend_this_member) {
            const result = this.#ns.gang.ascendMember(name);
            if (undefined !== result) {
                return bool.SUCCESS;
            }
        }
        return bool.FAILURE;
    }

    /**
     * Assign gang members to threaten and blackmail high-profile targets.
     *
     * @param {array<string>} name Member names.
     */
    blackmail(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members threaten and blackmail people.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_blackmailer(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.BLACKMAIL));
            }
        });
    }

    /**
     * The Charisma stat of a gang member.
     *
     * @param {string} name The name of a gang member.
     * @returns {number} The Charisma stat of the given member.
     */
    charisma(name) {
        assert(this.is_member(name));
        return this.#ns.gang.getMemberInformation(name).cha;
    }

    /**
     * Assign gang members to run a con.
     *
     * @param {array<string>} name Member names.
     */
    con(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members run a con.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_con_artist(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.CON));
            }
        });
    }

    /**
     * Assign gang members to deal drugs.
     *
     * @param {array<string>} name Member names.
     */
    deal_drugs(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members be involved in dealing drugs.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_dealing_drugs(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.DRUGS));
            }
        });
    }

    /**
     * The Defense stat of a gang member.
     *
     * @param {string} name The name of a gang member.
     * @returns {number} The Defense stat of the given member.
     */
    defense(name) {
        assert(this.is_member(name));
        return this.#ns.gang.getMemberInformation(name).def;
    }

    /**
     * The Dexterity stat of a gang member.
     *
     * @param {string} name The name of a gang member.
     * @returns {number} The Dexterity stat of the given member.
     */
    dexterity(name) {
        assert(this.is_member(name));
        return this.#ns.gang.getMemberInformation(name).dex;
    }

    /**
     * Purchase the given armour piece and equip it on a gang member.
     *
     * @param {string} name The name of a gang member.
     * @param {string} amr The name of an armour piece.
     * @returns {boolean} True if the armour is successfully purchased for the
     *     given member; false otherwise.
     */
    equip_armour(name, amr) {
        assert(this.is_member(name));
        const gang_armour = new Set(Object.values(armour));
        assert(gang_armour.has(amr));
        const cost = this.#ns.gang.getEquipmentCost(amr);
        if (this.#funds() < gang_t.COST_MULT * cost) {
            return bool.FAILURE;
        }
        return this.#ns.gang.purchaseEquipment(name, amr);
    }

    /**
     * Purchase the given Augmentation and equip it on a gang member.
     *
     * @param {string} name The name of a gang member.
     * @param {string} aug The name of an Augmentation.
     * @returns {boolean} True if the Augmentation is successfully purchased for
     *     the given member; false otherwise.
     */
    equip_augment(name, aug) {
        assert(this.is_member(name));
        const gang_aug = new Set(Object.values(gang_augment));
        assert(gang_aug.has(aug));
        const cost = this.#ns.gang.getEquipmentCost(aug);
        if (this.#funds() < gang_t.COST_MULT * cost) {
            return bool.FAILURE;
        }
        return this.#ns.gang.purchaseEquipment(name, aug);
    }

    /**
     * Purchase the given rootkit and equip it on a gang member.
     *
     * @param {string} name The name of a gang member.
     * @param {string} kit The name of a rootkit.
     * @returns {boolean} True if the rootkit is successfully purchased for the
     *     given member; false otherwise.
     */
    equip_rootkit(name, kit) {
        assert(this.is_member(name));
        const gang_rootkit = new Set(Object.values(rootkit));
        assert(gang_rootkit.has(kit));
        const cost = this.#ns.gang.getEquipmentCost(kit);
        if (this.#funds() < gang_t.COST_MULT * cost) {
            return bool.FAILURE;
        }
        return this.#ns.gang.purchaseEquipment(name, kit);
    }

    /**
     * Purchase the given vehicle and equip it on a gang member.
     *
     * @param {string} name The name of a gang member.
     * @param {string} vhc The name of a vehicle.
     * @returns {boolean} True if the vehicle is successfully purchased for the
     *     given member; false otherwise.
     */
    equip_vehicle(name, vhc) {
        assert(this.is_member(name));
        const gang_vehicle = new Set(Object.values(vehicle));
        assert(gang_vehicle.has(vhc));
        const cost = this.#ns.gang.getEquipmentCost(vhc);
        if (this.#funds() < gang_t.COST_MULT * cost) {
            return bool.FAILURE;
        }
        return this.#ns.gang.purchaseEquipment(name, vhc);
    }

    /**
     * Purchase the given weapon and equip it on a gang member.
     *
     * @param {string} name The name of a gang member.
     * @param {string} wpn The name of a weapon.
     * @returns {boolean} True if the weapon is successfully purchased for the
     *     given member; false otherwise.
     */
    equip_weapon(name, wpn) {
        assert(this.is_member(name));
        const gang_weapon = new Set(Object.values(weapon));
        assert(gang_weapon.has(wpn));
        const cost = this.#ns.gang.getEquipmentCost(wpn);
        if (this.#funds() < gang_t.COST_MULT * cost) {
            return bool.FAILURE;
        }
        return this.#ns.gang.purchaseEquipment(name, wpn);
    }

    /**
     * Assign gang members to ethical hacking.
     *
     * @param {array<string>} name Member names.
     */
    ethical_hacking(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members be involved in ethical hacking.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_ethical_hacker(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.EHACK));
            }
        });
    }

    /**
     * Assign gang members to extort civilians on our turf.
     *
     * @param {array<string>} name Member names.
     */
    extort(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members strongarm civilians.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_extortionist(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.EXTORT));
            }
        });
    }

    /**
     * Assign gang members to commit financial fraud and digital counterfeiting.
     *
     * @param {array<string>} name Member names.
     */
    fraud(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members commit financial fraud and digital counterfeiting.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_fraudster(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.FRAUD));
            }
        });
    }

    /**
     * The amount of funds available for a purchasing activity.  This method
     * takes care not to spend all our money.
     *
     * @returns {number} How much funds are available for buying equipment.
     */
    #funds() {
        return money(this.#ns) - gang_t.MONEY_RESERVE;
    }

    /**
     * Graduate gang members who have been training their stats.  Assign them to
     * mug random people.
     *
     * @param {array<string>} name Member names.
     * @param {number} threshold A trainee transitions to mugging once each of
     *     their combat stats is at least this amount.
     */
    graduate(name, threshold) {
        // Sanity checks.
        if (MyArray.is_empty(name)) {
            return;
        }
        name.forEach((s) => assert(this.is_member(s)));
        const min = Math.floor(threshold);
        assert(min > 0);

        // After training their stats, members graduate to mugging
        // random people.
        const graduate = name.filter(
            (s) => this.is_training_combat(s)
                && this.strength(s) >= min
                && this.defense(s) >= min
                && this.dexterity(s) >= min
                && this.agility(s) >= min
        );
        this.mug(graduate);
    }

    /**
     * Graduate gang members who have been training their combat stats.  Assign
     * them to mug random people.
     *
     * @param {array<string>} name Member names.
     * @param {number} threshold A combatant transitions to mugging once each of
     *     their combat stats is at least this amount.
     */
    graduate_combatant(name, threshold) {
        // Sanity checks.
        if (MyArray.is_empty(name)) {
            return;
        }
        name.forEach((s) => assert(this.is_member(s)));
        const min = Math.floor(threshold);
        assert(min > 0);

        // After training their combat stats, members graduate to mugging
        // random people.
        const graduate = name.filter(
            (s) => this.is_combatant(s)
                && this.is_training_combat(s)
                && this.strength(s) >= min
                && this.defense(s) >= min
                && this.dexterity(s) >= min
                && this.agility(s) >= min
        );
        this.mug(graduate);
    }

    /**
     * Graduate gang members who have been training their Hack stat.  Although
     * hackers primarily train their Hack stat, they could also benefit from
     * some training in their Charisma stat.  After a hacker has trained their
     * Hack and Charisma stats, assign them their first job.  The first job of
     * the hacker depends on whether we have a criminal or hacking gang.  If we
     * have a criminal gang, then the first job of the hacker is the same as the
     * first job of a miscellaneous member.  In case our gang is a hacking gang,
     * the first job of a hacker is to create and distribute ransomware.
     *
     * @param {array<string>} name Member names.
     * @param {number} threshold A hacker transitions to ransomware (or the
     *     first job of a miscellaneous gangster) once their Hack stat is at
     *     least this amount.  The transition is also affected by their Charisma
     *     stat.  If they do not have sufficient Charisma, they must train their
     *     Charisma stat before being assigned their first job.
     */
    graduate_hacker(name, threshold) {
        // Sanity checks.
        if (MyArray.is_empty(name)) {
            return;
        }
        name.forEach((s) => assert(this.is_member(s)));
        const min = Math.floor(threshold);
        assert(min > 0);

        // After training their Hack stat, a hacker also trains their Charisma
        // stat.
        const hacker = name.filter((s) => this.is_hacker(s));
        const hack_graduate = hacker.filter(
            (s) => this.is_training_hack(s) && this.hack(s) >= min
        );
        this.train_charisma(hack_graduate);

        // Once a hacker's Hack and Charisma stats are of minimum amounts,
        // assign them their first job.
        const charisma_graduate = hacker.filter(
            (s) => this.is_training_charisma(s)
                && this.charisma(s) >= task_t.CHARISMA
        );
        if (this.#ns.gang.getGangInformation().isHacking) {
            this.ransomware(charisma_graduate);
            return;
        }
        this.deal_drugs(charisma_graduate);
    }

    /**
     * Graduate miscellaneous members who have been training their Charisma
     * stat.  Although miscellaneous members primarily train their Charisma
     * stat, they could also benefit from some training in their combat stats.
     * After a miscellaneous member has trained their Charisma and combat stats,
     * assign them their first job of dealing drugs.
     *
     * @param {array<string>} name Member names.
     * @param {number} threshold A miscellaneous member transitions to dealing
     *     drugs once their Charisma stat is at least this amount.  The
     *     transition is also affected by their combat stats.  If they do not
     *     have sufficient combat stats, they must train their combat stats
     *     before being assigned their first job.
     */
    graduate_other(name, threshold) {
        // Sanity checks.
        if (MyArray.is_empty(name)) {
            return;
        }
        name.forEach((s) => assert(this.is_member(s)));
        const min = Math.floor(threshold);
        assert(min > 0);

        // After training their Charisma stat, a miscellaneous member also
        // trains their combat stats.
        const graduate = name.filter((s) => this.is_miscellaneous(s));
        const charisma_graduate = graduate.filter(
            (s) => this.is_training_charisma(s) && this.charisma(s) >= min
        );
        this.train_combat(charisma_graduate);

        // Once the Charisma and combat stats of a miscellaneous member are of
        // minimum amounts, assign them their first job.
        const combat_graduate = graduate.filter(
            (s) => this.is_training_combat(s)
                && this.strength(s) >= task_t.COMBAT
                && this.defense(s) >= task_t.COMBAT
                && this.dexterity(s) >= task_t.COMBAT
                && this.agility(s) >= task_t.COMBAT
        );
        this.deal_drugs(combat_graduate);
    }

    /**
     * The Hack stat of a gang member.
     *
     * @param {string} name The name of a gang member.
     * @returns {number} The Hack stat of the given member.
     */
    hack(name) {
        assert(this.is_member(name));
        return this.#ns.gang.getMemberInformation(name).hack;
    }

    /**
     * Whether a gang member has a particular armour piece.
     *
     * @param {string} name The name of a gang member.
     * @param {string} amr The name of an armour.
     * @returns {boolean} True if the gang member has the given armour piece;
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
     * @param {string} name The name of a gang member.
     * @param {string} aug The name of an Augmentation.
     * @returns {boolean} True if the gang member has the given Augmentation;
     *     false otherwise.
     */
    has_augment(name, aug) {
        assert(this.is_member(name));
        const gang_aug = new Set(Object.values(gang_augment));
        assert(gang_aug.has(aug));
        const equipment = new Set(
            this.#ns.gang.getMemberInformation(name).augmentations
        );
        return equipment.has(aug);
    }

    /**
     * Whether a gang member has a particular rootkit.
     *
     * @param {string} name The name of a gang member.
     * @param {string} kit The name of a rootkit.
     * @returns {boolean} True if the gang member has the given rootkit;
     *     false otherwise.
     */
    has_rootkit(name, kit) {
        assert(this.is_member(name));
        const gang_rootkit = new Set(Object.values(rootkit));
        assert(gang_rootkit.has(kit));
        const equipment = new Set(
            this.#ns.gang.getMemberInformation(name).upgrades
        );
        return equipment.has(kit);
    }

    /**
     * Whether a gang member has a particular vehicle.
     *
     * @param {string} name The name of a gang member.
     * @param {string} vhc The name of a vehicle.
     * @returns {boolean} True if the gang member has the given vehicle;
     *     false otherwise.
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
     * @param {string} name The name of a gang member.
     * @param {string} wpn The name of a weapon.
     * @returns {boolean} True if the gang member has the given weapon;
     *     false otherwise.
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
     * Assign gang members to commit identity theft.
     *
     * @param {array<string>} name Member names.
     */
    id_theft(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members commit identity theft.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_id_thief(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.ID_THEFT));
            }
        });
    }

    /**
     * Whether a gang member is engaged in trafficking illegal arms.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is trafficking illegal arms;
     *     false otherwise.
     */
    is_arms_trafficker(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.TRAFFICK_ARMS === current_task;
    }

    /**
     * Whether a gang member has been assigned the role of Artillery.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member takes on the role of
     *     Artillery; false otherwise.
     */
    is_artillery(name) {
        assert(this.is_member(name));
        return this.role(name) === members.ROLE.artillery;
    }

    /**
     * Whether a gang member is threatening and blackmailing high-profile
     * targets.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is threatening and
     *     blackmailing people; false otherwise.
     */
    is_blackmailer(name) {
        assert(this.is_member(name));
        return task.BLACKMAIL === this.#ns.gang.getMemberInformation(name).task;
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
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is a combatant;
     *     false otherwise.
     */
    is_combatant(name) {
        return (
            this.is_artillery(name)
            || this.is_pilot(name)
            || this.is_punk(name)
            || this.is_vanguard(name)
        );
    }

    /**
     * Whether a gang member is running a con.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is running a con;
     *     false otherwise.
     */
    is_con_artist(name) {
        assert(this.is_member(name));
        return task.CON === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member is creating and distributing ransomware.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is involved in the creation
     *     and distribution of ransomware; false otherwise.
     */
    is_creating_ransomware(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.RANSOMWARE === current_task;
    }

    /**
     * Whether a gang member is involved in dealing drugs.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is dealing drugs;
     *     false otherwise.
     */
    is_dealing_drugs(name) {
        assert(this.is_member(name));
        return task.DRUGS === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member is engaged in ethical hacking.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is engaged in ethical
     *     hacking; false otherwise.
     */
    is_ethical_hacker(name) {
        assert(this.is_member(name));
        return task.EHACK === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member is strongarming civilians.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is strongarming civilians;
     *     false otherwise.
     */
    is_extortionist(name) {
        assert(this.is_member(name));
        return task.EXTORT === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member is committing financial fraud and digital
     * counterfeiting.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is committing financial fraud
     *     and digital counterfeiting; false otherwise.
     */
    is_fraudster(name) {
        assert(this.is_member(name));
        return task.FRAUD === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member is a hacker.  A gangster is a hacker if they have
     * been assigned the role of Hacker.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is a hacker; false otherwise.
     */
    is_hacker(name) {
        assert(this.is_member(name));
        return this.role(name) === members.ROLE.hacker;
    }

    /**
     * Whether a gang member is operating a human trafficking ring.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is trafficking humans;
     *     false otherwise.
     */
    is_human_trafficker(name) {
        assert(this.is_member(name));
        const current_task = this.#ns.gang.getMemberInformation(name).task;
        return task.TRAFFICK_HUMAN === current_task;
    }

    /**
     * Whether a gang member is committing identity theft.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is committing identity theft;
     *     false otherwise.
     */
    is_id_thief(name) {
        assert(this.is_member(name));
        return task.ID_THEFT === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member is currently unassigned.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is idle; false otherwise.
     */
    is_idle(name) {
        assert(this.is_member(name));
        return task.IDLE === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member is laundering money.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is laundering money;
     *     false otherwise.
     */
    is_launderer(name) {
        assert(this.is_member(name));
        return task.LAUNDER === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether the given name belongs to a member of our gang.
     *
     * @param {string} name The name of a gangster.  A member's name should be
     *     prefixed with their role, according to the format:
     *     "[Role] Full Name".
     * @returns {boolean} True if our gang has the specified member;
     *     false otherwise.
     */
    is_member(name) {
        assert(!is_empty_string(name));
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
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member holds a miscellaneous role;
     *     false otherwise.
     */
    is_miscellaneous(name) {
        assert(this.is_member(name));
        const role = this.role(name);
        return (
            role === members.ROLE.medic
            || role === members.ROLE.spy
            || role === members.ROLE.thief
            || role === members.ROLE.traitor
        );
    }

    /**
     * Whether a gang member is mugging random people on the streets.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is mugging random people;
     *     false otherwise.
     */
    is_mugger(name) {
        assert(this.is_member(name));
        return task.MUG === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member is committing phishing scams.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is involved in a phishing
     *     scam; false otherwise.
     */
    is_phisher(name) {
        assert(this.is_member(name));
        return task.PHISH === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member has been assigned the role of Pilot.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member takes on the role of Pilot;
     *     false otherwise.
     */
    is_pilot(name) {
        assert(this.is_member(name));
        return this.role(name) === members.ROLE.pilot;
    }

    /**
     * Whether a gang member has been assigned the role of Punk.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member takes on the role of Punk;
     *     false otherwise.
     */
    is_punk(name) {
        assert(this.is_member(name));
        return this.role(name) === members.ROLE.punk;
    }

    /**
     * Whether a gang member is engaged in armed robbery.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is committing armed robbery;
     *     false otherwise.
     */
    is_robber(name) {
        assert(this.is_member(name));
        return task.ROBBERY === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member is committing acts of terrorism.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is committing acts of
     *     terrorism; false otherwise.
     */
    is_terrorist(name) {
        assert(this.is_member(name));
        return task.TERROR === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member is in combat, charisma, or hack training.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is in combat, charisma, or
     *     hack training; false otherwise.
     */
    is_training(name) {
        return (
            this.is_training_charisma(name)
            || this.is_training_combat(name)
            || this.is_training_hack(name)
        );
    }

    /**
     * Whether a gang member is in charisma training.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is in charisma training;
     *     false otherwise.
     */
    is_training_charisma(name) {
        assert(this.is_member(name));
        return task.CHARISMA === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member is in combat training.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is in combat training;
     *     false otherwise.
     */
    is_training_combat(name) {
        assert(this.is_member(name));
        return task.COMBAT === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member is in hack training.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is in hack training;
     *     false otherwise.
     */
    is_training_hack(name) {
        assert(this.is_member(name));
        return task.HACK === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member has been assigned the role of Vanguard.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is taking on the role of
     *     Vanguard; false otherwise.
     */
    is_vanguard(name) {
        assert(this.is_member(name));
        return this.role(name) === members.ROLE.vanguard;
    }

    /**
     * Whether a gang member is engaged in vigilante justice.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is engaged in vigilante
     *     justice; false otherwise.
     */
    is_vigilante(name) {
        assert(this.is_member(name));
        return task.VIGILANTE === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Whether a gang member is engaged in turf warfare.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member is engaged in turf warfare;
     *     false otherwise.
     */
    is_warrior(name) {
        assert(this.is_member(name));
        return task.TURF_WAR === this.#ns.gang.getMemberInformation(name).task;
    }

    /**
     * Assign gang members to launder money.
     *
     * @param {array<string>} name Member names.
     */
    launder(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members launder money.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_launderer(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.LAUNDER));
            }
        });
    }

    /**
     * Assign gang members to mug random people on the street.
     *
     * @param {array<string>} name Member names.
     */
    mug(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members mug random people.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_mugger(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.MUG));
            }
        });
    }

    /**
     * Whether a gang member needs to train their Charisma stat.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member needs Charisma training;
     *     false otherwise.
     */
    needs_charisma_training(name) {
        assert(this.is_member(name));
        return this.charisma(name) < task_t.CHARISMA;
    }

    /**
     * Whether a gang member needs to train their combat stats.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member needs combat training;
     *     false otherwise.
     */
    needs_combat_training(name) {
        if (
            this.strength(name) < task_t.COMBAT
            || this.defense(name) < task_t.COMBAT
            || this.dexterity(name) < task_t.COMBAT
            || this.agility(name) < task_t.COMBAT
        ) {
            return true;
        }
        return false;
    }

    /**
     * Whether a gang member needs to train their Hack stat.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member needs Hack training;
     *     false otherwise.
     */
    needs_hack_training(name) {
        assert(this.is_member(name));
        return this.hack(name) < task_t.HACK;
    }

    /**
     * Whether a gang member needs training in various stats.
     *
     * @param {string} name The name of a gang member.
     * @returns {boolean} True if the given member needs training in one or more
     *     stats; false otherwise.
     */
    needs_training(name) {
        return this.needs_combat_training(name);
    }

    /**
     * Assign gang members to the idle state.
     *
     * @param {array<string>} name Member names.
     */
    neutral(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members be in the idle state.
        name.forEach((s) => {
            assert(this.is_member(s));
            this.#ns.gang.setMemberTask(s, task.IDLE);
        });
    }

    /**
     * Assign gang members to commit phishing scams.
     *
     * @param {array<string>} name Member names.
     */
    phish(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members commit phishing scams.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_phisher(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.PHISH));
            }
        });
    }

    /**
     * A random name with which to assign a new gang member.
     *
     * @param {array<string>} name Potential names for our new recruit.  Use
     *     this array to randomly choose a name for our new member.
     * @returns {string} The name of our newest member.
     */
    // eslint-disable-next-line class-methods-use-this
    #random_name(name) {
        assert(!MyArray.is_empty(name));
        const min = 0;
        const max = name.length - 1;
        const i = random_integer(min, max);
        return name[i];
    }

    /**
     * Assign gang members to create and distribute ransomware.
     *
     * @param {array<string>} name Member names.
     */
    ransomware(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members create and distribute ransomware.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_creating_ransomware(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.RANSOMWARE));
            }
        });
    }

    /**
     * Recruit as many new gang members as possible.  There is a maximum to how
     * many members can be in our gang.  We want our gang to have the following
     * structure and let each member role play.
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
     * @returns {array<string>} The names of the new recruits.  Each name
     *     follows the format "[Role] Full Name".  Return an empty array if we
     *     cannot recruit any new members.
     */
    recruit() {
        const newbie = [];
        const roster = this.#roster();
        while (this.#ns.gang.canRecruitMember()) {
            let role = empty_string;
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
            assert(!is_empty_string(role));
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
     * @param {array<string>} name Potential names for our new recruit.  Choose
     *     a random name from this array.
     * @param {string} role The role of our new recruit.
     * @returns {string} The role and name of our new member.  Follow the format
     *     "[Role] Full Name".
     */
    #recruit_member(name, role) {
        assert(this.#ns.gang.canRecruitMember());
        assert(!MyArray.is_empty(name));
        assert(!is_empty_string(role));
        let s = `[${role}] ${this.#random_name(name)}`;
        while (this.is_member(s)) {
            s = `[${role}] ${this.#random_name(name)}`;
        }
        assert(this.#ns.gang.recruitMember(s));
        return s;
    }

    /**
     * Assign gang members to armed robbery.
     *
     * @param {array<string>} name Member names.
     */
    robbery(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members engage in armed robbery.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_robber(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.ROBBERY));
            }
        });
    }

    /**
     * The role of a gang member.  The name of a member follows the format:
     *
     * [Role] Full Name
     *
     * We can easily extract the role from this format.
     *
     * @param {string} name The name of a gangster.
     * @returns {string} The role of the given gang member.
     */
    role(name) {
        assert(this.is_member(name));
        const prefix = name.split(" ")[0];
        return prefix.replace(/[^a-zA-Z]/g, "");
    }

    /**
     * Our current gang members and their roles.
     *
     * @returns {object} An object as follows:
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
            artillery: 0,
            hacker: 0,
            medic: 0,
            pilot: 0,
            punk: 0,
            spy: 0,
            thief: 0,
            traitor: 0,
            vanguard: 0,
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
     * @param {string} name The name of a gang member.
     * @returns {number} The Strength stat of the given member.
     */
    strength(name) {
        assert(this.is_member(name));
        return this.#ns.gang.getMemberInformation(name).str;
    }

    /**
     * Assign gang members to commit acts of terrorism.
     *
     * @param {array<string>} name Member names.
     */
    terrorism(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members engage in terrorism.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_terrorist(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.TERROR));
            }
        });
    }

    /**
     * Assign gang members to trafficking illegal arms.
     *
     * @param {array<string>} name Member names.
     */
    traffick_arms(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members engage in trafficking illegal arms.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_arms_trafficker(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.TRAFFICK_ARMS));
            }
        });
    }

    /**
     * Assign gang members to engage in human trafficking.
     *
     * @param {array<string>} name Member names.
     */
    traffick_human(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members operate a human trafficking ring.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_human_trafficker(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.TRAFFICK_HUMAN));
            }
        });
    }

    /**
     * Train one or more stats of a gang member.
     *
     * @param {array<string>} name Member names.  Each name follows the format
     *     "[Role] Full Name".  We want to raise various stats of each of these
     *     members.
     */
    train(name) {
        // Sanity checks.
        if (MyArray.is_empty(name)) {
            return;
        }
        name.forEach((s) => assert(this.is_member(s)));

        this.train_combat(name);
    }

    /**
     * Raise the Charisma stat of gang members.
     *
     * @param {array<string>} name Member names.  We want to raise the Charisma
     *     stat of each of these members.
     */
    train_charisma(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Charisma training.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_training_charisma(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.CHARISMA));
            }
        });
    }

    /**
     * Raise the combat stats of gang members.
     *
     * @param {array<string>} name Member names.  We want to raise the combat
     *     stats of each of these members.
     */
    train_combat(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Combat training.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_training_combat(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.COMBAT));
            }
        });
    }

    /**
     * Raise the Hack stat of gang members.
     *
     * @param {array<string>} name Member names.  We want to raise the Hack stat
     *     of each of these members.
     */
    train_hack(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Hack training.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_training_hack(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.HACK));
            }
        });
    }

    /**
     * Assign gang members to engage in turf warfare.
     *
     * @param {array<string>} name Member names.
     */
    turf_war(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members engage in turf warfare.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_warrior(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.TURF_WAR));
            }
        });
    }

    /**
     * Assign gang members to vigilante justice.
     *
     * @param {array<string>} name Member names.
     */
    vigilante(name) {
        // Sanity check.
        if (MyArray.is_empty(name)) {
            return;
        }

        // Let gang members be vigilantes.
        name.forEach((s) => {
            assert(this.is_member(s));
            if (!this.is_vigilante(s)) {
                assert(this.#ns.gang.setMemberTask(s, task.VIGILANTE));
            }
        });
    }
}
