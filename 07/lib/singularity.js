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

// Miscellaneous helper functions for scripts that use the Singularity API.

import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * All programs that can be created.  These programs can also be purchased via
 * the dark web.
 */
export function all_programs() {
    // A map where the key/value pair is as follows:
    //
    // key := The name of a program.
    // value := The minimum Hack stat at which we are able to create the
    //     program.
    const program = new Map();
    program.set("BruteSSH.exe", 50);
    program.set("FTPCrack.exe", 100);
    program.set("HTTPWorm.exe", 500);
    program.set("relaySMTP.exe", 250);
    program.set("SQLInject.exe", 750);
    program.set("DeepscanV1.exe", 75);
    program.set("DeepscanV2.exe", 400);
    program.set("ServerProfiler.exe", 75);
    program.set("AutoLink.exe", 25);
    program.set("Formulas.exe", 1000);
    return program;
}

/**
 * Study at Rotham University to raise our Hack stat.  Use this function
 * under the following situations:
 *
 * (1) Immediately after installing one or more Augmentations.
 * (2) When we start all over on a different BitNode.
 * (3) If there is a special need to increase our Hack stat.
 *
 * This function assumes the player is currently in Sector-12.
 *
 * @param ns The Netscript API.
 * @param threshold Study until we have reached at least this amount of
 *     Hack stat.
 */
export async function study(ns, threshold) {
    assert(threshold > 0);
    // Study the free computer science course at a university.
    const uni = "Rothman University";
    const course = "Study Computer Science";
    const focus = true;
    assert(ns.singularity.universityCourse(uni, course, focus));
    // Stop our study when our Hack stat is at least the given threshold.
    const t = new Time();
    const time = 10 * t.second();
    while (ns.getHackingLevel() < threshold) {
        await ns.sleep(time);
    }
    assert(ns.singularity.stopAction());
}
