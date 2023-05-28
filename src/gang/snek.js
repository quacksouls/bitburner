/**
 * Copyright (C) 2022--2023 Duck McSouls
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

import { bitnode } from "/quack/lib/constant/bn.js";
import { bool } from "/quack/lib/constant/bool.js";
import { crimes } from "/quack/lib/constant/crime.js";
import { faction_req } from "/quack/lib/constant/faction.js";
import { gang_t } from "/quack/lib/constant/gang.js";
import { cities } from "/quack/lib/constant/location.js";
import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { Player } from "/quack/lib/player.js";
import { join_faction } from "/quack/lib/singularity/faction.js";
import { work } from "/quack/lib/singularity/work.js";
import { assert } from "/quack/lib/util.js";

/**
 * The karma threshold.  This value depends on the BitNode we are currently in.
 *
 * @param {NS} ns The Netscript API.
 * @returns {number} The karma threshold.
 */
function karma_threshold(ns) {
    if (bitnode["Rise of the Underworld"] === ns.getResetInfo().currentNode) {
        return faction_req["Slum Snakes"].karma;
    }
    return gang_t.KARMA;
}

/**
 * Run the next script(s) in our load chain for criminal gangs.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} faction The name of a criminal organization.  Must be a
 *     faction that allows us to create a criminal gang.
 */
function load_chain(ns, faction) {
    const script = "/quack/gang/crime.js";
    const option = { preventDuplicates: true, threads: 1 };
    ns.exec(script, home, option, faction);
}

/**
 * Decrease our karma low enough to allow us to create a gang.  In BN2, we only
 * need to satisfy the karma requirement of Slum Snakes.  In a BitNode other
 * than BN2, we need -54,000 karma.  Homicide yields -3 karma so we must commit
 * homicide at most 18,000 times.
 *
 * @param {NS} ns The Netscript API.
 */
async function lower_karma(ns) {
    ns.singularity.goToLocation(cities.generic.slum); // Raise Int XP.
    ns.singularity.commitCrime(crimes.KILL, bool.FOCUS);
    const player = new Player(ns);
    const threshold = karma_threshold(ns);
    while (Math.floor(player.karma()) > threshold) {
        await ns.sleep(wait_t.DEFAULT);
    }
    ns.singularity.stopAction();
}

/**
 * Raise our combat stats to a given threshold.  Mugging someone is one of the
 * best ways to raise all of our combat stats.  Upon success, we gain XP for
 * each of the following stats: Strength, Defense, Dexterity, Agility.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} threshold Each of our combat stats should be at least this
 *     level.
 */
async function raise_combat_stats(ns, threshold) {
    assert(threshold > 0);
    ns.singularity.goToLocation(cities.generic.slum); // Raise Int XP.

    // Continue to mug someone until each of our combat stats is at least
    // the given threshold.
    const player = new Player(ns);
    ns.singularity.commitCrime(crimes.MUG, bool.FOCUS);
    while (
        player.strength() < threshold
        || player.defense() < threshold
        || player.dexterity() < threshold
        || player.agility() < threshold
    ) {
        await ns.sleep(wait_t.DEFAULT);
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
 * Usage: run quack/gang/snek.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");

    // Raise combat stats, ensure we have the required minimum karma, raise our
    // income.  Then join the Slum Snakes faction.  Lower our karma so we can
    // create a gang.
    await lower_karma(ns);
    const fac = "Slum Snakes";
    const player = new Player(ns);
    if (!player.faction().includes(fac)) {
        await raise_combat_stats(ns, faction_req[fac].combat);
        assert(player.karma() <= faction_req[fac].karma);
        await work(ns, faction_req[fac].money);
        await join_faction(ns, fac);
    }
    load_chain(ns, fac);
}
