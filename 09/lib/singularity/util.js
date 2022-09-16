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

import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Determine the hardware company we should visit.  The company can sell us
 * more RAM for our home server.
 *
 * @param ns The Netscript API.
 * @return A string representing the name of a hardware store.
 */
export async function choose_hardware_company(ns) {
    const city = ns.getPlayer().city;
    let shop = "";
    switch (city) {
        case "Aevum":
            shop = "NetLink Technologies";
            break;
        case "Chongqing":
            // No hardware company in Chongqing.
            shop = "";
            break;
        case "Ishima":
            shop = "Storm Technologies";
            break;
        case "New Tokyo":
            // No hardware company in New Tokyo.
            shop = "";
            break;
        case "Sector-12":
            shop = "Alpha Enterprises";
            break;
        case "Volhaven":
            shop = "OmniTek Incorporated";
            break;
        default:
            shop = "";
            break;
    }
    // There are no hardware stores in Chongqing and New Tokyo.  If we are
    // currently in either of these cities, travel to Sector-12 to increase our
    // Intelligence XP.
    if (("Chongqing" == city) || ("New Tokyo" == city)) {
        const t = new Time();
        const time = t.second();
        const new_city = "Sector-12";
        ns.singularity.goToLocation("Travel Agency");
        let success = ns.singularity.travelToCity(new_city);
        while (!success) {
            await ns.sleep(time);
            success = ns.singularity.travelToCity(new_city);
        }
        shop = "Alpha Enterprises";
    }
    assert("Chongqing" != ns.getPlayer().city);
    assert("New Tokyo" != ns.getPlayer().city);
    assert("" != shop);
    return shop;
}
