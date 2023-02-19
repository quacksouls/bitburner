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

import {
    has_invitation,
    intelligence,
    intelligence_gain,
} from "/quack/intelligence/util.js";
import { factions } from "/quack/lib/constant/faction.js";
import { assert } from "/quack/lib/util.js";

/**
 * Whether the given name represents a valid faction.
 *
 * @param fac A string representing the name of a faction.
 * @return true if the given name represents a valid faction;
 *     false otherwise.
 */
function is_valid_faction(fac) {
    assert(fac.length > 0);
    const faction = new Set(factions.all);
    return faction.has(fac);
}

/**
 * The amount of Intelligence XP gained from joining a faction.
 *
 * @param ns The Netscript API.
 * @param fac The name of the faction we want to join.
 */
function join_faction(ns, fac) {
    assert(is_valid_faction(fac));
    if (!has_invitation(ns, fac)) {
        return;
    }
    const before = intelligence(ns);
    assert(ns.singularity.joinFaction(fac));
    const after = intelligence(ns);
    const action = `Join faction: ${fac}`;
    intelligence_gain(ns, before, after, action);
}

/**
 * Determine the amount of Intelligence XP gained from joining a faction.
 * This script takes a command line argument.
 *
 * Usage: run quack/intelligence/faction-join.js [factionName]
 * Example: run quack/intelligence/faction-join.js Sector-12
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const faction = ns.args[0];
    join_faction(ns, faction);
}
