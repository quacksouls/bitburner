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

// Various constants related to sleeves.

/**
 * Miscellaneous thresholds related to sleeves.  A sleeve is a digital carbon
 * copy (CC) of the player.
 */
export const cc_t = {
    /**
     * The maximum value at which a sleeve is fully synchronized with the
     * player's consciousness.
     */
    MAX_SYNC: 100,
    /**
     * Mugging increases all of a sleeve's combat stats.  Let a sleeve mug until
     * each of their combat stats is at least this value.
     */
    MUG_TAU: 15,
    /**
     * Shoplift increases a sleeve's Dexterity and Agility.  Let a sleeve
     * shoplift until their Dexterity and Agility are at least this value.
     */
    SHOP_TAU: 5,
};
