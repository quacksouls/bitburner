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
import { crimes } from "/quack/lib/constant/crime.js";
import { empty_string } from "/quack/lib/constant/misc.js";
import { cc_t } from "/quack/lib/constant/sleeve.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * A class to manage various aspects of sleeves.
 */
export class Sleeve {
    /**
     * The Netscript API.
     */
    #ns;

    /**
     * Construct a sleeve object.
     *
     * @param {NS} ns The Netscript API.
     */
    constructor(ns) {
        this.#ns = ns;
    }

    /**
     * The Agility stat of a sleeve.
     *
     * @param {number} idx The index of a sleeve.
     * @returns {number} The Agility stat of the sleeve having the given index.
     */
    agility(idx) {
        assert(this.#is_valid_index([idx]));
        return this.#ns.sleeve.getSleeve(idx).skills.agility;
    }

    /**
     * Indices of all sleeves.
     *
     * @returns {array<number>} Sleeve indices.
     */
    all() {
        return MyArray.sequence(this.#ns.sleeve.getNumSleeves());
    }

    /**
     * Purchase an Augmentation for a sleeve.
     *
     * @param {number} idx The index of a sleeve.
     * @param {string} aug Purchase this Augmentation for the sleeve.
     * @returns {boolean} True if the given Augmentation was successfully
     *     purchased and installed on the sleeve; false otherwise.
     */
    buy_augment(idx, aug) {
        assert(this.#is_valid_index([idx]));
        if (this.is_in_shock(idx)) {
            return bool.NOT_PURCHASED;
        }
        return this.#ns.sleeve.purchaseSleeveAug(idx, aug);
    }

    /**
     * The cheapest available Augmentation that a sleeve can purchase.
     *
     * @param {number} idx The index of a sleeve.
     * @returns {array} An array [name, cost] as follows.  An empty array if no
     *     Augmentations are available for purchase.
     *     (1) name := A string representing the name of the cheapest
     *         Augmentation that the given sleeve can purchase at the moment.
     *     (2) cost := The cost of the cheapest Augmentation.
     */
    cheapest_augment(idx) {
        // Sanity checks.
        assert(this.#is_valid_index([idx]));
        const aug = this.#ns.sleeve.getSleevePurchasableAugs(idx);
        if (MyArray.is_empty(aug)) {
            return [];
        }

        // Find the cheapest Augmentation.
        let name = empty_string;
        let cost = Infinity;
        aug.forEach((a) => {
            if (a.cost < cost) {
                cost = a.cost;
                name = a.name;
            }
        });
        assert(!is_empty_string(name));
        assert(cost < Infinity);
        return [name, cost];
    }

    /**
     * The Defense stat of a sleeve.
     *
     * @param {number} idx The index of a sleeve.
     * @returns {number} The Defense stat of the sleeve having the given index.
     */
    defense(idx) {
        assert(this.#is_valid_index([idx]));
        return this.#ns.sleeve.getSleeve(idx).skills.defense;
    }

    /**
     * The Dexterity stat of a sleeve.
     *
     * @param {number} idx The index of a sleeve.
     * @returns {number} The Dexterity stat of the given sleeve.
     */
    dexterity(idx) {
        assert(this.#is_valid_index([idx]));
        return this.#ns.sleeve.getSleeve(idx).skills.dexterity;
    }

    /**
     * Whether to graduate sleeves from training stats by mugging people.
     *
     * @param {array<number>} s Sleeve indices.  We want to graduate these
     *     sleeves.
     * @returns {boolean} True if each sleeve in the given array can graduate;
     *     false otherwise or the array is empty.
     */
    graduate_mug(s) {
        if (MyArray.is_empty(s)) {
            return bool.NOT;
        }
        assert(this.#is_valid_index(s));
        for (const i of s) {
            if (!this.has_mug_threshold(i)) {
                return bool.NOT;
            }
        }
        return bool.GRADUATE;
    }

    /**
     * Whether to graduate sleeves from training stats by shoplift.
     *
     * @param {array<number>} s Sleeve indices.  We want to graduate these
     *     sleeves.
     * @returns {boolean} True if each sleeve in the given array can graduate;
     *     false otherwise or the array is empty.
     */
    graduate_shoplift(s) {
        if (MyArray.is_empty(s)) {
            return bool.NOT;
        }
        assert(this.#is_valid_index(s));
        for (const i of s) {
            if (!this.has_shoplift_threshold(i)) {
                return bool.NOT;
            }
        }
        return bool.GRADUATE;
    }

    /**
     * Whether the combat stats of a sleeve are at least the threshold for
     * mugging people.
     *
     * @param {number} idx A sleeve index.
     * @returns {boolean} True if the combat stats of a sleeve are each at least
     *     the threshold for mugging people; false otherwise.
     */
    has_mug_threshold(idx) {
        assert(this.#is_valid_index([idx]));
        return (
            this.agility(idx) >= cc_t.MUG
            && this.defense(idx) >= cc_t.MUG
            && this.dexterity(idx) >= cc_t.MUG
            && this.strength(idx) >= cc_t.MUG
        );
    }

    /**
     * Whether the Dexterity and Agility stats of a sleeve are at least the
     * threshold for shoplift.
     *
     * @param {number} idx A sleeve index.
     * @returns {boolean} True if the Dexterity and Agility stats of a sleeve
     *     are each at least the threshold for shoplift; false otherwise.
     */
    has_shoplift_threshold(idx) {
        assert(this.#is_valid_index([idx]));
        return (
            this.agility(idx) >= cc_t.SHOP && this.dexterity(idx) >= cc_t.SHOP
        );
    }

    /**
     * Assign sleeves to commit homicide.
     *
     * @param {array<number>} s Sleeve indices.
     */
    homicide(s) {
        if (MyArray.is_empty(s)) {
            return;
        }
        assert(this.#is_valid_index(s));
        s.forEach((i) => this.#ns.sleeve.setToCommitCrime(i, crimes.KILL));
    }

    /**
     * Whether a sleeve is in shock.  A sleeve is in shock if its shock value is
     * greater than 0.
     *
     * @param {number} idx A sleeve index.  Must be a non-negative integer.
     * @returns {boolean} True if the sleeve with the given index has a shock
     *     value greater than 0; false otherwise.
     */
    is_in_shock(idx) {
        assert(this.#is_valid_index([idx]));
        return this.#ns.sleeve.getSleeve(idx).shock > cc_t.MIN_SHOCK;
    }

    /**
     * Whether a sleeve is fully synchronized with the player's consciousness.
     *
     * @param {number} idx A sleeve index.  Must be a non-negative integer.
     * @returns {boolean} True if the sleeve having the given index is fully
     *     synchronized with the player; false otherwise.
     */
    is_in_sync(idx) {
        assert(this.#is_valid_index([idx]));
        return this.#ns.sleeve.getSleeve(idx).sync >= cc_t.MAX_SYNC;
    }

    /**
     * Whether an array contains valid sleeve indices.
     *
     * @param {array<number>} s Sleeve indices.
     * @returns {boolean} True if the array has all valid sleeve indices;
     *     false otherwise.
     */
    #is_valid_index(s) {
        const min = 0;
        const max = this.#ns.sleeve.getNumSleeves();
        assert(!MyArray.is_empty(s));
        for (const i of s) {
            if (i < min || i >= max) {
                return bool.INVALID;
            }
        }
        return bool.VALID;
    }

    /**
     * Assign sleeves to mug people.
     *
     * @param {array<number>} s Sleeve indices.
     */
    mug(s) {
        if (MyArray.is_empty(s)) {
            return;
        }
        assert(this.#is_valid_index(s));
        s.forEach((i) => this.#ns.sleeve.setToCommitCrime(i, crimes.MUG));
    }

    /**
     * Assign sleeves to shoplift.
     *
     * @param {array<number>} s Sleeve indices.
     */
    shoplift(s) {
        if (MyArray.is_empty(s)) {
            return;
        }
        assert(this.#is_valid_index(s));
        s.forEach((i) => this.#ns.sleeve.setToCommitCrime(i, crimes.SHOP));
    }

    /**
     * The Strength stat of a sleeve.
     *
     * @param {number} idx The index of a sleeve.
     * @returns {number} The Strength stat of the sleeve having the given index.
     */
    strength(idx) {
        assert(this.#is_valid_index([idx]));
        return this.#ns.sleeve.getSleeve(idx).skills.strength;
    }

    /**
     * Assign sleeves to shock recovery.  Only assign those sleeves whose shock
     * values are greater than 0.
     */
    shock_recovery() {
        this.all()
            .filter((i) => this.is_in_shock(i))
            .forEach((j) => this.#ns.sleeve.setToShockRecovery(j));
    }

    /**
     * Assign sleeves to synchronize with the consciousness of the player.  Only
     * assign those sleeves whose consciousness is not yet fully synchronized.
     */
    synchronize() {
        this.all()
            .filter((i) => !this.is_in_sync(i))
            .forEach((j) => this.#ns.sleeve.setToSynchronize(j));
    }
}
