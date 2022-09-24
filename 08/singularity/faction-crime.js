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

import { crimes } from "/lib/constant/crime.js";
import { faction_req } from "/lib/constant/faction.js";
import { work_hack_lvl } from "/lib/constant/misc.js";
import { home } from "/lib/constant/server.js";
import { job_area } from "/lib/constant/work.js";
import { purchase_augment } from "/lib/singularity/augment.js";
import { lower_karma } from "/lib/singularity/crime.js";
import {
    join_faction, raise_combat_stats, raise_hack, work_for_faction
} from "/lib/singularity/faction.js";
import { visit_city } from "/lib/singularity/network.js";
import { raise_charisma, rise_to_cfo, work } from "/lib/singularity/work.js";
import { assert } from "/lib/util.js";

/**
 * Join the Silhouette criminal organization.  The requirements for receiving
 * an invitation:
 *
 * (1) Must be a CTO, CFO, or CEO of a company.  An easy way to meet this
 *     requirement is to work our way up within a company.  Choose Megacorp in
 *     Sector-12.  Have at least 250 Hack.  Work a software job to raise our
 *     Charisma to at least 250.  Then apply for a business job.  Work the job
 *     and after a while apply for a promotion.  Rinse and repeat until we
 *     reach the level of CFO.  The promotion chain at Megacorp is: Business
 *     Intern, Business Manager, Operations Manager, Chief Financial Officer,
 *     Chief Executive Officer.  We stop at CFO of MegaCorp because we do not
 *     want to spend any more time on becoming CEO of the company.
 * (2) Have at least $15m.
 * (3) Karma at -22 or lower.
 *
 * @param ns The Netscript API.
 */
async function silhouette(ns) {
    // Relocate to raise Intelligence XP.
    await visit_city(ns, "Sector-12");
    const company = "MegaCorp";
    // Rise to a top position at a company.
    const charisma_lvl = work_hack_lvl;
    await raise_charisma(ns, work_hack_lvl, charisma_lvl);
    await rise_to_cfo(ns, company);
    // Lower karma and raise our money.
    const fac = "Silhouette";
    const nkill = 0;
    await lower_karma(ns, faction_req[fac].karma, crimes.SHOP, nkill);
    await work(ns, faction_req[fac].money);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    await join_faction(ns, fac);
    await work_for_faction(ns, fac, job_area.HACK);
    await purchase_augment(ns, fac);
}

/**
 * Join the criminal organization Slum Snakes.  The requirements for receiving
 * an invitation:
 *
 * (1) Each combat stat must be at least 30.  By now we should already have
 *     joined and purchased all Augmentations from megacorporation factions.
 *     To raise our combat stats, we simply re-join one of these factions and
 *     carry out field work.
 * (2) Karma at or lower than -9.
 * (3) Have at least $1m.
 *
 * @param ns The Netscript API.
 */
async function slum_snakes(ns) {
    // Lower karma, raise combat stats, and raise money.
    const fac = "Slum Snakes";
    const nkill = 0;
    await lower_karma(ns, faction_req[fac].karma, crimes.SHOP, nkill);
    await raise_combat_stats(ns, faction_req[fac].combat);
    await work(ns, faction_req[fac].money);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    await join_faction(ns, fac);
    await work_for_faction(ns, fac, job_area.FIELD);
    await purchase_augment(ns, fac);
}

/**
 * Join the criminal organization Speakers for the Dead.  The requirements for
 * receiving an invitation:
 *
 * (1) At least 100 Hack.
 * (2) Each combat stat must be at least 300.
 * (3) Must have killed at least 30 people.
 * (4) Karma is at -45 or lower.
 * (5) Not working for CIA or NSA.
 *
 * @param ns The Netscript API.
 */
async function speakers_for_the_dead(ns) {
    // Lower karma, raise combat stats, and raise Hack stat.
    const fac = "Speakers for the Dead";
    await lower_karma(
        ns, faction_req[fac].karma, crimes.KILL, faction_req[fac].kill
    );
    await raise_combat_stats(ns, faction_req[fac].combat);
    await raise_hack(ns, faction_req[fac].hack);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    await join_faction(ns, fac);
    await work_for_faction(ns, fac, job_area.FIELD);
    await purchase_augment(ns, fac);
}

/**
 * Join the criminal organization Tetrads.  The requirements for receiving an
 * invitation:
 *
 * (1) Must be located in Chongqing, New Tokyo, or Ishima.
 * (2) Each combat stat must be at least 75.
 * (3) Karma is at -18 or lower.
 *
 * @param ns The Netscript API.
 */
async function tetrads(ns) {
    const fac = "Tetrads";
    // Lower karma and raise combat stats.
    const nkill = 0;
    await lower_karma(ns, faction_req[fac].karma, crimes.SHOP, nkill);
    await raise_combat_stats(ns, faction_req[fac].combat);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    await visit_city(ns, faction_req[fac].city);
    await join_faction(ns, fac);
    await work_for_faction(ns, fac, job_area.FIELD);
    await purchase_augment(ns, fac);
}

/**
 * Join the criminal organization The Dark Army.  The requirements for
 * receiving an invitation:
 *
 * (1) At least 300 Hack.
 * (2) Each combat stat must be at least 300.
 * (3) Must be located in Chongqing.
 * (4) Must have killed at least 5 people.
 * (5) Karma at -45 or lower.
 * (6) Not working for CIA or NSA.
 *
 * @param ns The Netscript API.
 */
async function the_dark_army(ns) {
    const fac = "The Dark Army";
    // Raise our Hack and combat stats, and lower our karma.
    await raise_hack(ns, faction_req[fac].hack);
    await raise_combat_stats(ns, faction_req[fac].combat);
    await lower_karma(
        ns, faction_req[fac].karma, crimes.KILL, faction_req[fac].kill
    );
    // Join the faction, earn reputation points, and purchase all Augmentations.
    await visit_city(ns, faction_req[fac].city);
    await join_faction(ns, fac);
    await work_for_faction(ns, fac, job_area.FIELD);
    await purchase_augment(ns, fac);
}

/**
 * Join the criminal organization The Syndicate.  The requirements for
 * receiving an invitation:
 *
 * (1) At least 200 Hack.
 * (2) Each combat stat must be at least 200.
 * (3) Must be located in Aevum or Sector-12.
 * (4) Have at least $10m.
 * (5) Karma at -90 or lower.
 * (6) Not working for CIA or NSA.
 *
 * @param ns The Netscript API.
 */
async function the_syndicate(ns) {
    const fac = "The Syndicate";
    // Raise our Hack and combat stats, lower our karma, and raise our income.
    await raise_hack(ns, faction_req[fac].hack);
    await raise_combat_stats(ns, faction_req[fac].combat);
    const nkill = 0;
    await lower_karma(ns, faction_req[fac].karma, crimes.KILL, nkill);
    await work(ns, faction_req[fac].money);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    await visit_city(ns, faction_req[fac].city);
    await join_faction(ns, fac);
    await work_for_faction(ns, fac, job_area.FIELD);
    await purchase_augment(ns, fac);
}

/**
 * Join a criminal organization.  The criminal organizations are: Silhouette,
 * Slum Snakes, The Syndicate, Speakers for the Dead, Tetrads, The Dark Army.
 * This script accepts a command line argument, i.e. the name of a faction.
 *
 * Usage: run singularity/faction-crime.js [factionName]
 * Example: run singularity/faction-crime.js Silhouette
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
        ("Silhouette" == faction)
            || ("Slum Snakes" == faction)
            || ("The Syndicate" == faction)
            || ("Speakers for the Dead" == faction)
            || ("Tetrads" == faction)
            || ("The Dark Army" == faction)
    );
    ns.singularity.goToLocation("The Slums");  // Increase Intelligence XP.
    switch (faction) {
        case "Silhouette":
            await silhouette(ns);
            break;
        case "Slum Snakes":
            await slum_snakes(ns);
            break;
        case "The Syndicate":
            await the_syndicate(ns);
            break;
        case "Speakers for the Dead":
            await speakers_for_the_dead(ns);
            break;
        case "Tetrads":
            await tetrads(ns);
            break;
        case "The Dark Army":
            await the_dark_army(ns);
            break;
        default:
            break;
    }
    // The next script in the load chain.
    const script = "/singularity/home.js";
    const nthread = 1;
    ns.exec(script, home, nthread);
}
