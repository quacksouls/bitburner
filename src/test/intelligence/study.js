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
    intelligence,
    intelligence_gain_per_minute,
} from "/intelligence/util.js";
import { bool } from "/lib/constant/bool.js";
import { cities } from "/lib/constant/location.js";
import { course } from "/lib/constant/study.js";
import { wait_t } from "/lib/constant/time.js";
import { assert } from "/lib/util.js";

/**
 * Study various university courses for an hour each and calculate the
 * amount of Intelligence gained per minute.
 *
 * @param ns The Netscript API.
 */
async function study(ns) {
    const n = 60;
    const { uni } = cities[ns.getPlayer().city];
    ns.tprint(`Study at ${uni}`);
    for (const c of Object.values(course)) {
        const action = `Course: ${c}`;
        const before = intelligence(ns);
        assert(ns.singularity.universityCourse(uni, c, bool.FOCUS));
        await ns.sleep(wait_t.HOUR);
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
