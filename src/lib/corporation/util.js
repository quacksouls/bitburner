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

import { corp_t } from "/lib/constant/corp.js";
import { Corporation } from "/lib/corporation/corp.js";
import { assert } from "/lib/util.js";

/**
 * Hire an employee for an office.  We want to hire an employee to fill a
 * particular role.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @param ct A string representing the name of a city.
 * @param role We want to hire for this role.
 */
export async function new_hire(ns, div, ct, role) {
    const howmany = 1; // How many times to upgrade.
    const org = new Corporation(ns);
    if (org.is_at_capacity(div, ct)) {
        while (!org.upgrade_office(div, ct, howmany)) {
            await ns.sleep(corp_t.TICK);
        }
    }
    while (!org.new_hire(div, ct, role)) {
        await ns.sleep(corp_t.TICK);
    }
}

/**
 * Convert a number in words to integer.
 *
 * @param str A word representing a number.  For example, "one" refers to
 *     the integer 1.
 * @return The integer equivalent of the given number.
 */
export function to_number(str) {
    assert(str !== "");
    const round = {
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
    };
    return round[str];
}
