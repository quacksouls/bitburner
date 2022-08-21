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

import { assert } from "/lib/util.js";

// Miscellaneous utility functions.

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
