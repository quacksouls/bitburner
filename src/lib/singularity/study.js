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
// Miscellaneous helper functions related to study at a university.
/// ///////////////////////////////////////////////////////////////////////

import { bool } from "/quack/lib/constant/bool.js";
import { cities } from "/quack/lib/constant/location.js";
import { course } from "/quack/lib/constant/study.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { assert } from "/quack/lib/util.js";

/**
 * Determine the university at which we should study.
 *
 * @param {NS} ns The Netscript API.
 * @returns {string} The name of the university where we should study.  An empty
 *     string if we are located in a city that does not have a university.
 */
function choose_university(ns) {
    const { city } = ns.getPlayer();
    const { uni } = cities[city];
    if (undefined === uni) {
        return "";
    }
    return uni;
}

/**
 * Increase our Hack stat.  Continue doing so until our Hack stat is at least
 * a given threshold.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} threshold We want to increase our Hack stat to be at least
 *     this threshold.
 */
export async function raise_hack(ns, threshold) {
    assert(threshold > 0);
    while (ns.getHackingLevel() < threshold) {
        await study(ns, threshold);
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * Increase our Hack stat.  We stop when either of the following conditions are
 * satisfied.
 *
 * (1) Our Hack stat is at least the given threshold.
 * (2) We receive an invitation from the given faction.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} threshold We want to increase our Hack stat to at least this
 *     threshold.  The function can exit even if our Hack stat is below the
 *     given threshold.
 * @param {string} fac The name of a faction.  We want to receive an invitation
 *     from this faction.  The function can exit even if we do not receive an
 *     invitation from the given faction.
 */
export async function raise_hack_until(ns, threshold, fac) {
    const tau = Math.floor(threshold);
    assert(tau > 0);
    assert(fac !== "");

    // By default, we study the free computer science course at a university.
    const uni = choose_university(ns);
    assert(uni !== "");
    ns.singularity.goToLocation(uni); // Raise Intelligence XP.
    assert(ns.singularity.universityCourse(uni, course.CS, bool.FOCUS));
    while (ns.getHackingLevel() < tau) {
        if (ns.getPlayer().factions.includes(fac)) {
            break;
        }
        const invitation = ns.singularity.checkFactionInvitations();
        if (invitation.includes(fac)) {
            break;
        }
        await ns.sleep(wait_t.SECOND);
    }
    assert(ns.singularity.stopAction());
}

/**
 * Study at a university to raise our Hack stat.  Use this function under the
 * following situations:
 *
 * (1) Immediately after installing one or more Augmentations.
 * (2) When we start all over on a different BitNode.
 * (3) If there is a special need to increase our Hack stat.
 *
 * Note that some cities have universities, while others do not.  If we really
 * want to study at a university, ensure we are located in a city that has a
 * university.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} threshold Study until we have reached at least this amount of
 *     Hack stat.
 */
export async function study(ns, threshold) {
    assert(threshold > 0);
    const uni = choose_university(ns);
    const empty_str = "";
    if (empty_str === uni) {
        return;
    }

    // Go to a different location to gain some Intelligence XP.
    assert(empty_str !== uni);
    ns.singularity.goToLocation(uni);

    // Study the free computer science course at a university.
    assert(ns.singularity.universityCourse(uni, course.CS, bool.FOCUS));

    // Stop our study when our Hack stat is at least the given threshold.
    while (ns.getHackingLevel() < threshold) {
        await ns.sleep(wait_t.DEFAULT);
    }
    assert(ns.singularity.stopAction());
}
