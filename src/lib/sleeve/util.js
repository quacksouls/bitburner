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
import { assert } from "/lib/util.js";

// Utility functions for managing sleeves.  Use one or more of these utility
// functions to help lower the RAM cost of our scripts.  Importing one utility
// function does not incur as much RAM cost as importing the Sleeve class.

/**
 * The index of every sleeve.
 *
 * @param ns The Netscript API.
 * @return An array of sleeve indices.
 */
export function all_sleeves(ns) {
    return MyArray.sequence(ns.sleeve.getNumSleeves());
}

/**
 * Whether the combat stats of sleeves are at least a given threshold.
 *
 * @param t We want the combat stats of each sleeve to be at least this
 *     amount.
 * @return True if the combat stats of each sleeve are each at least the
 *     given amount; false otherwise.
 */
export function has_mug_threshold(ns, t) {
    const all_cc = all_sleeves(ns);
    assert(is_valid_index(ns, all_cc));
    const tau = Math.floor(t);
    assert(tau > 0);
    for (const i of all_cc) {
        const stat = ns.sleeve.getSleeveStats(i);
        if (
            stat.agility < tau
            || stat.defense < tau
            || stat.dexterity < tau
            || stat.strength < tau
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
 * @param ns The Netscript API.
 * @param t We want the Dexterity and Agility stats of each sleeve to be
 *     at least this amount.
 * @return True if the Dexterity and Agility stats of each sleeve are each
 *     at least the given amount; false otherwise.
 */
export function has_shoplift_threshold(ns, t) {
    const all_cc = all_sleeves(ns);
    assert(is_valid_index(ns, all_cc));
    const tau = Math.floor(t);
    assert(tau > 0);
    for (const i of all_cc) {
        const stat = ns.sleeve.getSleeveStats(i);
        if (stat.agility < tau || stat.dexterity < tau) {
            return bool.NOT;
        }
    }
    return bool.HAS;
}

/**
 * Whether an array contains valid sleeve indices.
 *
 * @param ns The Netscript API.
 * @param s An array of sleeve indices.
 * @return True if the array has all valid sleeve indices; false otherwise.
 */
function is_valid_index(ns, s) {
    const min = 0;
    const max = ns.sleeve.getNumSleeves();
    assert(s.length > 0);
    for (const i of s) {
        if (i < min || i >= max) {
            return bool.INVALID;
        }
    }
    return bool.VALID;
}
