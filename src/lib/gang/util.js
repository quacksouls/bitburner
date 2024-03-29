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
// Utility functions for managing a gang.
/// ///////////////////////////////////////////////////////////////////////

import { MyArray } from "/quack/lib/array.js";
import { members } from "/quack/lib/constant/gang.js";
import { empty_string } from "/quack/lib/constant/misc.js";
import { Gangster } from "/quack/lib/gang/gangster.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * Choose the number of gang members to assign to vigilante justice.  The number
 * of gangsters who will be assigned to these jobs depends on our current
 * membership.
 *
 * @param {NS} ns The Netscript API.
 * @returns {number} The number of members to assign to vigilante justice.
 */
function choose_vigilante_threshold(ns) {
    assert(!ns.gang.getGangInformation().isHacking);
    assert(members.VIGILANTE > 0);

    // Lower the threshold, depending on our gang membership.
    const mid_point = Math.floor(members.MAX / 2);
    const quarter_point = mid_point + Math.floor(mid_point / 2);
    const ngangster = ns.gang.getMemberNames().length;
    if (ngangster === members.INITIAL) {
        return 1;
    }
    if (members.INITIAL < ngangster && ngangster <= mid_point) {
        return 2;
    }
    if (mid_point < ngangster && ngangster <= quarter_point) {
        return 3;
    }
    assert(quarter_point < ngangster && ngangster <= members.MAX);
    return Math.floor(members.VIGILANTE);
}

/**
 * Whether we already have enough gang members assigned to vigilante justice.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if enough gangsters are assigned to vigilante
 *     justice; false otherwise.
 */
function has_enough_vigilante(ns) {
    assert(!ns.gang.getGangInformation().isHacking);
    const tau = choose_vigilante_threshold(ns);
    const gangster = new Gangster(ns);
    const vigilante = ns.gang
        .getMemberNames()
        .filter((s) => gangster.is_vigilante(s));
    return tau === vigilante.length;
}

/**
 * We have too many gang members in vigilante justice.  Reassign the excess
 * members to some other jobs.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} threshold We want this many members on vigilante justice.
 */
function reassign_excess_vigilante(ns, threshold) {
    assert(!ns.gang.getGangInformation().isHacking);
    const tau = Math.floor(threshold);
    assert(tau > 0);
    const gangster = new Gangster(ns);
    const member = ns.gang.getMemberNames();
    const vigilante = member.filter((s) => gangster.is_vigilante(s));
    const hacker = member.filter((s) => gangster.is_hacker(s));
    const vanguard = vigilante.filter((s) => gangster.is_vanguard(s));

    // The Vanguard is always the first to be assigned to vigilante justice.
    // The Hacker is always the next member to be assigned to this task.
    const not_vanguard = (s) => !gangster.is_vanguard(s);
    let vigilante_hacker = vanguard.concat(hacker);
    vigilante_hacker = vigilante_hacker.concat(vigilante.filter(not_vanguard));
    assert(vigilante_hacker.length > tau);
    const candidate = [];
    while (vigilante_hacker.length > tau) {
        candidate.push(vigilante_hacker.pop());
    }
    assert(candidate.length > 0);
    gangster.vigilante(vigilante_hacker);

    // Reassign the rest to other jobs.
    reassign_other(ns, candidate);
}

/**
 * Reassign some members to other jobs.
 *
 * @param {NS} ns The Netscript API.
 * @param {array<string>} name Member names.
 */
function reassign_other(ns, name) {
    assert(!ns.gang.getGangInformation().isHacking);
    if (MyArray.is_empty(name)) {
        return;
    }
    const trainee = [];
    const other = [];
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
 * Reassign a number of our gang members to vigilante justice before doing a
 * soft reset.  Our objective is to lower our wanted level while other gang
 * members are involved in other jobs.
 *
 * @param {NS} ns The Netscript API.
 */
export function reassign_soft_reset(ns) {
    assert(!ns.gang.getGangInformation().isHacking);

    // We want only one gang member on vigilante justice.  That member is the
    // Vanguard.
    const gangster = new Gangster(ns);
    const member = ns.gang.getMemberNames();
    const vanguard = member.filter((s) => gangster.is_vanguard(s));
    assert(vanguard.length === 1);
    gangster.vigilante(vanguard);

    // Other members currently on vigilante justice are reassigned to other
    // jobs.
    const vigilante = member.filter(
        (s) => gangster.is_vigilante(s) && !gangster.is_vanguard(s)
    );
    vigilante.forEach((s) => {
        if (gangster.is_hacker(s)) {
            gangster.blackmail([s]);
        } else {
            gangster.extort([s]);
        }
    });
}

/**
 * We do not have enough gang members in vigilante justice.  Reassign some
 * members to these jobs.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} threshold Have this many members on vigilante justice.
 */
function reassign_to_vigilante(ns, threshold) {
    assert(!ns.gang.getGangInformation().isHacking);
    const tau = Math.floor(threshold);
    assert(tau > 0);

    // All gang members who should be on vigilante justice.
    const gangster = new Gangster(ns);
    const member = ns.gang.getMemberNames();
    const vanguard = member.filter((s) => gangster.is_vanguard(s));
    const hacker = member.filter((s) => gangster.is_hacker(s));
    const artillery = member.filter((s) => gangster.is_artillery(s));
    const pilot = member.filter((s) => gangster.is_pilot(s));

    // Determine which members to assign to vigilante justice.  The Vanguard is
    // always the first to be assigned to vigilante justice.  This is followed
    // by the Hacker.  Next comes the Artillery and the Pilot, who are assigned
    // to vigilante justice in that order.
    const candidate = [vanguard, hacker, artillery, pilot].flat();
    const vigilante = member.filter((s) => gangster.is_vigilante(s));
    assert(vigilante.length < candidate.length);
    assert(vigilante.length < tau);
    while (vigilante.includes(candidate[0])) {
        candidate.shift();
    }
    const nmore = tau - vigilante.length;
    assert(nmore > 0);
    while (candidate.length > nmore) {
        candidate.pop();
    }

    // Assign the candidates to vigilante justice.
    gangster.vigilante(candidate);
}

/**
 * Reassign a number of our gang members to vigilante justice.  Our objective is
 * to lower our wanted level.
 *
 * @param {NS} ns The Netscript API.
 */
export function reassign_vigilante(ns) {
    assert(!ns.gang.getGangInformation().isHacking);

    // Initially, our gang has a small number of members.  Assigning one or
    // more members to vigilante justice would do precious little to decrease
    // our wanted level.  With such a small membership, it is more important to
    // raise the members' stats and recruit more members than to lower our
    // wanted level.
    const member = ns.gang.getMemberNames();
    assert(member.length > members.HALF);

    // Do we already have the required number of members on vigilante justice?
    if (has_enough_vigilante(ns)) {
        return;
    }

    // We have more vigilantes than the given threshold.  Move some members out
    // of vigilante justice and into some other jobs.
    const gangster = new Gangster(ns);
    const tau = choose_vigilante_threshold(ns);
    const vigilante = member.filter((s) => gangster.is_vigilante(s));
    if (vigilante.length > tau) {
        reassign_excess_vigilante(ns, tau);
        return;
    }

    // If we already have some vigilantes, then add more members to vigilante
    // justice to make up the required threshold.
    assert(vigilante.length < tau);
    reassign_to_vigilante(ns, tau);
}

/**
 * The strongest member in our gang.
 *
 * @param {NS} ns The Netscript API.
 * @param {array<string>} member Choose from among these member names.
 * @returns {string} The name of the strongest gang member.
 */
export function strongest_member(ns, member) {
    assert(member.length > 0);
    let maxstr = -Infinity;
    let name = empty_string;
    for (const s of member) {
        const { str } = ns.gang.getMemberInformation(s);
        if (str > maxstr) {
            maxstr = str;
            name = s;
        }
    }
    assert(!is_empty_string(name));
    return name;
}
