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

import { bool } from "/quack/lib/constant/bool.js";
import { faction_req } from "/quack/lib/constant/faction.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { job_area } from "/quack/lib/constant/work.js";
import { Server } from "/quack/lib/server.js";
import { purchase_augment } from "/quack/lib/singularity/augment.js";
import {
    join_faction,
    raise_hack,
    work_for_faction,
} from "/quack/lib/singularity/faction.js";
import {
    install_backdoor,
    visit_city,
} from "/quack/lib/singularity/network.js";
import { raise_hack_until } from "/quack/lib/singularity/study.js";
import { assert, exec, has_required_hack } from "/quack/lib/util.js";

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
    const server = new Server(ns, faction_req[fac].backdoor);
    if (!has_required_hack(ns, server.hostname())) {
        await raise_hack_until(ns, server.hacking_skill(), target_fac);
    }
    if (!has_required_hack(ns, server.hostname())) {
        await raise_hack(ns, server.hacking_skill());
    }
    assert(has_required_hack(ns, server.hostname()));
    // Ensure we have root access on the target server.
    while (!server.has_root_access()) {
        server.gain_root_access();
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
 * Various sanity checks of a parameter.
 *
 * @param fac Sanity check this parameter.
 */
function sanity_check(fac) {
    assert(
        fac === "BitRunners" || fac === "NiteSec" || fac === "The Black Hand"
    );
}

/**
 * Suppress various log messages.
 *
 * @param ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("scan");
    ns.disableLog("singularity.applyToCompany");
    ns.disableLog("singularity.donateToFaction");
    ns.disableLog("singularity.workForCompany");
    ns.disableLog("sleep");
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
    shush(ns);
    // Join the appropriate faction.
    const faction = ns.args[0];
    sanity_check(faction);
    await hacking_group(ns, faction);
    // The next script in the load chain.
    exec(ns, "/quack/chain/home.js");
}
