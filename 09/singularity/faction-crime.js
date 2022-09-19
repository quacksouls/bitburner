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
import { work_hack_lvl } from "/lib/constant/misc.js";
import { home } from "/lib/constant/server.js";
import { Money } from "/lib/money.js";
import { purchase_augmentations } from "/lib/singularity/augment.js";
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
    // Karma at -22 or lower.
    const karma = -22;
    const nkill = 0;
    await lower_karma(ns, karma, crimes.SHOP, nkill);
    // Have at least $15m.
    const m = new Money();
    const threshold = 15 * m.million();
    await work(ns, threshold);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    const faction = "Silhouette";
    const work_type = "Hacking Contracts";
    await join_faction(ns, faction);
    await work_for_faction(ns, faction, work_type);
    await purchase_augmentations(ns, faction);
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
    // Karma at -9 or lower.
    const karma = -9;
    const nkill = 0;
    await lower_karma(ns, karma, crimes.SHOP, nkill);
    // Each combat stat must be at least 30.
    const stat_threshold = 30;
    await raise_combat_stats(ns, stat_threshold);
    // Have at least $1m.
    const m = new Money();
    const money_threshold = m.million();
    await work(ns, money_threshold);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    const faction = "Slum Snakes";
    const work_type = "Field Work";
    await join_faction(ns, faction);
    await work_for_faction(ns, faction, work_type);
    await purchase_augmentations(ns, faction);
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
    // Karma at -45 or lower.
    const karma = -45;
    const nkill = 30;
    await lower_karma(ns, karma, crimes.KILL, nkill);
    // Each combat stat must be at least 300.
    const stat_threshold = 300;
    await raise_combat_stats(ns, stat_threshold);
    // Raise our Hack stat.
    const hack_threshold = 100;
    await raise_hack(ns, hack_threshold);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    const faction = "Speakers for the Dead";
    const work_type = "Field Work";
    await join_faction(ns, faction);
    await work_for_faction(ns, faction, work_type);
    await purchase_augmentations(ns, faction);
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
    await visit_city(ns, "Ishima");
    // Karma at -18 or lower.
    const karma = -18;
    const nkill = 0;
    await lower_karma(ns, karma, crimes.SHOP, nkill);
    // Each combat stat must be at least 75.
    const threshold = 75;
    await raise_combat_stats(ns, threshold);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    const faction = "Tetrads";
    const work_type = "Field Work";
    await join_faction(ns, faction);
    await work_for_faction(ns, faction, work_type);
    await purchase_augmentations(ns, faction);
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
    await visit_city(ns, "Chongqing");
    // Raise our Hack and combat stats.
    const threshold = 300;
    await raise_hack(ns, threshold);
    await raise_combat_stats(ns, threshold);
    // Karma at -45 or lower.
    const karma = -45;
    const nkill = 5;
    await lower_karma(ns, karma, crimes.KILL, nkill);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    const faction = "The Dark Army";
    const work_type = "Field Work";
    await join_faction(ns, faction);
    await work_for_faction(ns, faction, work_type);
    await purchase_augmentations(ns, faction);
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
    await visit_city(ns, "Sector-12");
    // Raise our Hack and combat stats.
    const threshold = 200;
    await raise_hack(ns, threshold);
    await raise_combat_stats(ns, threshold);
    // Karma at -90 or lower.
    const karma = -90;
    const nkill = 5;
    await lower_karma(ns, karma, crimes.KILL, nkill);
    // Have at least $10m.
    const m = new Money();
    const money_threshold = 10 * m.million();
    await work(ns, money_threshold);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    const faction = "The Syndicate";
    const work_type = "Field Work";
    await join_faction(ns, faction);
    await work_for_faction(ns, faction, work_type);
    await purchase_augmentations(ns, faction);
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
