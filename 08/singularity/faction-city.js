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

import { all_cities, home, work_hack_lvl } from "/lib/constant.js";
import { Money } from "/lib/money.js";
import { Player } from "/lib/player.js";
import { purchase_augmentations } from "/lib/singularity.augmentation.js";
import { commit_crime } from "/lib/singularity.crime.js";
import { join_faction, work_for_faction } from "/lib/singularity.faction.js";
import { visit_city } from "/lib/singularity.network.js";
import { work } from "/lib/singularity.work.js";
import { assert } from "/lib/util.js";

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
 * @param city We must be located in this city.
 * @param money We must have at least this amount of money.
 */
async function city_faction(ns, city, money) {
    assert(is_valid_city(city));
    assert(money > 0);
    await visit_city(ns, city);
    // Boost our income.
    const player = new Player(ns);
    if (player.money() < money) {
        if (player.hacking_skill() < work_hack_lvl) {
            await commit_crime(ns, money);
        } else {
            await work(ns, money);
        }
    }
    // Join the faction and purchase all of its Augmentations.
    const faction = city;
    const work_type = "Hacking Contracts";
    await join_faction(ns, faction);
    await work_for_faction(ns, faction, work_type);
    await purchase_augmentations(ns, faction);
}

/**
 * Whether a given string represents a valid city in the game world.
 *
 * @param c A city name, represented as a string.  Cannot be an empty string.
 * @return true if the given string represents a city in the game world;
 *     false otherwise.
 */
function is_valid_city(c) {
    assert(c.length > 0);
    const city = new Set(all_cities());
    return city.has(c);
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
    const m = new Money();
    let money = 0;
    switch (faction) {
    case "Aevum":
        money = 40 * m.million();
        break;
    case "Chongqing":
        money = 20 * m.million();
        break;
    case "Ishima":
        money = 30 * m.million();
        break;
    case "New Tokyo":
        money = 20 * m.million();
        break;
    case "Sector-12":
        money = 15 * m.million();
        break;
    case "Volhaven":
        money = 50 * m.million();
        break;
    default:
        break;
    }
    assert(money > 0);
    await city_faction(ns, faction, money);
    // The next script in the load chain.
    const script = "/singularity/home.js";
    const nthread = 1;
    ns.exec(script, home, nthread);
}
