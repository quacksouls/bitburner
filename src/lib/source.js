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
import { assert } from "/quack/lib/util.js";

/// ///////////////////////////////////////////////////////////////////////
// Helper functions relating to Source-Files.
/// ///////////////////////////////////////////////////////////////////////

/**
 * Whether we have access to the Artificial Intelligence (AI) API.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we have access to the AI API; false otherwise.
 */
export function has_ai_api(ns) {
    try {
        // This is the only function we are rewarded with upon entering or
        // destroying BN5.1.
        ns.getBitNodeMultipliers();
        return bool.HAS;
    } catch {
        return bool.NOT;
    }
}

/**
 * Whether we have access to the Bladeburner API.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we have access to the Bladeburner API;
 *     false otherwise.
 */
export function has_bladeburner_api(ns) {
    // Are we in "BitNode-7: Bladeburners 2079"?
    const bn_name = "Bladeburners 2079";
    if (bitnode[bn_name] === ns.getPlayer().bitNodeN) {
        return bool.HAS;
    }

    // Use the Singularity API to help us find out.
    if (has_singularity_api(ns)) {
        for (const sf of ns.singularity.getOwnedSourceFiles()) {
            if (sf.n === bitnode[bn_name]) {
                return bool.HAS;
            }
        }
    }
    return bool.NOT;
}

/**
 * Whether we have access to the Corporation API.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we have access to the Corporation API;
 *     false otherwise.
 */
export function has_corporation_api(ns) {
    // Are we in "BitNode-3: Corporatocracy"?
    if (bitnode.Corporatocracy === ns.getPlayer().bitNodeN) {
        return bool.HAS;
    }

    // Use the Singularity API to help us find out.
    if (has_singularity_api(ns)) {
        for (const sf of ns.singularity.getOwnedSourceFiles()) {
            if (sf.n === bitnode.Corporatocracy) {
                return bool.HAS;
            }
        }
    }
    return bool.NOT;
}

/**
 * Whether we have access to the Gang API.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we have access to the Gang API; false otherwise.
 */
export function has_gang_api(ns) {
    // Are we in "BitNode-2: Rise of the Underworld"?
    const bn_name = "Rise of the Underworld";
    if (bitnode[bn_name] === ns.getPlayer().bitNodeN) {
        return bool.HAS;
    }

    // Use the Singularity API to help us find out.
    if (has_singularity_api(ns)) {
        for (const sf of ns.singularity.getOwnedSourceFiles()) {
            if (sf.n === bitnode[bn_name]) {
                return bool.HAS;
            }
        }
    }
    return bool.NOT;
}

/**
 * Whether we have access to "Source-File 8: Ghost of Wall Street", in
 * particular access to the WSE and TIX API.  We have access to the latter if:
 *
 * (1) We are in "BitNode-8: Ghost of Wall Street"; or
 * (2) We have destroyed at least BN8.1.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we have "Source-File 8: Ghost of Wall Street";
 *     false otherwise.
 */
export function has_ghost_of_wall_street(ns) {
    const bn_name = "Ghost of Wall Street";
    if (bitnode[bn_name] === ns.getPlayer().bitNodeN) {
        return bool.HAS;
    }

    // Use the Singularity API to help us find out.
    if (has_singularity_api(ns)) {
        const has_ghost = (sf) => sf.n === bitnode[bn_name];
        return ns.singularity.getOwnedSourceFiles().some(has_ghost);
    }
    return bool.NOT;
}

/**
 * Whether we have access to the Hacknet server API.  We have access to Hacknet
 * servers and the relevant API provided that:
 *
 * (1) We are in "BitNode-9: Hacktocracy"; or
 * (2) We have destroyed at least BN9.1.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we have access to Hacknet servers and the relevant
 *     API; false otherwise.
 */
export function has_hacknet_server_api(ns) {
    if (bitnode.Hacktocracy === ns.getPlayer().bitNodeN) {
        return bool.HAS;
    }

    // Use the Singularity API to help us find out.
    if (has_singularity_api(ns)) {
        for (const sf of ns.singularity.getOwnedSourceFiles()) {
            if (sf.n === bitnode.Hacktocracy) {
                return bool.HAS;
            }
        }
    }
    return bool.NOT;
}

/**
 * Whether we have access to the Singularity API.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we have access to the Singularity API;
 *     false otherwise.
 */
export function has_singularity_api(ns) {
    try {
        // This function from the Singularity API has the lowest RAM cost, at
        // 0.1GB.
        ns.singularity.isFocused();
        return bool.HAS;
    } catch {
        return bool.NOT;
    }
}

/**
 * Whether we have access to the Sleeve API.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we have access to the Sleeve API; false otherwise.
 */
export function has_sleeve_api(ns) {
    // Are we in "BitNode 10: Digital Carbon"?
    const bn_name = "Digital Carbon";
    if (bitnode[bn_name] === ns.getPlayer().bitNodeN) {
        return bool.HAS;
    }

    // Use the Singularity API to help us find out.
    if (has_singularity_api(ns)) {
        for (const sf of ns.singularity.getOwnedSourceFiles()) {
            if (sf.n === bitnode[bn_name]) {
                return bool.HAS;
            }
        }
    }
    return bool.NOT;
}

/**
 * Whether we are in "BitNode-8: Ghost of Wall Street".
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we are in BN8; false otherwise.
 */
export function is_ghost_of_wall_street(ns) {
    const bn_name = "Ghost of Wall Street";
    return bitnode[bn_name] === ns.getPlayer().bitNodeN;
}

/**
 * The level of a Source-File.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} n The Source-File number.
 * @returns {number} The level of the Source-File having the given number.
 */
export function sf_level(ns, n) {
    assert(n >= bitnode["Source Genesis"]);
    assert(n <= bitnode["They're lunatics"]);
    for (const sf of ns.singularity.getOwnedSourceFiles()) {
        if (sf.n === n) {
            return sf.lvl;
        }
    }
}
