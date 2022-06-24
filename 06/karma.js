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

/**
 * The player's karma.  This is an Easter egg, buried in the source code
 * of the game.  Refer to this file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/NetscriptFunctions/Extra.ts
 *
 * Usage: run karma.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    ns.tprint("Karma: " + ns.heart.break());
}
