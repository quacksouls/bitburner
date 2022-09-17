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
        "name": "Aevum",
        "other": undefined,
        "shop": "NetLink Technologies",
        "uni": "Summit University"
    },
    // Chongqing locations.
    "Chongqing": {
        "company": [
            "KuaiGong International",
            "Solaris Space Systems"
        ],
        "gov": undefined,
        "gym": undefined,
        "leisure": undefined,
        "name": "Chongqing",
        "other": "Church of the Machine God",
        "shop": undefined,
        "uni": undefined
    },
    // Ishima locations.
    "Ishima": {
        "company": [
            "Nova Medical",
            "Omega Software",
            "Storm Technologies"
        ],
        "gov": undefined,
        "gym": undefined,
        "leisure": undefined,
        "name": "Ishima",
        "other": "0x6C1",
        "shop": undefined,
        "uni": undefined
    },
    // New Tokyo locations.
    "NewTokyo": {
        "company": [
            "DefComm",
            "Global Pharmaceuticals",
            "Noodle Bar",
            "VitaLife"
        ],
        "gov": undefined,
        "gym": undefined,
        "leisure": "Arcade",
        "name": "New Tokyo",
        "other": undefined,
        "shop": undefined,
        "uni": undefined
    },
    // Sector 12 locations.
    "Sector12": {
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
        "leisure": undefined,
        "name": "Sector 12",
        "other": undefined,
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
        "gov": undefined,
        "gym": [
            "Millenium Fitness Gym"
        ],
        "leisure": undefined,
        "name": "Volhaven",
        "other": undefined,
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
