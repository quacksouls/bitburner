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

import { cities } from "/quack/lib/constant/location.js";
import { colour, empty_string } from "/quack/lib/constant/misc.js";
import { course } from "/quack/lib/constant/study.js";
import { log } from "/quack/lib/io.js";
import { all_sleeves } from "/quack/lib/sleeve/util.js";
import { has_sleeve_api } from "/quack/lib/source.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * Determine the university at which a sleeve should study.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} i The index of a sleeve.  Must be a non-negative integer.
 * @returns {string} The name of the university where a sleeve should study.  An
 *     empty string if a sleeve is located in a city that does not have a
 *     university.
 */
function choose_university(ns, i) {
    assert(i >= 0);
    const { city } = ns.sleeve.getSleeve(i);
    const { uni } = cities[city];
    return uni ?? empty_string;
}

/**
 * Assign sleeves to study at a university.
 *
 * Usage: run quack/sleeve/study.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    // Sanity check.
    if (!has_sleeve_api(ns)) {
        log(ns, "No access to Sleeve API", colour.RED);
        return;
    }
    // Study at a university.
    log(ns, course.CS);
    all_sleeves(ns).forEach((i) => {
        const uni = choose_university(ns, i);
        assert(!is_empty_string(uni));
        ns.sleeve.setToUniversityCourse(i, uni, course.CS);
    });
}
