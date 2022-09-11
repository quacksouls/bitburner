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

// Utility functions for managing a gang.

import { Gangster } from "/lib/gangster.js";
import { assert } from "/lib/util.js";

/**
 * Re-assign a number of our strongest gang members to vigilante justice.
 * Our objective is to lower our wanted level.
 *
 * @param ns The Netscript API.
 * @param threshold We want to re-assign this many members.
 */
export function reassign_vigilante(ns, threshold) {
    const tau = Math.floor(threshold);
    assert(tau > 0);
    // Start choosing the top gangsters.
    let member = ns.gang.getMemberNames();
    assert(member.length > 0);
    const name = new Array();
    while (name.length < tau) {
        const best = strongest_member(ns, member);
        member = member.filter(s => s != best);
        name.push(best);
        if (0 == member.length) {
            break;
        }
    }
    assert(name.length > 0);
    const gangster = new Gangster(ns);
    gangster.vigilante(name);
}

/**
 * The strongest member in our gang.
 *
 * @param ns The Netscript API.
 * @param member Choose from among this array of member names.
 * @return A string representing the name of the strongest gang member.
 */
export function strongest_member(ns, member) {
    assert(member.length > 0);
    let maxstr = -Infinity;
    let name = "";
    for (const s of member) {
        const str = ns.gang.getMemberInformation(s).str;
        if (str > maxstr) {
            maxstr = str;
            name = s;
        }
    }
    assert("" != name);
    return name;
}
