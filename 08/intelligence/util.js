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

import { all_programs, home } from "/lib/constant.js";
import { assert } from "/lib/util.js";

// Miscellaneous utility functions.

/**
 * Whether we have the given program on our home server.
 *
 * @param ns The Netscript API.
 * @param program A string representing the name of a program.
 * @return true if we already have the given program;
 *     false otherwise.
 */
export function has_program(ns, program) {
    assert(is_valid_program(program));
    return ns.fileExists(program, home);
}

/**
 * The amount of Intelligence XP the player has.
 *
 * @param ns The Netscript API.
 */
export function intelligence(ns) {
    return ns.getPlayer().exp.intelligence;
}

/**
 * Print the gain in Intelligence XP.
 *
 * @param ns The Netscript API.
 * @param before The amount of Intelligence XP before a certain action.
 * @param after The amount of Intelligence XP after performing a certain
 *     action.
 * @param action The action whose performance might possibly result in a gain
 *     in Intelligence XP.
 */
export function intelligence_gain(ns, before, after, action) {
    assert(before >= 0);
    assert(after >= 0);
    assert(action.length > 0);
    const gain = after - before;
    ns.tprint(action);
    ns.tprint("Intelligence before: " + before);
    ns.tprint("Intelligence after: " + after);
    ns.tprint("Intelligence gain: " + gain);
    ns.tprint("");
}

/**
 * Print the gain in Intelligence XP per minute.
 *
 * @param ns The Netscript API.
 * @param before The amount of Intelligence XP before a certain action.
 * @param after The amount of Intelligence XP after performing a certain
 *     action.
 * @param action The action whose performance might possibly result in a gain
 *     in Intelligence XP.
 * @param minute Divide the Intelligence XP gain by this many minutes.
 */
export function intelligence_gain_per_minute(
    ns, before, after, action, minute
) {
    assert(before >= 0);
    assert(after >= 0);
    assert(action.length > 0);
    assert(minute > 0);
    const gain = after - before;
    const gpm = gain / minute;
    ns.tprint(action);
    ns.tprint("Intelligence before: " + before);
    ns.tprint("Intelligence after: " + after);
    ns.tprint("Intelligence gain: " + gain);
    ns.tprint("Intelligence gain per minute: " + gpm);
    ns.tprint("");
}

/**
 * Whether the given name is a valid program.
 *
 * @param name A string representing the name of a program.
 * @return true if the given name is a valid program;
 *     false otherwise.
 */
export function is_valid_program(name) {
    assert(name.length > 0);
    const program = all_programs();
    return program.has(name);
}
