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

import { intelligence } from "/intelligence/util.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Study various university courses for one minute each and calculate the
 * amount of Intelligence gained.
 *
 * @param ns The Netscript API.
 */
async function study(ns) {
    const t = new Time();
    const minute = 1;
    const time = minute * t.minute();
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
        ns.tprint("Course: " + c);
        const before = intelligence(ns);
        ns.tprint("Intelligence before: " + before);
        assert(ns.singularity.universityCourse(uni, c, focus));
        await ns.sleep(time);
        ns.singularity.stopAction();
        const after = intelligence(ns);
        ns.tprint("Intelligence after: " + after);
        const gain = after - before;
        ns.tprint("Intelligence gain: " + gain);
        const gpm = gain / minute;
        ns.tprint("Intelligence gain per minute: " + gpm);
        ns.tprint("");
    }
}

/**
 * Intelligence xp cannot be gained from studying at a university.  The source
 * file at
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/NetscriptFunctions/Singularity.ts
 *
 * confirms this behaviour.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    await study(ns);
}
