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

import { initial_gangster, max_gangster } from "/lib/constant/gang.js";
import { Gangster } from "/lib/gang/gangster.js";
import { assert } from "/lib/util.js";

/**
 * Re-assign a number of our strongest gang members to vigilante justice.
 * Our objective is to lower our wanted level.
 *
 * @param ns The Netscript API.
 * @param threshold We want to re-assign this many members.  If the given
 *     threshold is greater than the current number of vigilantes, re-assign
 *     the others to strongarm civilians.
 */
export function reassign_vigilante(ns, threshold) {
    let tau = Math.floor(threshold);
    assert(tau > 0);
    // Lower the threshold, depending on our gang membership.
    const mid_point = Math.floor(max_gangster / 2);
    const ngangster = ns.gang.getMemberNames();
    const gangster = new Gangster(ns);
    if (ngangster == initial_gangster) {
        tau = 1;
    } else if ((initial_gangster < ngangster) && (ngangster <= mid_point)) {
        tau = 2;
    }
    // Do we already have the required number of members on vigilante justice?
    const vigilante = ns.gang.getMemberNames().filter(
        s => gangster.is_vigilante(s)
    );
    if (vigilante.length == tau) {
        return;
    }
    // We have more vigilantes than the given threshold.  Move some members out
    // of vigilante justice and into strongarm civilians.
    if (vigilante.length > tau) {
        let candidate = Array.from(vigilante);
        const keep = new Array();
        while (keep.length < tau) {
            const best = strongest_member(ns, candidate);
            candidate = candidate.filter(s => s != best);
            keep.push(best);
        }
        gangster.extort(candidate);
        return;
    }
    // If we already have some vigilantes, then add more members to vigilante
    // justice to make up the required threshold.
    assert(vigilante.length < tau);
    tau = tau - vigilante.length;
    // Choose the top gangsters and assign them to vigilante justice.
    let member = ns.gang.getMemberNames();
    assert(member.length > 0);
    const name = new Array();
    while (name.length < tau) {
        const best = strongest_member(ns, member);
        member = member.filter(s => s != best);
        name.push(best);
    }
    assert(member.length > 0);
    assert(name.length > 0);
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
