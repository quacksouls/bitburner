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

// Miscellaneous helper functions related to the Singularity API.

import { cities } from "/lib/constant/location.js";
import { wait_t } from "/lib/constant/time.js";

/**
 * Determine the hardware company we should visit.  The company can sell us
 * more RAM for our home server.
 *
 * @param ns The Netscript API.
 * @return A string representing the name of a hardware store.
 */
export async function choose_hardware_company(ns) {
    let city = ns.getPlayer().city;
    // There are no hardware stores in Chongqing and New Tokyo.  If we are
    // currently in either of these cities, travel to Sector-12 to increase our
    // Intelligence XP.
    if (("Chongqing" == city) || ("New Tokyo" == city)) {
        city = "Sector-12";
        ns.singularity.goToLocation(cities.generic["TA"]);
        let success = ns.singularity.travelToCity(city);
        while (!success) {
            await ns.sleep(wait_t.SECOND);
            success = ns.singularity.travelToCity(city);
        }
    }
    return cities[city].shop;
}
