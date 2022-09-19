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

// Boolean values.

/**
 * This is a low-end server.
 */
export const LOWEND = true;

/**
 * This is not a low-end server; opposite of low-end.
 */
export const NOT_LOWEND = !LOWEND;

// A bunch of constant values related to servers in the game world.  We exclude
// purchased servers.

/**
 * The minimum amount of RAM for a high-end server.
 */
export const high_ram = 512;

/**
 * The home server of the player.
 */
export const home = "home";

/**
 * The amount of RAM for a mid-sized home server.
 */
export const mid_ram = 128;
