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
// A bunch of constant values.  These can be numeric constants or string
// constants.
/// ///////////////////////////////////////////////////////////////////////

/**
 * The bases for various number systems.
 */
export const base = {
    /**
     * The base of the binary number system.
     */
    BINARY: 2,
    /**
     * The base of the decimal number system.
     */
    DECIMAL: 10,
};

/**
 * Use ANSI escape codes to add colour.  Refer to these pages for more details:
 *
 * https://www.lihaoyi.com/post/BuildyourownCommandLinewithANSIescapecodes.html
 * https://talyian.github.io/ansicolors/
 */
export const colour = {
    DARK_GREEN: "\u001b[38;5;22m",
    GREEN: "\u001b[32m",
    RED: "\u001b[31m",
    RESET: "\u001b[0m",
};

/**
 * The empty string.
 */
export const empty_string = "";

/**
 * The minimum required Hack stat to enable a player to work at most companies.
 */
export const work_hack_lvl = 250;
