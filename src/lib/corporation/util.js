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

import { corp, corp_t } from "/lib/constant/corp.js";
import { cities } from "/lib/constant/location.js";
import { wait_t } from "/lib/constant/time.js";
import { Corporation } from "/lib/corporation/corp.js";
import { assert } from "/lib/util.js";

/**
 * Expand a division by opening offices in other cities.  After opening a new
 * division office, we also purchase a warehouse for that office.
 *
 * @param ns The Netscript API.
 * @param div We want to branch this division into other cities.
 * @return An array of city names, where we have opened new division offices.
 */
export async function expand_city(ns, div) {
    const org = new Corporation(ns);
    const new_office = [];
    for (const ct of cities.all) {
        if (!org.has_division_office(div, ct)) {
            org.expand_city(div, ct);
            while (!org.buy_warehouse(div, ct)) {
                await ns.sleep(wait_t.SECOND);
            }
            new_office.push(ct);
        }
    }
    return new_office;
}

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
 * Purchase the Smart Supply unlock upgrade.  This is a one-time unlockable
 * upgrade.  It applies to the entire corporation and cannot be levelled.
 *
 * @param ns The Netscript API.
 */
export function smart_supply(ns) {
    const org = new Corporation(ns);
    if (!org.has_unlock_upgrade(corp.unlock.SMART)) {
        org.buy_unlock_upgrade(corp.unlock.SMART);
    }
    org.enable_smart_supply();
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
