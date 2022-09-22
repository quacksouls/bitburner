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

// A bunch of constant values related to various locations in the game world.

/**
 * All cities and their locations.  Data taken from:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Locations/data/LocationNames.ts
 *
 * Below are explanation of each field in a city object.  If a city object does
 * not have a particular field, this means the city does not have the
 * corresponding location.
 *
 * (1) company := An array of company names.  We can work for these companies.
 * (2) gov := An array of names of governmental sites, e.g. police station or
 *     government agency.
 * (3) gym := An array of gym names.
 * (4) leisure := A leisure centre, e.g. casino or arcade.
 * (5) other := A miscellaneous location in the city.
 * (6) shop := A hardware shop, where we can purchase servers or upgrade our
 *     home server.
 * (7) uni := The name of the city's university.
 */
export const cities = {
    // Aevum locations.
    "Aevum": {
        "company": [
            "AeroCorp",
            "Bachman & Associates",
            "Clarke Incorporated",
            "ECorp",
            "Fulcrum Technologies",
            "Galactic Cybersystems",
            "Rho Construction",
            "Watchdog Security"
        ],
        "gov": [
            "Aevum Police Headquarters"
        ],
        "gym": [
            "Crush Fitness Gym",
            "Snap Fitness Gym"
        ],
        "leisure": "Iker Molina Casino",
        "shop": "NetLink Technologies",
        "uni": "Summit University"
    },
    // Chongqing locations.
    "Chongqing": {
        "company": [
            "KuaiGong International",
            "Solaris Space Systems"
        ],
        "other": "Church of the Machine God"
    },
    // Ishima locations.
    "Ishima": {
        "company": [
            "Nova Medical",
            "Omega Software"
        ],
        "other": "0x6C1",
        "shop": "Storm Technologies"
    },
    // New Tokyo locations.
    "New Tokyo": {
        "company": [
            "DefComm",
            "Global Pharmaceuticals",
            "Noodle Bar",
            "VitaLife"
        ],
        "leisure": "Arcade"
    },
    // Sector-12 locations.
    "Sector-12": {
        "company": [
            "Blade Industries",
            "Carmichael Security",
            "DeltaOne",
            "FoodNStuff",
            "Four Sigma",
            "Icarus Microsystems",
            "Joe's Guns",
            "MegaCorp",
            "Universal Energy"
        ],
        "gov": [
            "Central Intelligence Agency",
            "National Security Agency",
            "Sector-12 City Hall"
        ],
        "gym": [
            "Iron Gym",
            "Powerhouse Gym"
        ],
        "shop": "Alpha Enterprises",
        "uni": "Rothman University"
    },
    // Volhaven locations.
    "Volhaven": {
        "company": [
            "CompuTek",
            "Helios Labs",
            "LexoCorp",
            "NWO",
            "Omnia Cybersystems",
            "SysCore Securities"
        ],
        "gym": [
            "Millenium Fitness Gym"
        ],
        "shop": "OmniTek Incorporated",
        "uni": "ZB Institute of Technology"
    },
    // These are generic locations that are found in every city.
    "generic": {
        "hospital": "Hospital",
        "slum": "The Slums",
        "TA": "Travel Agency",
        "WSE": "World Stock Exchange"
    }
};
