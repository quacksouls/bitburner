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
import { install_backdoor } from "/lib/singularity.network.js";
import { raise_hack } from "/lib/singularity.study.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

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
 * @param target We must install a backdoor on this server as a pre-requisite
 *     for receiving an invitation from the given faction.
 */
async function hacking_group(ns, fac, target) {
    const player = new Player(ns);
    assert(player.city() == "Sector-12");
    // Ensure we have the required Hack stat.
    const server = new Server(ns, target);
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
    // Install backdoor, then join the faction.
    await install_backdoor(ns, server.hostname());
    const work_type = "Hacking Contracts";
    await join_faction(ns, fac);
    await work_for_faction(ns, fac, work_type);
    await purchase_augmentations(ns, fac);
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
    ns.disableLog("singularity.workForCompany");
    ns.disableLog("sleep");
    // Join the appropriate faction.
    const faction = ns.args[0];
    assert(
        ("BitRunners" == faction)
            || ("NiteSec" == faction)
            || ("The Black Hand" == faction)
    );
    let server = "";
    switch (faction) {
    case "BitRunners":
        server = "run4theh111z";
        break;
    case "NiteSec":
        server = "avmnite-02h";
        break;
    case "The Black Hand":
        server = "I.I.I.I";
        break;
    default:
        break;
    }
    assert(server.length > 0);
    await hacking_group(ns, faction, server);
    // The next script in the load chain.
    const player = new Player(ns);
    const script = "/singularity/home.js";
    const nthread = 1;
    ns.exec(script, player.home(), nthread);
}
