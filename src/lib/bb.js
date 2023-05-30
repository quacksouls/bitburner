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

import { MyArray } from "/quack/lib/array.js";
import { bb_t } from "/quack/lib/constant/bb.js";
import { empty_string } from "/quack/lib/constant/misc.js";
import { random_integer } from "/quack/lib/random.js";
import { assert } from "/quack/lib/util.js";

/**
 * A class for managing Bladeburner.
 */
export class Bladeburner {
    /**
     * The Netscript API.
     */
    #ns;

    /**
     * Initialize a Bladeburner object.
     *
     * @param {NS} ns The Netscript API.
     */
    constructor(ns) {
        this.#ns = ns;
    }

    /**
     * Determine a high-tier skill to upgrade.  We want to level up these skills
     * as many times as possible.  Try to keep the levels of all high-tier
     * skills approximately equal.
     *
     * @returns {string} A high-tier skill.
     */
    choose_high_tier_skill() {
        const skill = [
            bb_t.skill.BLADE,
            bb_t.skill.CIRCUIT,
            bb_t.skill.CLOAK,
            bb_t.skill.EVADE,
            bb_t.skill.OBSERVER,
            bb_t.skill.REAPER,
        ];
        return this.#choose_skill(skill);
    }

    /**
     * Determine a low-tier skill to upgrade.  Level up these skills as many
     * times as possible.  Try to keep the levels of all low-tier skills
     * approximately equal.
     *
     * @returns {string} A low-tier skill.
     */
    choose_low_tier_skill() {
        const skill = [bb_t.skill.DATA, bb_t.skill.DRIVE, bb_t.skill.TRACER];
        return this.#choose_skill(skill);
    }

    /**
     * Choose a skill to upgrade.
     *
     * @param {array} skill Choose a skill from this array.
     * @return {string} A skill to upgrade.
     */
    #choose_skill(skill) {
        const level = skill.map((s) => this.#ns.bladeburner.getSkillLevel(s));
        const min = Math.min(...level);
        const is_min = (lvl) => lvl === min;
        const idx = level.findIndex(is_min);
        return skill[idx];
    }

    /**
     * Whether we have a contract whose estimated success chance is likely.
     *
     * @returns {boolean} True if we have a contract whose estimated success
     *     chance is likely; false otherwise.
     */
    has_likely_contract() {
        const is_likely = (ctr) => this.is_likely_contract(ctr);
        return Object.values(bb_t.contract).some(is_likely);
    }

    /**
     * Whether a contract has an estimated likely chance of success.
     *
     * @param {string} ctr A contract name.
     * @returns {boolean} True if the given contract has an estimated likely
     *     chance of success; false otherwise.
     */
    is_likely_contract(ctr) {
        const min = this.#ns.bladeburner.getActionEstimatedSuccessChance(
            "Contract",
            ctr
        )[0];
        return min >= bb_t.LIKELY;
    }

    /**
     * A random contract whose estimated success chance is likely.  We
     * prioritize Tracking contracts.
     *
     * @returns {string} A contract whose estimated success chance is likely.
     *     Empty string if none of the contracts are likely to succeed.
     */
    likely_contract() {
        if (!this.has_likely_contract()) {
            return empty_string;
        }

        const is_likely = (ctr) => this.is_likely_contract(ctr);
        let contract = Object.values(bb_t.contract).filter(is_likely);
        assert(!MyArray.is_empty(contract));

        // Prioritize Tracking contracts.
        const tracking = bb_t.contract.TRACK;
        if (contract.includes(tracking)) {
            const count = this.#ns.bladeburner.getActionCountRemaining(
                "Contracts",
                tracking
            );
            if (count > bb_t.MIN_CONTRACTS) {
                return tracking;
            }
        }

        // Randomly choose a likely contract.
        contract = contract.filter((c) => c !== tracking);
        if (MyArray.is_empty(contract)) {
            return empty_string;
        }
        const min = 0;
        const max = contract.length - 1;
        const idx = random_integer(min, max);
        return contract[idx];
    }

    /**
     * Attempt to upgrade a high priority skill.
     */
    upgrade_high_tier_skill() {
        const skill = this.choose_high_tier_skill();
        this.#ns.bladeburner.upgradeSkill(skill);
    }

    /**
     * Attempt to upgrade a low priority skill.
     */
    upgrade_low_tier_skill() {
        const skill = this.choose_low_tier_skill();
        this.#ns.bladeburner.upgradeSkill(skill);
    }

    /**
     * Attempt to upgrade a medium priority skill.
     */
    upgrade_mid_tier_skill() {
        const skill = bb_t.skill.CLOCK;
        const level = this.#ns.bladeburner.getSkillLevel(skill);
        const not_max = level < bb_t.skill.tau[skill];
        if (not_max) {
            this.#ns.bladeburner.upgradeSkill(skill);
        }
    }
}
