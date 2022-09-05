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

import { intelligence, intelligence_gain } from "/intelligence/util.js";
import { all_cities } from "/lib/constant.js";
import { assert } from "/lib/util.js";

/**
 * Whether the given city name is valid.
 *
 * @param c A string representing a city name.
 * @return true if the given string represents a city in the game world;
 *     false othwerise.
 */
function is_valid_city(c) {
    assert(c.length > 0);
    const city = all_cities();
    return city.includes(c);
}

/**
 * Determine the amount of Intelligence XP gained from travelling to a
 * different city.  This script accepts a command line argument.
 *
 * Usage: intelligence/travel.js [city]
 * Usage: intelligence/travel.js Chongqing
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const city = ns.args[0];
    assert(is_valid_city(city));
    const before = intelligence(ns);
    assert(ns.singularity.travelToCity(city));
    const after = intelligence(ns);
    const action = "Travel to " + city;
    intelligence_gain(ns, before, after, action);
}
