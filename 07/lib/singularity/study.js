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

// Miscellaneous helper functions related to study at a university.

import { bool } from "/lib/constant/bool.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Determine the university at which we should study.
 *
 * @param ns The Netscript API.
 * @return A string representing the name of the university where we should
 *     study.  An empty string if the player is located in a city that does not
 *     have a university.
 */
function choose_university(ns) {
    const city = ns.getPlayer().city;
    let uni = "";
    switch (city) {
        case "Aevum":
            uni = "Summit University";
            break;
        case "Sector-12":
            uni = "Rothman University";
            break;
        case "Volhaven":
            uni = "ZB Institute of Technology";
            break;
        default:
            uni = "";
            break;
    }
    return uni;
}

/**
 * Increase our Hack stat.  Continue doing so until our Hack stat is at least
 * a given threshold.
 *
 * @param ns The Netscript API.
 * @param threshold We want to increase our Hack stat to be at leat this
 *     threshold.
 */
export async function raise_hack(ns, threshold) {
    assert(threshold > 0);
    const t = new Time();
    const time = t.second();
    while (ns.getHackingLevel() < threshold) {
        await study(ns, threshold);
        await ns.sleep(time);
    }
}

/**
 * Study at a university to raise our Hack stat.  Use this function under the
 * following situations:
 *
 * (1) Immediately after installing one or more Augmentations.
 * (2) When we start all over on a different BitNode.
 * (3) If there is a special need to increase our Hack stat.
 *
 * Note that some cities have universities, while others do not.  If you really
 * want to study at a university, ensure you are located in a city that has a
 * university.
 *
 * @param ns The Netscript API.
 * @param threshold Study until we have reached at least this amount of
 *     Hack stat.
 */
export async function study(ns, threshold) {
    assert(threshold > 0);
    // Study the free computer science course at a university.
    const uni = choose_university(ns);
    if ("" == uni) {
        return;
    }
    const course = "Study Computer Science";
    assert(ns.singularity.universityCourse(uni, course, bool.FOCUS));
    // Stop our study when our Hack stat is at least the given threshold.
    const t = new Time();
    const time = 10 * t.second();
    while (ns.getHackingLevel() < threshold) {
        await ns.sleep(time);
    }
    assert(ns.singularity.stopAction());
}
