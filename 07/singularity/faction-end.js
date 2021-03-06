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

import { home } from "/lib/constant.js"
import { Money } from "/lib/money.js";
import {
    owned_augmentations, purchase_augmentations
} from "/lib/singularity.augmentation.js";
import {
    join_faction, raise_combat_stats, raise_hack, work_for_faction
} from "/lib/singularity.faction.js";
import { work } from "/lib/singularity.work.js";
import { assert } from "/lib/util.js";

/**
 * Join the endgame faction Daedalus.  The requirements for receiving an
 * invitation:
 *
 * (1) Must have installed at least 30 Augmentations.  This number might vary
 *     and we should not hard code it in this function.  The relevant property
 *     is available at
 *
 *     https://github.com/danielyxie/bitburner/blob/dev/markdown/bitburner.bitnodemultipliers.daedalusaugsrequirement.md
 *
 *     which can be accessed via the getBitNodeMultipliers() function.  The
 *     function is available after the destruction of
 *     "BitNode-5: Artificial Intelligence".
 *
 * (2) Have at least $100b.
 * (3) Either of the following:
 *     (a) At least 2,500 Hack; or
 *     (b) Each combat stat must be at least 1,500.
 *
 * @param ns The Netscript API.
 */
async function daedalus(ns) {
    // Ensure we have already installed at least 30 Augmentations.
    const augment = owned_augmentations(ns);
    assert(augment.size >= 30);
    // Have at least $100b.
    const m = new Money();
    const threshold = 100 * m.billion();
    await work(ns, threshold);
    // At least 2,500 Hack.
    const hack_lvl = 2500;
    await raise_hack(ns, hack_lvl);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    const faction = "Daedalus";
    const work_type = "Hacking Contracts";
    await join_faction(ns, faction);
    await work_for_faction(ns, faction, work_type);
    await purchase_augmentations(ns, faction);
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
    const augment = owned_augmentations(ns);
    assert(augment.size >= 30);
    // Have at least $150b.
    const m = new Money();
    const threshold = 150 * m.billion();
    await work(ns, threshold);
    // Raise Hack and combat stats.
    const hack_lvl = 1500;
    await raise_hack(ns, hack_lvl);
    const combat_lvl = 1200;
    await raise_combat_stats(ns, combat_lvl);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    const faction = "Illuminati";
    const work_type = "Hacking Contracts";
    await join_faction(ns, faction);
    await work_for_faction(ns, faction, work_type);
    await purchase_augmentations(ns, faction);
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
    const augment = owned_augmentations(ns);
    assert(augment.size >= 20);
    // Have at least $75b.
    const m = new Money();
    const threshold = 75 * m.billion();
    await work(ns, threshold);
    // Raise our Hack and combat stats.
    const stat_lvl = 850;
    await raise_hack(ns, stat_lvl);
    await raise_combat_stats(ns, stat_lvl);
    // Join the faction, earn reputation points, and purchase all Augmentations.
    const faction = "The Covenant";
    const work_type = "Hacking Contracts";
    await join_faction(ns, faction);
    await work_for_faction(ns, faction, work_type);
    await purchase_augmentations(ns, faction);
}

/**
 * Join an endgame faction.  The endgame factions are: Daedalus, Illuminati,
 * The Covenant.  This script accepts a command line argument, i.e. the name
 * of a faction.
 *
 * Usage: run singularity/faction-end.js [factionName]
 * Example: run singularity/faction-end.js Daedalus
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Less verbose log.
    ns.disableLog("sleep");
    // Join the appropriate faction.
    const faction = ns.args[0];
    assert(
        ("Daedalus" == faction)
            || ("Illuminati" == faction)
            || ("The Covenant" == faction)
    );
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
    const script = "/singularity/home.js";
    const nthread = 1;
    ns.exec(script, home, nthread);
}
