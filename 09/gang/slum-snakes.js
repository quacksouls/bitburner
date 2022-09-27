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
import { cities } from "/lib/constant/location.js";
import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { Player } from "/lib/player.js";
import { join_faction } from "/lib/singularity/faction.js";
import { work } from "/lib/singularity/work.js";
import { assert } from "/lib/util.js";

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
    const player = new Player(ns);
    ns.singularity.commitCrime(crimes.MUG, bool.FOCUS);
    while (
        (player.strength() < threshold)
            || (player.defense() < threshold)
            || (player.dexterity() < threshold)
            || (player.agility() < threshold)
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
 * Usage: run gang/slum-snakes.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Should only create a gang within Slum Snakes if we are in BN2.
    assert(bitnode["Rise of the Underworld"] == ns.getPlayer().bitNodeN);
    // Raise combat stats, ensure we have the required minimum karma, raise our
    // income.  Then join the Slum Snakes faction.
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
