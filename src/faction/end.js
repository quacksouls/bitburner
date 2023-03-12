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
import { job_area } from "/quack/lib/constant/work.js";
import {
    owned_augment,
    purchase_augment,
} from "/quack/lib/singularity/augment.js";
import {
    join_faction,
    raise_combat_stats,
    raise_hack,
    work_for_faction,
} from "/quack/lib/singularity/faction.js";
import { work } from "/quack/lib/singularity/work.js";
import { has_ai_api } from "/quack/lib/source.js";
import { assert, exec } from "/quack/lib/util.js";

/**
 * Join the endgame faction Daedalus.  The requirements for receiving an
 * invitation:
 *
 * (1) Must have installed at least a certain number of Augmentations.  This
 *     number varies.  It can be accessed via the getBitNodeMultipliers()
 *     function, under the DaedalusAugsRequirement property.  The function is
 *     available after the destruction of "BitNode-5: Artificial Intelligence".
 * (2) Have at least $100b.
 * (3) Either of the following:
 *     (a) At least 2,500 Hack; or
 *     (b) Each combat stat must be at least 1,500.
 *
 * @param ns The Netscript API.
 */
async function daedalus(ns) {
    // Ensure we have already installed a minimum number of Augmentations.
    const augment = owned_augment(ns);
    let min_augment = 30;
    if (has_ai_api(ns)) {
        min_augment = ns.getBitNodeMultipliers().DaedalusAugsRequirement;
    }
    assert(augment.size >= min_augment);
    // Raise our money and Hack stat.
    const fac = "Daedalus";
    await work(ns, faction_req[fac].money);
    await raise_hack(ns, faction_req[fac].hack);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    await join_faction(ns, fac);
    await work_for_faction(ns, fac, job_area.HACK);
    await purchase_augment(
        ns,
        fac,
        bool.STOP_TRADE,
        bool.BUY_NFG,
        bool.RAISE_MONEY
    );
}

/**
 * Join the endgame faction Illuminati.  The requirements for receiving an
 * invitation:
 *
 * (1) Must have installed at least 30 Augmentations.
 * (2) Have at least $150b.
 * (3) At least 1,500 Hack.
 * (4) Each combat stat must be at least 1,200.
 *
 * @param ns The Netscript API.
 */
async function illuminati(ns) {
    // Ensure we have already installed at least 30 Augmentations.
    const augment = owned_augment(ns);
    assert(augment.size >= 30);
    // Raise our money, Hack stat, and combat stats.
    const fac = "Illuminati";
    await work(ns, faction_req[fac].money);
    await raise_hack(ns, faction_req[fac].hack);
    await raise_combat_stats(ns, faction_req[fac].combat);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    await join_faction(ns, fac);
    await work_for_faction(ns, fac, job_area.HACK);
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
        fac === "Daedalus" || fac === "Illuminati" || fac === "The Covenant"
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
    ns.disableLog("singularity.workForCompany");
    ns.disableLog("sleep");
}

/**
 * Join the endgame faction The Covenant.  The requirements for receiving an
 * invitation:
 *
 * (1) Must have installed at least 20 Augmentations.
 * (2) Have at least $75b.
 * (3) At least 850 Hack.
 * (4) Each combat stat must be at least 850.
 *
 * @param ns The Netscript API.
 */
async function the_covenant(ns) {
    // Ensure we have already installed at least 20 Augmentations.
    const augment = owned_augment(ns);
    assert(augment.size >= 20);
    // Raise our money, Hack stat, and combat stats.
    const fac = "The Covenant";
    await work(ns, faction_req[fac].money);
    await raise_hack(ns, faction_req[fac].hack);
    await raise_combat_stats(ns, faction_req[fac].combat);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    await join_faction(ns, fac);
    await work_for_faction(ns, fac, job_area.HACK);
    await purchase_augment(
        ns,
        fac,
        bool.STOP_TRADE,
        bool.BUY_NFG,
        bool.RAISE_MONEY
    );
}

/**
 * Join an endgame faction.  The endgame factions are: Daedalus, Illuminati,
 * The Covenant.  This script accepts a command line argument, i.e. the name
 * of a faction.
 *
 * Usage: run quack/faction/end.js [factionName]
 * Example: run quack/faction/end.js Daedalus
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    // Join the appropriate faction.
    const faction = ns.args[0];
    sanity_check(faction);
    switch (faction) {
        case "Daedalus":
            await daedalus(ns);
            break;
        case "Illuminati":
            await illuminati(ns);
            break;
        case "The Covenant":
            await the_covenant(ns);
            break;
        default:
            break;
    }
    // The next script in the load chain.
    exec(ns, "/quack/chain/home.js");
}
