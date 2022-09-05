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
    intelligence, intelligence_gain_per_minute
} from "/intelligence/util.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Study various university courses for an hour each and calculate the
 * amount of Intelligence gained per minute.
 *
 * @param ns The Netscript API.
 */
async function study(ns) {
    const t = new Time();
    const n = 60;
    const time = n * t.minute();
    const uni = "Rothman University";
    const course = [
        "Study Computer Science",
        "Data Structures",
        "Networks",
        "Algorithms",
        "Management",
        "Leadership"
    ];
    ns.tprint("Study at " + uni);
    const focus = true;
    for (const c of course) {
        const action = "Course: " + c;
        const before = intelligence(ns);
        assert(ns.singularity.universityCourse(uni, c, focus));
        await ns.sleep(time);
        ns.singularity.stopAction();
        const after = intelligence(ns);
        intelligence_gain_per_minute(ns, before, after, action, n);
    }
}

/**
 * Obtain Intelligence XP by studying at a university.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    await study(ns);
}
