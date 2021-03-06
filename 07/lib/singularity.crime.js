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
import { Player } from "/lib/player.js";
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

/**
 * Accumulate negative karma.  Stop when our negative karma is at or lower than
 * a given threshold.
 *
 * @param ns The Netscript API.
 * @param threshold We want our negative karma to be at or lower than this
 *     threshold.  Must be a negative integer.
 * @param crime The crime we must carry out to lower our karma.
 *     Either "shoplift" or "homicide".
 * @param nkill If crime := "homicide", then we must also provide the target
 *     number of people to kill.  Pass in 0 if the crime is not homicide.  Must
 *     be a non-negative integer.
 */
export async function lower_karma(ns, threshold, crime, nkill) {
    // Sanity checks.
    assert(threshold < 0);
    assert(("shoplift" == crime) || ("homicide" == crime));
    assert(nkill >= 0);
    // Shoplift.  Use the ceiling function to convert the karma value to an
    // integer.  It is safer to compare integers than it is to compare floating
    // point numbers.
    const t = new Time();
    const time = t.second();
    const player = new Player(ns);
    if ("shoplift" == crime) {
        while (Math.ceil(player.karma()) > threshold) {
            ns.singularity.commitCrime(crime);
            while (ns.singularity.isBusy()) {
                await ns.sleep(time);
            }
        }
        assert(Math.ceil(player.karma()) < 0);
        assert(Math.ceil(player.karma()) <= threshold);
        return;
    }
    // Homicide.
    assert("homicide" == crime);
    assert(nkill > 0);
    while (
        (Math.ceil(player.karma()) > threshold)
            || (player.nkill() < nkill)
    ) {
        ns.singularity.commitCrime(crime);
        while (ns.singularity.isBusy()) {
            await ns.sleep(time);
        }
    }
    assert(Math.ceil(player.karma()) < 0);
    assert(Math.ceil(player.karma()) <= threshold);
    assert(player.nkill() >= nkill);
}
