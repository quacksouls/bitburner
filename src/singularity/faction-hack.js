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
import { faction_req } from "/lib/constant/faction.js";
import { wait_t } from "/lib/constant/time.js";
import { job_area } from "/lib/constant/work.js";
import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import { purchase_augment } from "/lib/singularity/augment.js";
import {
    join_faction,
    raise_hack,
    work_for_faction,
} from "/lib/singularity/faction.js";
import { install_backdoor, visit_city } from "/lib/singularity/network.js";
import { raise_hack_until } from "/lib/singularity/study.js";
import { assert, exec } from "/lib/util.js";

/**
 * Join a hacking group.  The requirement for receiving an invitation is to
 * install a backdoor on a target server.  The requirement can be broken up
 * into the following mini-requirements:
 *
 * (1) Have at least the hacking skill required by the target server.  This is
 *     usually a mid-level server, typically requiring a hacking skill of
 *     several 100s.
 * (2) Gain root access on the target server.  As this is a mid-level server,
 *     it requires between 2 to 4 ports to be opened before we can nuke the
 *     server.  We need some time to acquire at most 4 port opener programs.
 * (3) Manually install a backdoor on the target server.
 *
 * @param ns The Netscript API.
 * @param fac We want to join this hacking group.
 */
async function hacking_group(ns, fac) {
    // If possible, we want to perform Hacking Contracts for this faction in
    // order to raise our Hack stat.
    const target_fac = "Sector-12";
    await visit_city(ns, target_fac);
    // Ensure we have the required Hack stat.
    const player = new Player(ns);
    const server = new Server(ns, faction_req[fac].backdoor);
    if (player.hacking_skill() < server.hacking_skill()) {
        await raise_hack_until(ns, server.hacking_skill(), target_fac);
    }
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
    ns.print(`Buy Augmentations from ${fac}`);
    await purchase_augment(
        ns,
        fac,
        bool.STOP_TRADE,
        bool.BUY_NFG,
        bool.RAISE_MONEY
    );
}

/**
 * Join a hacking group.  The hacking groups are: BitRunners, NiteSec,
 * The Black Hand.  This script accepts a command line argument, i.e. the name
 * of a faction.
 *
 * Usage: run singularity/faction-hack.js [factionName]
 * Example: run singularity/faction-hack.js BitRunners
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Less verbose log.
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("scan");
    ns.disableLog("singularity.applyToCompany");
    ns.disableLog("singularity.donateToFaction");
    ns.disableLog("singularity.workForCompany");
    ns.disableLog("sleep");
    // Join the appropriate faction.
    const faction = ns.args[0];
    assert(
        faction === "BitRunners"
            || faction === "NiteSec"
            || faction === "The Black Hand"
    );
    await hacking_group(ns, faction);
    // The next script in the load chain.
    exec(ns, "/chain/home.js");
}
