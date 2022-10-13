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

import {
    has_invitation,
    intelligence,
    intelligence_gain,
} from "/intelligence/util.js";
import { factions } from "/lib/constant/faction.js";
import { assert } from "/lib/util.js";

/**
 * The amount of Intelligence XP gained from joining a faction.
 *
 * @param ns The Netscript API.
 * @param fac The name of the faction we want to join.
 */
function join_factions(ns) {
    for (const fac of factions.all) {
        if (has_invitation(ns, fac)) {
            const before = intelligence(ns);
            assert(ns.singularity.joinFaction(fac));
            const after = intelligence(ns);
            const action = `Join faction: ${fac}`;
            intelligence_gain(ns, before, after, action);
        }
    }
}

/**
 * Determine the amount of Intelligence XP gained from joining a faction.  We
 * join all factions for which we have outstanding invitations.
 *
 * Usage: run intelligence/faction-join-all.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    join_factions(ns);
}
