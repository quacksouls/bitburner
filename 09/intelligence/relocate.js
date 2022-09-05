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

import {
    intelligence, intelligence_gain_per_minute
} from "/intelligence/util.js";
import { random_integer } from "/lib/random.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * An array of all locations in Sector-12.
 */
function all_locations() {
    const location = [
        "Alpha Enterprises", "Blade Industries", "Central Intelligence Agency",
        "Carmichael Security", "Sector-12 City Hall", "DeltaOne", "FoodNStuff",
        "Four Sigma", "Icarus Microsystems", "Iron Gym", "Joe's Guns",
        "MegaCorp", "National Security Agency", "Powerhouse Gym",
        "Rothman University", "Universal Energy"
    ];
    return location;
}

/**
 * Choose a new location to go to.
 *
 * @param loc We are currently at this location.
 * @return A new location.
 */
function choose_location(loc) {
    assert(loc.length > 0);
    const location = all_locations();
    const low = 0;
    const high = location.length - 1;
    let i = random_integer(low, high);
    let new_loc = location[i];
    while (loc == new_loc) {
        i = random_integer(low, high);
        new_loc = location[i];
    }
    assert(loc != new_loc);
    return new_loc;
}

/**
 * Determine the amount of Intelligence XP gained from relocating to a
 * different place.  We only relocate within Sector-12.
 *
 * Usage: intelligence/relocate.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const t = new Time();
    const time = t.second();
    // Relocate to a different place.  Constantly do so within one hour.  The
    // execution time is one hour, given in terms of milliseconds.
    const hour = 1;
    const minute = 60;
    const second = 60;
    const millisecond = 1000;
    const delay = hour * minute * second * millisecond;
    const end = Date.now() + delay;
    const before = intelligence(ns);
    let loc = "FoodNStuff";
    while (Date.now() < end) {
        assert(ns.singularity.goToLocation(loc));
        loc = choose_location(loc);
        await ns.sleep(time);
    }
    const after = intelligence(ns);
    const action = "Relocate within Sector-12";
    intelligence_gain_per_minute(ns, before, after, action, minute);
}
