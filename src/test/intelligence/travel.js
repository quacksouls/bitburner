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

import { intelligence, intelligence_gain } from "/quack/intelligence/util.js";
import { assert, is_valid_city } from "/quack/lib/util.js";

/**
 * Determine the amount of Intelligence XP gained from travelling to a
 * different city.  This script accepts a command line argument.
 *
 * Usage: quack/intelligence/travel.js [city]
 * Example: quack/intelligence/travel.js Chongqing
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const city = ns.args[0];
    assert(is_valid_city(city));
    const before = intelligence(ns);
    assert(ns.singularity.travelToCity(city));
    const after = intelligence(ns);
    const action = `Travel to ${city}`;
    intelligence_gain(ns, before, after, action);
}
