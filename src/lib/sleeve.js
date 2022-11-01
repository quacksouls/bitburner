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

import { MyArray } from "/lib/array.js";
import { bool } from "/lib/constant/bool.js";
import { crimes } from "/lib/constant/crime.js";
import { cc_t } from "/lib/constant/sleeve.js";
import { assert } from "/lib/util.js";

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
     * @param ns The Netscript API.
     */
    constructor(ns) {
        this.#ns = ns;
    }

    /**
     * The Agility stat of a sleeve.
     *
     * @param idx The index of a sleeve.
     * @return The Agility stat of the sleeve having the given index.
     */
    agility(idx) {
        assert(this.#is_valid_index([idx]));
        return this.#ns.sleeve.getSleeveStats(idx).agility;
    }

    /**
     * Indices of all sleeves.
     *
     * @return An array of all sleeve indices.
     */
    all() {
        return MyArray.sequence(this.#ns.sleeve.getNumSleeves());
    }

    /**
     * The Defense stat of a sleeve.
     *
     * @param idx The index of a sleeve.
     * @return The Defense stat of the sleeve having the given index.
     */
    defense(idx) {
        assert(this.#is_valid_index([idx]));
        return this.#ns.sleeve.getSleeveStats(idx).defense;
    }

    /**
     * The Dexterity stat of a sleeve.
     *
     * @param idx The index of a sleeve.
     * @return The Dexterity stat of the sleeve having the given index.
     */
    dexterity(idx) {
        assert(this.#is_valid_index([idx]));
        return this.#ns.sleeve.getSleeveStats(idx).dexterity;
    }

    /**
     * Whether the combat stats of sleeves are at least a given threshold.
     *
     * @param s An array of sleeve indices.
     * @param tau We want the combat stats of each sleeve to be at least this
     *     amount.
     * @return True if the combat stats of each sleeve are each at least the
     *     given amount; false otherwise.
     */
    has_mug_threshold(s, tau) {
        assert(this.#is_valid_index(s));
        assert(tau > 0);
        for (const i of s) {
            if (
                this.agility(i) < tau
                || this.defense(i) < tau
                || this.dexterity(i) < tau
                || this.strength(i) < tau
            ) {
                return bool.NOT;
            }
        }
        return bool.HAS;
    }

    /**
     * Whether the Dexterity and Agility stats of sleeves are at least a given
     * threshold.
     *
     * @param s An array of sleeve indices.
     * @param tau We want the Dexterity and Agility stats of each sleeve to be
     *     at least this amount.
     * @return True if the Dexterity and Agility stats of each sleeve are each
     *     at least the given amount; false otherwise.
     */
    has_shoplift_threshold(s, tau) {
        assert(this.#is_valid_index(s));
        assert(tau > 0);
        for (const i of s) {
            if (this.agility(i) < tau || this.dexterity(i) < tau) {
                return bool.NOT;
            }
        }
        return bool.HAS;
    }

    /**
     * Assign sleeves to commit homicide.
     *
     * @param s An array of sleeve indices.
     */
    homicide(s) {
        if (s.length === 0) {
            return;
        }
        assert(this.#is_valid_index(s));
        s.forEach((i) => this.#ns.sleeve.setToCommitCrime(i, crimes.KILL));
    }

    /**
     * Whether a sleeve is fully synchronized with the player's consciousness.
     *
     * @param idx The index of a sleeve.  Must be a non-negative integer.
     * @return True if the sleeve having the given index is fully synchronized
     *     with the player; false otherwise.
     */
    is_in_sync(idx) {
        assert(this.#is_valid_index([idx]));
        return this.#ns.sleeve.getSleeveStats(idx).sync >= cc_t.MAX_SYNC;
    }

    /**
     * Whether an array contains valid sleeve indices.
     *
     * @param s An array of sleeve indices.
     * @return True if the array has all valid sleeve indices; false otherwise.
     */
    #is_valid_index(s) {
        const min = 0;
        const max = this.#ns.sleeve.getNumSleeves();
        assert(s.length > 0);
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
     * @param s An array of sleeve indices.
     */
    mug(s) {
        if (s.length === 0) {
            return;
        }
        assert(this.#is_valid_index(s));
        s.forEach((i) => this.#ns.sleeve.setToCommitCrime(i, crimes.MUG));
    }

    /**
     * Assign sleeves to shoplift.
     *
     * @param s An array of sleeve indices.
     */
    shoplift(s) {
        if (s.length === 0) {
            return;
        }
        assert(this.#is_valid_index(s));
        s.forEach((i) => this.#ns.sleeve.setToCommitCrime(i, crimes.SHOP));
    }

    /**
     * The Strength stat of a sleeve.
     *
     * @param idx The index of a sleeve.
     * @return The Strength stat of the sleeve having the given index.
     */
    strength(idx) {
        assert(this.#is_valid_index([idx]));
        return this.#ns.sleeve.getSleeveStats(idx).strength;
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

// Utility functions for managing sleeves.

/**
 * The index of every sleeve.
 *
 * @param ns The Netscript API.
 * @return An array of sleeve indices.
 */
export function all_sleeves(ns) {
    return MyArray.sequence(ns.sleeve.getNumSleeves());
}
