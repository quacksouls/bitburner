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
import { factions } from "/lib/constant/faction.js";
import { home } from "/lib/constant/server.js";
import { owned_augment } from "/lib/singularity/augment.js";
import { assert, is_valid_faction } from "/lib/util.js";

/**
 * Choose a faction to join and join that faction.  Work for the faction to
 * earn enough reputation points to allow us to purchase all Augmentations from
 * the faction.  We typically choose a faction for these reasons:
 *
 * (1) We have not yet joined the faction.
 * (2) We have not yet purchased and installed all Augmentations from the
 *     faction.
 *
 * @param ns The Netscript API.
 */
async function choose_faction(ns) {
    // Determine which faction to join next.
    let faction = "";
    for (const f of Array.from(factions.all)) {
        if (join_next(ns, f)) {
            faction = f;
            break;
        }
    }
    if ("" == faction) {
        return;
    }
    // Join a faction.
    assert(faction.length > 0);
    let script = "";
    switch (faction) {
        case "Aevum":
            script = "/singularity/faction-city.js";
            break;
        case "Bachman & Associates":
            script = "/singularity/faction-megacorp.js";
            break;
        case "BitRunners":
            script = "/singularity/faction-hack.js";
            break;
        case "Blade Industries":
            script = "/singularity/faction-megacorp.js";
            break;
        case "Chongqing":
            script = "/singularity/faction-city.js";
            break;
        case "Clarke Incorporated":
            script = "/singularity/faction-megacorp.js";
            break;
        case "CyberSec":
            script = "/singularity/faction-early.js";
            break;
        case "Daedalus":
            script = "/singularity/faction-end.js";
            break;
        case "ECorp":
            script = "/singularity/faction-megacorp.js";
            break;
        case "Four Sigma":
            script = "/singularity/faction-megacorp.js";
            break;
        case "Fulcrum Secret Technologies":
            script = "/singularity/faction-megacorp.js";
            break;
        case "Illuminati":
            script = "/singularity/faction-end.js";
            break;
        case "Ishima":
            script = "/singularity/faction-city.js";
            break;
        case "KuaiGong International":
            script = "/singularity/faction-megacorp.js";
            break;
        case "MegaCorp":
            script = "/singularity/faction-megacorp.js";
            break;
        case "Netburners":
            script = "/singularity/faction-early.js";
            break;
        case "New Tokyo":
            script = "/singularity/faction-city.js";
            break;
        case "NiteSec":
            script = "/singularity/faction-hack.js";
            break;
        case "NWO":
            script = "/singularity/faction-megacorp.js";
            break;
        case "OmniTek Incorporated":
            script = "/singularity/faction-megacorp.js";
            break;
        case "Sector-12":
            script = "/singularity/faction-city.js";
            break;
        case "Silhouette":
            script = "/singularity/faction-crime.js";
            break;
        case "Slum Snakes":
            script = "/singularity/faction-crime.js";
            break;
        case "Speakers for the Dead":
            script = "/singularity/faction-crime.js";
            break;
        case "Tetrads":
            script = "/singularity/faction-crime.js";
            break;
        case "The Black Hand":
            script = "/singularity/faction-hack.js";
            break;
        case "The Covenant":
            script = "/singularity/faction-end.js";
            break;
        case "The Dark Army":
            script = "/singularity/faction-crime.js";
            break;
        case "The Syndicate":
            script = "/singularity/faction-crime.js";
            break;
        case "Tian Di Hui":
            script = "/singularity/faction-early.js";
            break;
        case "Volhaven":
            script = "/singularity/faction-city.js";
            break;
        default:
            break;
    }
    assert(script != "");
    const nthread = 1;
    ns.exec(script, home, nthread, faction);
}

/**
 * Whether to join a given faction.  We exclude the faction within which we
 * created a gang.
 *
 * @param ns The Netscript API.
 * @param fac The name of the faction to consider.
 * @return true if the given faction should be joined next; false otherwise.
 */
function join_next(ns, fac) {
    assert(is_valid_faction(fac));
    // We have a gang within the given faction.  Must be in a gang in order to
    // get information about our gang.
    if (ns.gang.inGang()) {
        const gang_fac = ns.gang.getGangInformation().faction;
        if (gang_fac == fac) {
            return bool.NO_JOIN;
        }
    }
    // See whether we have all Augmentations from the given faction.
    const owned_aug = owned_augment(ns);
    const fac_aug = ns.singularity.getAugmentationsFromFaction(fac);
    for (const aug of fac_aug) {
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
 * Usage: run singularity/faction.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    await choose_faction(ns);
}
