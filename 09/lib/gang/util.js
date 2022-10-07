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

import { members } from "/lib/constant/gang.js";
import { Gangster } from "/lib/gang/gangster.js";
import { assert } from "/lib/util.js";

/**
 * Reassign some members to other jobs.
 *
 * @param ns The Netscript API.
 * @param name An array of member names.
 */
function reassign_other(ns, name) {
    if (0 == name.length) {
        return;
    }
    const trainee = new Array();
    const other = new Array();
    const gangster = new Gangster(ns);
    for (const s of name) {
        if (gangster.needs_training(s) && !gangster.is_training(s)) {
            trainee.push(s);
            continue;
        }
        other.push(s);
    }
    gangster.train_combat(trainee);
    gangster.extort(other);
}

/**
 * Reassign a number of our gang members to vigilante justice or ethical
 * hacking.  Our objective is to lower our wanted level.
 *
 * @param ns The Netscript API.
 */
export function reassign_vigilante_or_ehacker(ns) {
    let tau = Math.floor(members.VIGILANTE);
    assert(tau > 0);
    // Lower the threshold, depending on our gang membership.
    const mid_point = Math.floor(members.MAX / 2);
    const ngangster = ns.gang.getMemberNames().length;
    const gangster = new Gangster(ns);
    if (ngangster == members.INITIAL) {
        tau = 1;
    } else if ((members.INITIAL < ngangster) && (ngangster <= mid_point)) {
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
    // of vigilante justice and into some other jobs.
    if (vigilante.length > tau) {
        // Keep the required members in vigilante justice.
        let candidate = Array.from(vigilante);
        const keep = new Array();
        while (keep.length < tau) {
            const best = strongest_member(ns, candidate);
            candidate = candidate.filter(s => s != best);
            keep.push(best);
        }
        // Move the rest into combat training or another job.
        reassign_other(ns, candidate);
        return;
    }
    // If we already have some vigilantes, then add more members to vigilante
    // justice to make up the required threshold.
    assert(vigilante.length < tau);
    tau = tau - vigilante.length;
    // Choose the top gangsters and assign them to vigilante justice.
    let candidate = ns.gang.getMemberNames();
    assert(candidate.length > 0);
    const name = new Array();
    while ((name.length < tau) && (candidate.length > 0)) {
        const best = strongest_member(ns, candidate);
        candidate = candidate.filter(s => s != best);
        name.push(best);
    }
    assert(name.length > 0);
    gangster.vigilante(name);
    reassign_other(ns, candidate);
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
