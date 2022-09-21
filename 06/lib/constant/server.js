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

// A bunch of constant values related to servers in the game world.  We exclude
// purchased servers.

/**
 * The home server of the player.
 */
export const home = "home";

/**
 * Various thresholds related to our home server.
 */
export const home_tau = {
    // The minimum amount of RAM for a high-end home server.
    "RAM_HIGH": 512,
    // The minimum amount of RAM for a mid-sized home server.
    "RAM_MID": 128
};
