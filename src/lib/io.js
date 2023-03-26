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

import { io } from "/quack/lib/constant/io.js";
import { colour } from "/quack/lib/constant/misc.js";
import { assert } from "/quack/lib/util.js";

/// ///////////////////////////////////////////////////////////////////////
// Miscellaneous functions for input/output.
/// ///////////////////////////////////////////////////////////////////////

/**
 * Create a text file.  We typically use a text file to communicate with various
 * scripts.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} fname Full path of the file name.
 * @param {string} data Write this data to the text file.
 */
export function create_file(ns, fname, data) {
    assert(fname !== "");
    assert(data !== "");
    ns.write(fname, data, io.WRITE);
}

/**
 * Print a log to the terminal.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} msg Print this message to the terminal.
 * @param {string} clr Use this colour to print the given message.  Must be a
 *     string representation of a Unicode escape sequence.  Default is empty
 *     string, which means we use the default colour theme of the terminal.
 */
export function log(ns, msg, clr = "") {
    const date = new Date(Date.now()).toISOString();
    const suffix = clr !== "" ? colour.RESET : "";
    ns.tprintf(`[${date}] ${clr}${ns.getScriptName()}: ${msg}${suffix}`);
}

/**
 * Convert a RAM amount in the game to a value suitable for display in the
 * terminal.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} n An amount of RAM as returned by a function in the game.
 * @returns {string} An amount of RAM suitable to be displayed in the terminal.
 */
export function format_ram(ns, n) {
    assert(n > 0);
    const byte_factor = 1e9;
    return ns.nFormat(n * byte_factor, "0.00b");
}
