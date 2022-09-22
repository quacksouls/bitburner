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

import { faction_req } from "/lib/constant/faction.js";
import { work_hack_lvl } from "/lib/constant/misc.js";
import { home } from "/lib/constant/server.js";
import { job_area } from "/lib/constant/work.js";
import { Player } from "/lib/player.js";
import { purchase_augment } from "/lib/singularity/augment.js";
import { commit_crime } from "/lib/singularity/crime.js";
import { join_faction, work_for_faction } from "/lib/singularity/faction.js";
import { visit_city } from "/lib/singularity/network.js";
import { work } from "/lib/singularity/work.js";
import { assert, is_valid_city } from "/lib/util.js";

/**
 * Join a city faction.  The requirements for receiving an invitation usually
 * follow this pattern:
 *
 * (1) Must be located in a particular city.
 * (2) Have at least a certain amount of money.
 *
 * Here are the requirements for each city faction:
 *
 * (1) Aevum: must be in Aevum; have at least $40m.
 * (2) Chongqing: must be in Chongqing; have at least $20m.
 * (3) Ishima: must be in Ishima; have at least $30m.
 * (4) New Tokyo: must be in New Tokyo; have at least $20m.
 * (5) Sector-12: must be in Sector-12; have at least $15m.
 * (6) Volhaven: must be in Volhaven; have at least $50m.
 *
 * @param ns The Netscript API.
 * @param city We must be located in this city.  This is also the faction name.
 */
async function city_faction(ns, city) {
    assert(is_valid_city(city));
    await visit_city(ns, city);
    // Boost our income.
    const fac = city;
    const player = new Player(ns);
    if (player.money() < faction_req[fac].money) {
        if (player.hacking_skill() < work_hack_lvl) {
            await commit_crime(ns, faction_req[fac].money);
        } else {
            await work(ns, faction_req[fac].money);
        }
    }
    // Join the faction and purchase all of its Augmentations.
    await join_faction(ns, fac);
    await work_for_faction(ns, fac, job_area.HACK);
    await purchase_augment(ns, fac);
}

/**
 * Join a city faction.  The city factions are: Aevum, Chongqing, Ishima,
 * New Tokyo, Sector-12, Volhaven.  This script accepts a command line
 * argument, i.e. the name of a faction.
 *
 * Usage: run singularity/faction-city.js [factionName]
 * Example: run singularity/faction-city.js Sector-12
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Less verbose log.
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("scan");
    ns.disableLog("singularity.applyToCompany");
    ns.disableLog("singularity.workForCompany");
    ns.disableLog("sleep");
    // Join the appropriate faction.
    const faction = ns.args[0];
    assert(
        ("Aevum" == faction)
            || ("Chongqing" == faction)
            || ("Ishima" == faction)
            || ("New Tokyo" == faction)
            || ("Sector-12" == faction)
            || ("Volhaven" == faction)
    );
    await city_faction(ns, faction);
    // The next script in the load chain.
    const script = "/singularity/home.js";
    const nthread = 1;
    ns.exec(script, home, nthread);
}
