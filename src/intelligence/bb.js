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
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * The sequence of general actions to perform.  The exact sequence of actions
 * depends on the level of chaos in the current city.
 *
 * @param {NS} ns The Netscript API.
 * @returns {array<string>} A sequence of general actions.
 */
function action_sequence(ns) {
    const bb = new Bladeburner(ns);
    const chaos = bb.chaos();
    if (chaos >= bb_t.chaos.HIGH) {
        return bb_t.diplomacy.HIGH;
    }
    if (bb_t.chaos.MID <= chaos && chaos < bb_t.chaos.HIGH) {
        return bb_t.diplomacy.MID;
    }
    if (bb_t.chaos.LOW <= chaos && chaos < bb_t.chaos.MID) {
        return bb_t.diplomacy.LOW;
    }
    return bb_t.diplomacy.NONE;
}

/**
 * Contracts to which a sleeve should not be assigned.
 *
 * @returns {array<string>} An array of contract names.
 */
function blacklist() {
    return [bb_t.contract.BOUNTY, bb_t.contract.RETIRE];
}

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

    // See whether we can assign a sleeve to contracts.  Do not assign a sleeve
    // to contracts that lower the population.
    const bb = new Bladeburner(ns);
    if (!bb.has_likely_contract()) {
        return;
    }
    const ctr = bb.likely_contract(blacklist());
    if (!is_empty_string(ctr)) {
        sleeve.perform_likely_contracts(ctr);
    }
}

/**
 * Attempt to generate more contracts if we are low on them.
 *
 * @param {NS} ns The Netscript API.
 */
function generate_contracts(ns) {
    const bb = new Bladeburner(ns);
    if (bb.is_low_on_contracts(blacklist())) {
        const sleeve = new Sleeve(ns);
        sleeve.generate_contracts();
    }
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
 * Take on a type of operations.
 *
 * @param {NS} ns The Netscript API.
 */
async function operations(ns) {
    const bb = new Bladeburner(ns);
    if (bb.is_performing_operations()) {
        return;
    }

    // See whether we can perform a type of operations.
    const opr = bb.choose_operations();
    if (!is_empty_string(opr)) {
        ns.bladeburner.startAction("Operation", opr);
        return;
    }

    // Cannot perform any of the desirable operations.  Perform other actions.
    // Set a sleeve to diplomacy to counteract the increase in chaos as a result
    // of the action "Incite Violence".
    const sleeve = new Sleeve(ns);
    const idx = sleeve.most_bonus_time();
    ns.sleeve.setToBladeburnerAction(idx, bb_t.task.DIPLOM);
    for (const act of action_sequence(ns)) {
        const buffer = 10;
        // eslint-disable-next-line max-len
        const time = Math.ceil(ns.bladeburner.getActionTime("General", act)) + buffer;
        ns.bladeburner.startAction("General", act);
        await ns.sleep(time);
        ns.bladeburner.stopBladeburnerAction();
    }
    ns.sleeve.setToIdle(idx);
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
 * Switch to a different city if the population in the current city is low.
 *
 * @param {NS} ns The Netscript API.
 */
function switch_city(ns) {
    const bb = new Bladeburner(ns);
    if (bb.is_low_population()) {
        const city = bb.choose_city();
        assert(!is_empty_string(city));
        ns.bladeburner.switchCity(city);
    }
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
 * Use Bladeburner to farm Intelligence XP.
 *
 * Usage: run quack/intelligence/bb.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    init_sleeves(ns);
    ns.atExit(() => ns.bladeburner.stopBladeburnerAction());

    for (;;) {
        upgrade_skills(ns);
        generate_contracts(ns);
        contracts(ns);
        await operations(ns);
        upgrade_skills(ns);
        switch_city(ns);
        await ns.sleep(bb_t.TICK);
    }
}
