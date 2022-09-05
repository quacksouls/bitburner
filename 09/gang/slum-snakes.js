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

import { Money } from "/lib/money.js";
import { Player } from "/lib/player.js";
import { join_faction } from "/lib/singularity.faction.js";
import { work } from "/lib/singularity.work.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Raise our combat stats to a given threshold.  Mugging someone is one of the
 * best ways to raise all of our combat stats.  Upon success, we gain XP for
 * each of the following stats: Strength, Defense, Dexterity, Agility.
 *
 * @param ns The Netscript API.
 * @param threshold Each of our combat stats should be at least this level.
 */
async function raise_combat_stats(ns, threshold) {
    assert(threshold > 0);
    ns.singularity.goToLocation("The Slums");  // Raise Intelligence XP.
    // Continue to mug someone until each of our combat stats is at least
    // the given threshold.
    const t = new Time();
    const time = 10 * t.second();
    const player = new Player(ns);
    const crime = "mug someone";
    const focus = true;
    ns.singularity.commitCrime(crime, focus);
    while (
        (player.strength() < threshold)
            || (player.defense() < threshold)
            || (player.dexterity() < threshold)
            || (player.agility() < threshold)
    ) {
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}

/**
 * Join the Slum Snakes faction.  Our ultimate purpose is to form and manage
 * a gang.  Among the criminal organizations, Slum Snakes has the lowest
 * requirements for sending a faction invitation.  To receive an invitation
 * from Slum Snakes, we must satisfy these requirements:
 *
 * (1) Each of the combat stats must be at least 30.
 * (2) Karma must be -9 or lower.
 * (3) At least $1m.
 *
 * Usage: run gang/slum-snakes.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("sleep");
    // Raise combat stats.
    const min_stat = 30;
    await raise_combat_stats(ns, min_stat);
    // Ensure we have the required minimum karma.
    const player = new Player(ns);
    const min_karma = -9;
    assert(player.karma() <= min_karma);
    // Raise income.
    const m = new Money();
    const min_money = m.million();
    await work(ns, min_money);
    // Now join the Slum Snakes faction.
    await join_faction(ns, "Slum Snakes");
}
