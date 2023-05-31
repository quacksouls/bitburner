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
import { Sleeve } from "/quack/lib/sleeve/cc.js";
import { all_sleeves } from "/quack/lib/sleeve/util.js";

/**
 * Assign a sleeve to take on contracts.
 *
 * @param {NS} ns The Netscript API.
 */
function contracts(ns) {
    // Check whether a sleeve is taking on contracts.
    const sleeve = new Sleeve(ns);
    if (sleeve.is_performing_contracts()) {
        if (
            !sleeve.is_performing_likely_contracts()
            || sleeve.is_low_on_contracts()
        ) {
            ns.sleeve.setToIdle(sleeve.contractor());
        }
        return;
    }

    // See whether we can assign a sleeve to contracts.
    const bb = new Bladeburner(ns);
    if (!bb.has_likely_contract()) {
        return;
    }
    sleeve.perform_likely_contracts(bb.likely_contract());
}

/**
 * Set the sleeves to perform various initial tasks.
 *
 * @param {NS} ns The Netscript API.
 */
function init_sleeves(ns) {
    all_sleeves(ns).forEach((idx) => ns.sleeve.setToIdle(idx));
    const cc_job = [
        bb_t.task.FIELD, // 0
        bb_t.task.DIPLOM, // 1
        bb_t.task.INFILT, // 2
    ];
    const do_task = (task, idx) => ns.sleeve.setToBladeburnerAction(idx, task);
    cc_job.forEach(do_task);
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
 * Attempt to upgrade our various skills.
 *
 * @param {NS} ns The Netscript API.
 */
function upgrade_skills(ns) {
    const bb = new Bladeburner(ns);
    bb.upgrade_high_tier_skill();
    bb.upgrade_low_tier_skill();
    bb.upgrade_mid_tier_skill();
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
        contracts(ns);
        upgrade_skills(ns);
        await ns.sleep(bb_t.TICK);
    }
}
