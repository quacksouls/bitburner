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

// Miscellaneous helper functions related to crime.

import { home } from "/lib/constant.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Commit various crimes to raise our income to a given threshold.
 *
 * @param ns The Netscript API.
 * @param threshold Continue to commit crime as long as our income is below
 *     this threshold.
 */
export async function commit_crime(ns, threshold) {
    assert(threshold > 0);
    const script = "/singularity/crime.js";
    const nthread = 1;
    ns.exec(script, home, nthread, threshold);
    const t = new Time();
    const time = 5 * t.second();
    let money = ns.getServerMoneyAvailable(home);
    while ((money < threshold) || ns.singularity.isBusy()) {
        await ns.sleep(time);
        money = ns.getServerMoneyAvailable(home);
    }
    ns.singularity.stopAction();
}
