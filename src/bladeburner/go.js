/**
 * Copyright (C) 2023 Duck McSouls
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

import { bb } from "/quack/lib/constant/bb.js";
import { bool } from "/quack/lib/constant/bool.js";
import { colour } from "/quack/lib/constant/misc.js";
import { cc_t } from "/quack/lib/constant/sleeve.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";
import { Player } from "/quack/lib/player.js";
import { has_all_sleeves } from "/quack/lib/sleeve/util.js";
import {
    has_bladeburner_api,
    has_singularity_api,
    has_sleeve_api,
} from "/quack/lib/source.js";
import { assert } from "/quack/lib/util.js";

/**
 * Whether we have the required APIs to efficiently automate Bladeburner.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we have the necessary APIs; false otherwise.
 */
function has_api_access(ns) {
    // Do we have access to the Bladeburner API?
    assert(has_singularity_api(ns));
    if (!has_bladeburner_api(ns)) {
        log(ns, "No access to Bladeburner API", colour.RED);
        return bool.NOT;
    }

    // Bladeburner pairs nicely with sleeves.  Require both to efficiently
    // automate Bladeburner.
    if (!has_sleeve_api(ns)) {
        log(ns, "No access to Sleeve API", colour.RED);
        return bool.NOT;
    }
    if (!has_all_sleeves(ns)) {
        const msg = `Require ${cc_t.MAX_SLEEVE} sleeves for Bladeburner`;
        log(ns, msg, colour.RED);
        return bool.NOT;
    }

    return bool.HAS;
}

/**
 * Join the Bladeburner division.
 *
 * @param {NS} ns The Netscript API.
 */
async function join(ns) {
    while (!ns.bladeburner.joinBladeburnerDivision()) {
        await ns.sleep(wait_t.SECOND);
    }
    log(ns, "Joined Bladeburner division");
}

/**
 * Wait until we have the required combat stats for Bladeburner.  We require a
 * minimum of 100 in each of Strength, Defense, Dexterity, and Agility to join
 * the Bladeburner division of the CIA.
 *
 * @param {NS} ns The Netscript API.
 */
async function required_stats(ns) {
    const player = new Player(ns);
    const stat = () => [
        player.agility(),
        player.defense(),
        player.dexterity(),
        player.strength(),
    ];
    const below_minimum = (s) => s < bb.stat.combat.MIN;
    while (stat().some(below_minimum)) {
        await ns.sleep(wait_t.DEFAULT);
    }
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("sleep");
}

/**
 * Initiate the Bladeburner load chain.
 *
 * Usage: run quack/bb/go.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);

    if (!has_api_access(ns)) {
        return;
    }
    await required_stats(ns);
    await join(ns);
}
