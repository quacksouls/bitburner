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

import { bitnode } from "/quack/lib/constant/bn.js";
import { bool } from "/quack/lib/constant/bool.js";
import { factions } from "/quack/lib/constant/faction.js";
import { empty_string } from "/quack/lib/constant/misc.js";
import { home } from "/quack/lib/constant/server.js";
import { owned_augment } from "/quack/lib/singularity/augment.js";
import { assert, is_empty_string, is_valid_faction } from "/quack/lib/util.js";

/**
 * Choose a faction to join and join that faction.  Work for the faction to
 * earn enough reputation points to allow us to purchase all Augmentations from
 * the faction.  We typically choose a faction for these reasons:
 *
 * (1) We have not yet joined the faction.
 * (2) We have not yet purchased and installed all Augmentations from the
 *     faction.
 *
 * @param {NS} ns The Netscript API.
 */
function choose_faction(ns) {
    // Determine which faction to join next.  First, consider factions on our
    // fast track.  These factions have Augmentations to boost our reputation
    // multiplier as well as allowing us to start with various port opener
    // programs.
    let faction = empty_string;
    for (const f of Object.keys(factions.fast_track)) {
        if (join_next(ns, f)) {
            faction = f;
            break;
        }
    }

    // In case we have already joined each faction on the fast track list,
    // consider the remaining factions.
    if (is_empty_string(faction)) {
        for (const f of factions.all) {
            if (join_next(ns, f)) {
                faction = f;
                break;
            }
        }
    }
    if (is_empty_string(faction)) {
        return;
    }

    // Join a faction.
    assert(!is_empty_string(faction));
    let script = empty_string;
    switch (faction) {
        // Early game factions
        case "CyberSec":
        case "Netburners":
        case "Tian Di Hui":
            script = "/quack/faction/early.js";
            break;
        // City factions
        case "Aevum":
        case "Chongqing":
        case "Ishima":
        case "New Tokyo":
        case "Sector-12":
        case "Volhaven":
            script = "/quack/faction/city.js";
            break;
        // Hacking groups
        case "BitRunners":
        case "NiteSec":
        case "The Black Hand":
            script = "/quack/faction/hack.js";
            break;
        // Megacorporations
        case "Bachman & Associates":
        case "Blade Industries":
        case "Clarke Incorporated":
        case "ECorp":
        case "Four Sigma":
        case "Fulcrum Secret Technologies":
        case "KuaiGong International":
        case "MegaCorp":
        case "NWO":
        case "OmniTek Incorporated":
            script = "/quack/faction/megacorp.js";
            break;
        // Criminal organizations
        case "Silhouette":
        case "Slum Snakes":
        case "Speakers for the Dead":
        case "Tetrads":
        case "The Dark Army":
        case "The Syndicate":
            script = "/quack/faction/crime.js";
            break;
        // Endgame factions
        case "Daedalus":
        case "Illuminati":
        case "The Covenant":
            script = "/quack/faction/end.js";
            break;
        default:
            break;
    }
    assert(!is_empty_string(script));
    const nthread = 1;
    ns.exec(script, home, nthread, faction);
}

/**
 * Whether to join a given faction.  We exclude the faction within which we
 * created a gang.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} fac The name of the faction to consider.
 * @returns {boolean} True if the given faction should be joined next;
 *     false otherwise.
 */
function join_next(ns, fac) {
    assert(is_valid_faction(fac));

    // We have a gang within the given faction.  Must be in a gang in order to
    // get information about our gang.
    if (ns.gang.inGang() && ns.gang.getGangInformation().faction === fac) {
        return bool.NO_JOIN;
    }
    if (
        bitnode.Hacktocracy === ns.getPlayer().bitNodeN
        && fac === "Netburners"
    ) {
        return bool.NO_JOIN;
    }

    // See whether we have all Augmentations from the given faction.
    const owned_aug = owned_augment(ns);
    for (const aug of ns.singularity.getAugmentationsFromFaction(fac)) {
        if (!owned_aug.has(aug)) {
            return bool.JOIN;
        }
    }
    return bool.NO_JOIN;
}

/**
 * WARNING: This script requires a huge amount of RAM because it uses many
 * functions from the Singularity API.  To reduce the RAM cost of this script,
 * destroy BN4.2 and BN4.3.
 *
 * Join a faction and purchase all of its Augmentations.
 *
 * Usage: run quack/faction/go.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    choose_faction(ns);
}
