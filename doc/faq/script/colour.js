/**
 * Copyright (C) 2023 Duck McSouls
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
 * Generate all possibilities for a type of colours.
 *
 * @param {string} type Either "b" for background colours or "f" for
 *     foreground colours.
 * @returns All possible colours of the given type.
 */
function generate_colours(type) {
    const msg = "ABC";
    const reset = "\u001b[0m";
    const prefix = type === "f" ? "\x1b[38;5;" : "\x1b[48;5;";
    const colourize = (i) => `${prefix}${i}m${msg}${reset}`;
    return [...Array(256).keys()].map(colourize).join(" ");
}

/**
 * Use ANSI hexadecimal escape code to colour text with foreground and
 * background colours.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Colour a text as red.
    const red = "\x1b[31m";
    const reset = "\x1b[0m";
    ns.tprintf(`${red}This is red.${reset}`);

    // Generate all possible foreground/background colours.
    ns.tprintf("\nAll possible foreground colours.");
    ns.tprintf(`${generate_colours("f")}`);
    ns.tprintf("\nAll possible background colours.");
    ns.tprintf(`${generate_colours("b")}`);
}
