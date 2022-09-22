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

import { bool } from "/lib/constant/bool.js";
import { crimes } from "/lib/constant/crime.js";
import { faction_req } from "/lib/constant/faction.js";
import { gang_tau } from "/lib/constant/gang.js";
import { cities } from "/lib/constant/location.js";
import { home } from "/lib/constant/server.js";
import { Player } from "/lib/player.js";
import { join_faction } from "/lib/singularity/faction.js";
import { work } from "/lib/singularity/work.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * The karma threshold.  We want to lower our karma to a given amount.  To join
 * a gang, we must have karma at -54,000 or lower.  It takes a very long time
 * to achieve this many negative karma.  A more sensible option is to have a
 * target karma value and try to lower our karma to that value.  Then move on.
 * Say we want to lower our karma in 4 batches, each batch is followed by
 * possibly a soft reset.  In each batch, we would need to achieve
 * -13,500 karma.
 *
 * @param ns The Netscript API.
 * @return Our current negative karma plus some more negative karma value as
 *     low as -13,500.  Return 0 if we have enough negative karma to create a
 *     gang.
 */
function karma_threshold(ns) {
    const player = new Player(ns);
    const current_karma = Math.floor(player.karma());
    if (current_karma <= gang_tau.KARMA) {
        return 0;
    }
    let target = -13500;
    const delta = gang_tau.KARMA - current_karma;
    if (Math.abs(delta) < Math.abs(target)) {
        target = delta;
    }
    return Math.floor(current_karma + target);
}

/**
 * Run the next script(s) in our load chain for criminal gangs.
 *
 * @param ns The Netscript API.
 * @param faction The name of a criminal organization.  Must be a faction that
 *     allows us to create a criminal gang.
 */
function load_chain(ns, faction) {
    const script = "/gang/crime.js";
    const nthread = 1;
    ns.exec(script, home, nthread, faction);
}

/**
 * Decrease our karma low enough to allow us to create a gang.  We need -54,000
 * karma.  Homicide yields -3 karma so we must commit homicide at most 18,000
 * times.  We lower our karma in batches.  After each batch we might not have
 * enough negative karma to create a gang.
 *
 * @param ns The Netscript API.
 */
async function lower_karma(ns) {
    const threshold = karma_threshold(ns);
    ns.singularity.goToLocation(cities.generic["slum"]);  // Raise Int XP.
    ns.singularity.commitCrime(crimes.KILL, bool.FOCUS);
    const t = new Time();
    const time = 5 * t.second();
    const player = new Player(ns);
    while (Math.floor(player.karma()) > threshold) {
        if (Math.floor(player.karma()) < gang_tau.KARMA) {
            break;
        }
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}

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
    ns.singularity.goToLocation(cities.generic["slum"]);  // Raise Int XP.
    // Continue to mug someone until each of our combat stats is at least
    // the given threshold.
    const t = new Time();
    const time = 10 * t.second();
    const player = new Player(ns);
    ns.singularity.commitCrime(crimes.MUG, bool.FOCUS);
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
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Raise combat stats, ensure we have the required minimum karma, raise our
    // income.  Then join the Slum Snakes faction.  Attempt to lower our karma
    // so we can create a gang.
    const fac = "Slum Snakes";
    const player = new Player(ns);
    if (!player.faction().includes(fac)) {
        await raise_combat_stats(ns, faction_req[fac].combat);
        assert(player.karma() <= faction_req[fac].karma);
        await work(ns, faction_req[fac].money);
        await join_faction(ns, fac);
    }
    await lower_karma(ns);
    load_chain(ns, fac);
}
