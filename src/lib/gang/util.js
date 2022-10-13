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
 * Choose the number of gang members to assign to vigilante justice or ethical
 * hacking.  The number of gangsters who will be assigned to these jobs depends
 * on our current membership.
 *
 * @param ns The Netscript API.
 * @return The number of members to assign to vigilante justice or ethical
 *     hacking.
 */
function choose_vigilante_ehacker_threshold(ns) {
    assert(members.EHACK > 0);
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
    return Math.floor(members.EHACK + members.VIGILANTE);
}

/**
 * Whether we already have enough gang members assigned to vigilante justice or
 * ethical hacking.
 *
 * @param ns The Netscript API.
 * @return true if enough gangsters are assigned to vigilante justice or
 *     ethical hacking; false otherwise.
 */
function has_enough_vigilante_ehacker(ns) {
    const tau = choose_vigilante_ehacker_threshold(ns);
    const gangster = new Gangster(ns);
    const vigilante_ehacker = ns.gang
        .getMemberNames()
        .filter(
            (s) => gangster.is_vigilante(s) || gangster.is_ethical_hacker(s)
        );
    return tau === vigilante_ehacker.length;
}

/**
 * We have too many gang members in vigilante justice or ethical hacking.
 * Reassign the excess members to some other jobs.
 *
 * @param ns The Netscript API.
 * @param threshold We want this many members to be in vigilante justice or
 *     ethical hacking.
 */
function reassign_excess_vigilante_ehacker(ns, threshold) {
    const tau = Math.floor(threshold);
    assert(tau > 0);
    const gangster = new Gangster(ns);
    const vigilante = ns.gang
        .getMemberNames()
        .filter((s) => gangster.is_vigilante(s));
    const hacker = ns.gang
        .getMemberNames()
        .filter((s) => gangster.is_hacker(s));
    const vanguard = vigilante.filter((s) => gangster.is_vanguard(s));
    // The Vanguard is always the first to be assigned to vigilante justice.
    // The Hacker is always the next member to be assigned to ethical hacking.
    let vigilante_ehacker = vanguard.concat(hacker);
    vigilante_ehacker = vigilante_ehacker.concat(
        vigilante.filter((s) => !gangster.is_vanguard(s))
    );
    assert(vigilante_ehacker.length > tau);
    const candidate = new Array();
    while (vigilante_ehacker.length > tau) {
        candidate.push(vigilante_ehacker.pop());
    }
    assert(candidate.length > 0);
    gangster.vigilante(vigilante_ehacker.filter((s) => !gangster.is_hacker(s)));
    // If we are in a criminal gang, then there is no option to perform ethical
    // hacking.  In that case, assign the Hacker to vigilante justice as well.
    if (ns.gang.getGangInformation().isHacking) {
        gangster.ethical_hacking(hacker);
    } else {
        gangster.vigilante(hacker);
    }
    // Reassign the rest to other jobs.
    reassign_other(ns, candidate);
}

/**
 * Reassign some members to other jobs.
 *
 * @param ns The Netscript API.
 * @param name An array of member names.
 */
function reassign_other(ns, name) {
    if (name.length === 0) {
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
 * hacking before doing a soft reset.  Our objective is to lower our wanted
 * level while other gang members are involved in other jobs.
 *
 * @param ns The Netscript API.
 */
export function reassign_soft_reset(ns) {
    // We want only one gang member on vigilante justice.  That member is the
    // Vanguard.
    const gangster = new Gangster(ns);
    const vanguard = ns.gang
        .getMemberNames()
        .filter((s) => gangster.is_vanguard(s));
    assert(vanguard.length === 1);
    gangster.vigilante(vanguard);
    // Other members currently on vigilante justice or ethical hacking are
    // reassigned to other jobs.
    for (const s of ns.gang.getMemberNames()) {
        if (gangster.is_vigilante(s)) {
            if (gangster.is_vanguard(s)) {
                continue;
            }
            gangster.extort([s]);
            continue;
        }
        if (gangster.is_hacker(s)) {
            gangster.blackmail([s]);
        }
    }
}

/**
 * We do not have enough gang members in vigilante justice or ethical hacking.
 * Reassign some members to these jobs.
 *
 * @param ns The Netscript API.
 * @param threshold We want this many members to be in vigilante justice or
 *     ethical hacking.
 */
function reassign_to_vigilante_ehack(ns, threshold) {
    const tau = Math.floor(threshold);
    assert(tau > 0);
    // All gang members who should be in vigilante justice or ethical hacking.
    const gangster = new Gangster(ns);
    const vanguard = ns.gang
        .getMemberNames()
        .filter((s) => gangster.is_vanguard(s));
    const hacker = ns.gang
        .getMemberNames()
        .filter((s) => gangster.is_hacker(s));
    const artillery = ns.gang
        .getMemberNames()
        .filter((s) => gangster.is_artillery(s));
    const pilot = ns.gang.getMemberNames().filter((s) => gangster.is_pilot(s));
    // Determine which members to assign to vigilante justice or ethical
    // hacking.  The Vanguard is always the first to be assigned to vigilante
    // justice.  This is followed by the Hacker, who is assigned to ethical
    // hacking.  However, if this is a criminal gang, then assign the Hacker to
    // vigilante justice as well.  Next comes the Artillery and the Pilot, who
    // are assigned to vigilante justice in that order.
    const candidate = [vanguard, hacker, artillery, pilot].flat();
    const vigilante_ehacker = ns.gang
        .getMemberNames()
        .filter(
            (s) => gangster.is_vigilante(s) || gangster.is_ethical_hacker(s)
        );
    assert(vigilante_ehacker.length < candidate.length);
    assert(vigilante_ehacker.length < tau);
    while (vigilante_ehacker.includes(candidate[0])) {
        candidate.shift();
    }
    const nmore = tau - vigilante_ehacker.length;
    assert(nmore > 0);
    while (candidate.length > nmore) {
        candidate.pop();
    }
    // Assign the candidates to vigilante justice or ethical hacking.
    for (const s of candidate) {
        if (gangster.is_hacker(s)) {
            if (ns.gang.getGangInformation().isHacking) {
                gangster.ethical_hacking([s]);
            } else {
                gangster.vigilante([s]);
            }
            continue;
        }
        gangster.vigilante([s]);
    }
}

/**
 * Reassign a number of our gang members to vigilante justice or ethical
 * hacking.  Our objective is to lower our wanted level.
 *
 * @param ns The Netscript API.
 */
export function reassign_vigilante_ehacker(ns) {
    // Do we already have the required number of members on vigilante justice
    // or ethical hacking?
    if (has_enough_vigilante_ehacker(ns)) {
        return;
    }
    // We have more vigilantes or ethical hackers than the given threshold.
    // Move some members out of vigilante justice or ethical hacking, and into
    // some other jobs.
    const gangster = new Gangster(ns);
    const tau = choose_vigilante_ehacker_threshold(ns);
    const vigilante_ehacker = ns.gang
        .getMemberNames()
        .filter(
            (s) => gangster.is_vigilante(s) || gangster.is_ethical_hacker(s)
        );
    if (vigilante_ehacker.length > tau) {
        reassign_excess_vigilante_ehacker(ns, tau);
        return;
    }
    // If we already have some vigilantes or ethical hackers, then add more
    // members to vigilante justice or ethical hacking to make up the required
    // threshold.
    assert(vigilante_ehacker.length < tau);
    reassign_to_vigilante_ehack(ns, tau);
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
    assert(name !== "");
    return name;
}
