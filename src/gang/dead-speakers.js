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

import { bitnode } from "/lib/constant/bn.js";
import { bool } from "/lib/constant/bool.js";
import { crimes } from "/lib/constant/crime.js";
import { faction_req } from "/lib/constant/faction.js";
import { gang_t } from "/lib/constant/gang.js";
import { cities } from "/lib/constant/location.js";
import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { Player } from "/lib/player.js";
import {
    join_faction,
    raise_combat_stats,
    raise_hack,
} from "/lib/singularity/faction.js";
import { assert } from "/lib/util.js";

/**
 * The karma threshold.  We want to lower our karma to a given amount.  Outside
 * of BN2, to join a gang we must have karma at -54,000 or lower.  It takes a
 * very long time to achieve this many negative karma.  A more sensible option
 * is to have a target karma value and try to lower our karma to that value.
 * Then move on.  Say we want to lower our karma in 4 batches, each batch is
 * followed by possibly a soft reset.  In each batch, we would need to achieve
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
    if (current_karma <= gang_t.KARMA) {
        return 0;
    }
    let target = -13500;
    const delta = gang_t.KARMA - current_karma;
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
    ns.singularity.goToLocation(cities.generic.slum); // Raise Int XP.
    ns.singularity.commitCrime(crimes.KILL, bool.FOCUS);
    const player = new Player(ns);
    while (Math.floor(player.karma()) > threshold) {
        if (Math.floor(player.karma()) < gang_t.KARMA) {
            break;
        }
        await ns.sleep(wait_t.DEFAULT);
    }
    ns.singularity.stopAction();
}

/**
 * NOTE: Assume we are not in BN2.
 *
 * Join the criminal faction Speakers for the Dead.  Our ultimate purpose is to
 * form and manage a gang within that faction.  To receive an invitation from
 * Speakers for the Dead, we must satisfy these requirements:
 *
 * (1) At least 100 Hack.
 * (2) At least 300 in each combat stat.
 * (3) Killed at least 30 people.
 * (4) Negative karma at -45 or lower.
 * (5) Not working for CIA or NSA.
 *
 * Usage: run gang/dead-speakers.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Should not be in BN2.  If in BN2, it's easier to join Slum Snakes.
    assert(bitnode["Rise of the Underworld"] != ns.getPlayer().bitNodeN);
    // Should not be working for any of the banned companies.
    const fac = "Speakers for the Dead";
    const player = new Player(ns);
    faction_req[fac].ban.map((e) => assert(!player.is_employer(e)));
    // Raise Hack and combat stats, ensure we have the required minimum karma,
    // and killed the required number of people.  Then join the faction
    // Speakers for the Dead.  Lower our karma so we can create a gang.
    await lower_karma(ns);
    if (!player.faction().includes(fac)) {
        await raise_hack(ns, faction_req[fac].hack);
        await raise_combat_stats(ns, faction_req[fac].combat);
        assert(player.karma() <= faction_req[fac].karma);
        await join_faction(ns, fac);
    }
    load_chain(ns, fac);
}
