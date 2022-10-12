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
import { wait_t } from "/lib/constant/time.js";
import { job_area } from "/lib/constant/work.js";
import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import { purchase_augment } from "/lib/singularity/augment.js";
import { commit_crime } from "/lib/singularity/crime.js";
import { join_faction, work_for_faction } from "/lib/singularity/faction.js";
import { install_backdoor, visit_city } from "/lib/singularity/network.js";
import { raise_hack } from "/lib/singularity/study.js";
import { work } from "/lib/singularity/work.js";
import { assert } from "/lib/util.js";

/**
 * Join the CyberSec faction.  The requirement for receiving an invitation is
 * to install a backdoor on the CSEC server.  The requirement can be broken up
 * into the following mini-requirements:
 *
 * (1) Have at least the hacking skill required by the target server.  This is
 *     usually a low-level server, typically requiring a hacking skill between
 *     50 and 60.
 * (2) Gain root access on the target server.  As this is a low-level server,
 *     it requires between 1 and 2 ports to be opened before we can nuke the
 *     server.  We need some time to acquire the port opener programs.
 * (3) Manually install a backdoor on the target server.
 *
 * @param ns The Netscript API.
 */
async function cyberSec(ns) {
    await visit_city(ns, "Sector-12");
    // Ensure we have the required Hack stat.
    const fac = "CyberSec";
    const player = new Player(ns);
    const server = new Server(ns, faction_req[fac].backdoor);
    if (player.hacking_skill() < server.hacking_skill()) {
        await raise_hack(ns, server.hacking_skill());
    }
    assert(player.hacking_skill() >= server.hacking_skill());
    // Ensure we have root access on the target server.
    while (!server.has_root_access()) {
        await server.gain_root_access();
        await ns.sleep(wait_t.SECOND);
    }
    assert(server.has_root_access());
    // Install backdoor, then join the faction.
    await install_backdoor(ns, server.hostname());
    await join_faction(ns, fac);
    await work_for_faction(ns, fac, job_area.HACK);
    await purchase_augment(ns, fac);
}

/**
 * Join the early game faction Netburners.  Requirements to receive an
 * invitation:
 *
 * (1) Be anywhere in the game world.  Stay put where we started,
 *     i.e. Sector-12.
 * (2) At least 80 Hack.
 * (3) A total Hacknet Level of 100.  This means that all of our Hacknet nodes
 *     have a collective Level of 100.
 * (4) A total Hacknet RAM of 8GB.  All of our Hacknet nodes have a collective
 *     RAM of 8GB.
 * (5) A total Hacknet Cores of 4.  All of our Hacknet nodes collectively have
 *     at least 4 Cores.
 *
 * @param ns The Netscript API.
 */
async function netburners(ns) {
    await visit_city(ns, "Sector-12");
    // Ensure we have at least the required Hack stat.
    const fac = "Netburners";
    const player = new Player(ns);
    if (player.hacking_skill() < faction_req[fac].hack) {
        await raise_hack(ns, faction_req[fac].hack);
    }
    assert(player.hacking_skill() >= faction_req[fac].hack);
    // Join the faction, provided we are currently not a member.
    const joined_faction = player.faction();
    if (!joined_faction.includes(fac)) {
        // Upgrading our Hacknet farm requires a huge amount of money.  Commit
        // crimes, or work at a company, to boost our income.  Continue to
        // commit crimes (or working) as long as we have not yet received an
        // invitation from the Netburners faction.
        const factor = 1.01;
        let threshold = factor * player.money();
        let invite = ns.singularity.checkFactionInvitations();
        while (!invite.includes(fac)) {
            if (player.hacking_skill() < work_hack_lvl) {
                await commit_crime(ns, threshold);
            } else {
                await work(ns, threshold);
            }
            await ns.sleep(wait_t.SECOND);
            threshold = factor * player.money();
            invite = ns.singularity.checkFactionInvitations();
        }
        ns.singularity.joinFaction(fac);
    }
    await work_for_faction(ns, fac, job_area.HACK);
    await purchase_augment(ns, fac);
}

/**
 * Join the early game faction Tian Di Hui.  Requirements for receiving an
 * invitation:
 *
 * (1) Have at least $1m.
 * (2) At least 50 Hack.
 * (3) Located in Chongqing, New Tokyo, or Ishima.
 *
 * @param ns The Netscript API.
 */
async function tian_di_hui(ns) {
    // Ensure we have at least the required Hack stat.
    const fac = "Tian Di Hui";
    const player = new Player(ns);
    if (player.hacking_skill() < faction_req[fac].hack) {
        await raise_hack(ns, faction_req[fac].hack);
    }
    assert(player.hacking_skill() >= faction_req[fac].hack);
    // Travel to Ishima and wait for our income to be at least $1m.
    await visit_city(ns, faction_req[fac].city);
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
 * Join an early-game faction.  The early-game factions are: CyberSec,
 * Netburners, Tian Di Hui.  This script accepts a command line argument,
 * i.e. the name of a faction.
 *
 * Usage: run singularity/faction-early.js [factionName]
 * Example: run singularity/faction-early.js CyberSec
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
        "CyberSec" === faction
        || "Netburners" === faction
        || "Tian Di Hui" === faction
    );
    switch (faction) {
        case "CyberSec":
            await cyberSec(ns);
            break;
        case "Netburners":
            await netburners(ns);
            break;
        case "Tian Di Hui":
            await tian_di_hui(ns);
            break;
        default:
            break;
    }
    // The next script in the load chain.
    const player = new Player(ns);
    const script = "/singularity/home.js";
    const nthread = 1;
    ns.exec(script, player.home(), nthread);
}
