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

import { Bladeburner } from "/quack/lib/bb.js";
import { bb_t } from "/quack/lib/constant/bb.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { Sleeve } from "/quack/lib/sleeve/cc.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * Assign a sleeve to take on contracts.
 *
 * @param {NS} ns The Netscript API.
 */
function contracts(ns) {
    // Check whether a sleeve is taking on contracts.
    const sleeve = new Sleeve(ns);
    const idx = bb_t.sleeve.CONTRACT;
    if (sleeve.is_performing_contracts(idx)) {
        if (!sleeve.is_performing_likely_contracts(idx)) {
            ns.sleeve.setToBladeburnerAction(idx, bb_t.task.INFILT);
        }
        return;
    }

    // See whether we can assign a sleeve to contracts.
    const bb = new Bladeburner(ns);
    if (!bb.has_likely_contract()) {
        ns.sleeve.setToBladeburnerAction(idx, bb_t.task.INFILT);
        return;
    }
    const ctr = bb.likely_contract();
    assert(!is_empty_string(ctr));
    ns.sleeve.setToBladeburnerAction(idx, bb_t.task.CONTRACT, ctr);
}

/**
 * Set the sleeves to perform various initial tasks.
 *
 * @param {NS} ns The Netscript API.
 */
function init_sleeves(ns) {
    const cc_job = [
        bb_t.task.FIELD,
        bb_t.task.FIELD,
        bb_t.task.DIPLOM,
        bb_t.task.INFILT,
        bb_t.task.INFILT,
        bb_t.task.INFILT,
        bb_t.task.INFILT,
        bb_t.task.INFILT,
    ];
    const do_task = (task, idx) => ns.sleeve.setToBladeburnerAction(idx, task);
    cc_job.forEach(do_task);
}

/**
 * The update loop for managing our Bladeburner tasks.
 *
 * @param {NS} ns The Netscript API.
 */
function update(ns) {
    contracts(ns);
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
 * Manage our Bladeburner tasks.
 *
 * Usage: run quack/bladeburner/bb.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);

    init_sleeves(ns);
    for (;;) {
        update(ns);
        await ns.sleep(wait_t.DEFAULT);
    }
}
