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

/// ///////////////////////////////////////////////////////////////////////
// Various constant values related to crimes.
/// ///////////////////////////////////////////////////////////////////////

/**
 * Various constants and thresholds related to crimes.
 */
export const crimes = {
    /**
     * All available crimes.
     */
    ASSASS: "assassinate",
    DRUG: "deal drugs",
    FORGE: "bond forgery",
    GTA: "grand theft auto",
    HEIST: "heist",
    KILL: "homicide",
    KIDNAP: "kidnap and ransom",
    LARCENY: "larceny",
    MUG: "mug someone",
    ROB: "rob store",
    SHOP: "shoplift",
    TRAFFICK: "traffick illegal arms",
};

/**
 * Various thresholds related to crimes.
 */
export const crimes_t = {
    /**
     * Mugging increases all of our combat stats.  Check whether each of our
     * combat stats is at least this value.
     */
    MUG: 10,
    /**
     * The default number of times we want to commit a particular crime.
     */
    n: 10,
    /**
     * Shoplift increases our Dexterity and Agility.  Check whether each of our
     * Dexterity and Agility is at least this value.
     */
    SHOP: 5,
};
