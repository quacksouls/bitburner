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

// WARNING: This script assumes that you have access to the Singularity API.

import { assert, minutes_to_milliseconds, Player } from "/libbnr.js";

/**
 * Study at Rotham University to raise our Hack stat.  Run this script under
 * the following situations:
 *
 * (1) Immediately after installing one or more Augmentations.
 * (2) When we start all over on a different BitNode.
 *
 * Usage: run singularity/study.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Study the free computer science course at a university.
    const uni = "Rothman University";
    const course = "Study Computer Science";
    const focus = true;
    assert(ns.singularity.universityCourse(uni, course, focus));
    // Stop our study when our Hack stat has reached a certain amount.
    const threshold = 50;
    const time = minutes_to_milliseconds(1);
    const player = new Player(ns);
    while (player.hacking_skill() < threshold) {
        await ns.sleep(time);
    }
    assert(ns.singularity.stopAction());
}
