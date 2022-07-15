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

import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import { purchase_augmentations } from "/lib/singularity.augmentation.js";
import { join_faction, work_for_faction } from "/lib/singularity.faction.js";
import { install_backdoor, visit_city } from "/lib/singularity.network.js";
import { raise_hack } from "/lib/singularity.study.js";
import { work_for_company } from "/lib/singularity.work.js";
import { assert } from "/lib/util.js";

/**
 * Join a megacorporation faction.  The requirements for receiving an
 * invitation are:
 *
 * (1) Travel to a particular city where a megacorporation is located.
 * (2) Work for the megacorporation to earn a given amount of reputation points.
 *
 * The exception is Fulcrum Technologies.  In addition to the above two
 * requirements, this megacorporation also requires us to install a backdoor on
 * the fulcrumassets server.  The invitation is sent from Fulcrum Secret
 * Technologies, not Fulcrum Technologies.
 *
 * @param ns The Netscript API.
 * @param city We want to travel to this city.
 * @param company We want to work for this company and raise our reputation
 *     within the company.
 * @param fac Our aim is to join this faction.
 * @param rep Must earn at least this amount of reputation points within the
 *     company.
 */
async function megacorporation(ns, city, company, fac, rep) {
    await visit_city(ns, city);
    // Work for the company to earn the required reputation points.
    await work_for_company(ns, company, rep);
    if ("Fulcrum Secret Technologies" == fac) {
        // Ensure we have the required Hack stat.
        const target = "fulcrumassets";
        const server = new Server(ns, target);
        const player = new Player(ns);
        if (player.hacking_skill() < server.hacking_skill()) {
            await raise_hack(ns, server.hacking_skill());
        }
        assert(player.hacking_skill() >= server.hacking_skill());
        // Ensure we have root access on the target server.
        const t = new Time();
        const time = t.second();
        while (!server.has_root_access()) {
            await server.gain_root_access();
            await ns.sleep(time);
        }
        assert(server.has_root_access());
        await install_backdoor(ns, target);
    }
    // Join the faction, earn reputation points, and purchase all Augmentations.
    const work_type = "Hacking Contracts";
    await join_faction(ns, fac);
    await work_for_faction(ns, fac, work_type);
    await purchase_augmentations(ns, fac);
}

/**
 * Join a megacorporation faction.  The megacorporation factions are:
 * Bachman & Associates, Blade Industries, Clarke Incorporated, ECorp,
 * Four Sigma, Fulcrum Secret Technologies, KuaiGong International, MegaCorp,
 * NWO, OmniTek Incorporated.  This script accepts a command line argument,
 * i.e. the name of a faction.
 *
 * Usage: run singularity/faction-megacorporation.js [factionName]
 * Example: run singularity/faction-megacorporation.js MegaCorp
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Less verbose log.
    ns.disableLog("sleep");
    // Join the appropriate faction.
    const faction = ns.args[0];
    assert(
        ("Bachman & Associates" == faction)
            || ("Blade Industries" == faction)
            || ("Clarke Incorporated" == faction)
            || ("ECorp" == faction)
            || ("Four Sigma" == faction)
            || ("Fulcrum Secret Technologies" == faction)
            || ("KuaiGong International" == faction)
            || ("MegaCorp" == faction)
            || ("NWO" == faction)
            || ("OmniTek Incorporated" == faction)
    );
    let city = "";
    let company = faction;
    const min = 200000;
    let rep = min;
    switch (faction) {
    case "Bachman & Associates":
        city = "Aevum";
        break;
    case "Blade Industries":
        city = "Sector-12";
        break;
    case "Clarke Incorporated":
        city = "Aevum";
        break;
    case "ECorp":
        city = "Aevum";
        break;
    case "Four Sigma":
        city = "Sector-12";
        break;
    case "Fulcrum Secret Technologies":
        city = "Aevum";
        company = "Fulcrum Technologies";
        rep = 250000;
        break;
    case "KuaiGong International":
        city = "Chongqing";
        break;
    case "MegaCorp":
        city = "Sector-12";
        break;
    case "NWO":
        city = "Volhaven";
        break;
    case "OmniTek Incorporated":
        city = "Volhaven";
        break;
    default:
        break;
    }
    assert(city.length > 0);
    assert(company.length > 0);
    assert(faction.length > 0);
    assert(rep >= min);
    await megacorporation(ns, city, company, faction, rep);
    // The next script in the load chain.
    const player = new Player(ns);
    const script = "/singularity/home.js";
    const nthread = 1;
    ns.exec(script, player.home(), nthread);
}
