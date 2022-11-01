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
