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
import { cities } from "/quack/lib/constant/location.js";
import { empty_string } from "/quack/lib/constant/misc.js";
import { home } from "/quack/lib/constant/server.js";

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
     * The chaos level in the current city.  The current city is the city we are
     * in for the purposes of Bladeburner.  This is not the same as the city in
     * which our avatar is located.
     *
     * @returns {number} The chaos level in the current city.
     */
    chaos() {
        const city = this.#ns.bladeburner.getCity();
        return this.#ns.bladeburner.getCityChaos(city);
    }

    /**
     * Choose a city having a minimum population.
     *
     * @returns {string} A city having a minimum population.  An empty string if
     *     the population of each city is below minimum.
     */
    choose_city() {
        // eslint-disable-next-line max-len
        const population = (ct) => this.#ns.bladeburner.getCityEstimatedPopulation(ct);
        const is_plentiful = (ct) => population(ct) > bb_t.MIN_POPULATION;
        const best = (cta, ctb) => population(ctb) - population(cta);
        const city = cities.all.filter(is_plentiful);
        city.sort(best);
        return MyArray.is_empty(city) ? empty_string : city[0];
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
        const skill = [
            bb_t.skill.DATA,
            bb_t.skill.DRIVE,
            bb_t.skill.MIDAS,
            bb_t.skill.TRACER,
        ];
        return this.#choose_skill(skill);
    }

    /**
     * Choose a type of operations to perform.
     *
     * @returns {string} A type of operations to perform.  An empty string if we
     *     cannot perform any of the operations.
     */
    choose_operations() {
        // All operations ordered by most desirable to least desirable.
        const candidate = [
            bb_t.operation.KILL,
            bb_t.operation.UNDERCOVER,
            bb_t.operation.INVESTIGATE,
        ];
        const is_plentiful = (opr) => !this.is_low_on_operations(opr);
        const is_likely = (opr) => this.is_likely_operation(opr);
        const choice = candidate.filter(is_plentiful).filter(is_likely);
        return MyArray.is_empty(choice) ? empty_string : choice[0];
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
     * Whether an operation has an estimated likely chance of success.
     *
     * @param {string} opr An operation name.
     * @returns {boolean} True if the given operation has an estimated likely
     *     chance of success; false otherwise.
     */
    is_likely_operation(opr) {
        const min = this.#ns.bladeburner.getActionEstimatedSuccessChance(
            "Operation",
            opr
        )[0];
        return min >= bb_t.MOST_LIKELY;
    }

    /**
     * Whether we are low on some types of contracts.
     *
     * @param {array<string>} blacklist Exclude these contracts.  Default is
     *     empty array.
     * @returns {boolean} True if we are low on some types of contracts;
     *     false otherwise.
     */
    is_low_on_contracts(blacklist = []) {
        // eslint-disable-next-line max-len
        const count = (ctr) => this.#ns.bladeburner.getActionCountRemaining("Contract", ctr);
        const is_low = (ctr) => count(ctr) < bb_t.MIN_CONTRACTS;
        const not_blacklisted = (ctr) => !blacklist.includes(ctr);
        return Object.values(bb_t.contract)
            .filter(not_blacklisted)
            .every(is_low);
    }

    /**
     * Whether we are low on a type of operations.
     *
     * @param {string} opr Check this type of operations.
     * @returns {boolean} True if we are low on the given type of operations;
     *     false otherwise.
     */
    is_low_on_operations(opr) {
        const count = this.#ns.bladeburner.getActionCountRemaining(
            "Operation",
            opr
        );
        return count < bb_t.MIN_OPERATIONS;
    }

    /**
     * Whether the population in the current city is low.
     *
     * @returns {boolean} True if the population in the current city is low;
     *     false otherwise.
     */
    is_low_population() {
        const city = this.#ns.bladeburner.getCity();
        const pop = this.#ns.bladeburner.getCityEstimatedPopulation(city);
        return pop < bb_t.MIN_POPULATION;
    }

    /**
     * Whether we are performing a type of operations.
     *
     * @returns {boolean} True if we are undertaking a type of operations;
     *     false otherwise.
     */
    is_performing_operations() {
        const { type } = this.#ns.bladeburner.getCurrentAction();
        return type !== bb_t.operation.IDLE;
    }

    /**
     * A random contract whose estimated success chance is likely.
     *
     * @param {array<string>} blacklist Do not choose contracts from this array.
     *     Default is empty array.
     * @returns {string} A contract whose estimated success chance is likely.
     *     Empty string if we cannot perform any of the contracts.
     */
    likely_contract(blacklist = []) {
        if (!this.has_likely_contract()) {
            return empty_string;
        }

        // An array of the prioritized contracts, sorted in descending order of
        // Intelligence XP to be gained from successful completion.  Choose the
        // earliest element in the array that has a likely chance of success.
        const priority = [
            bb_t.contract.BOUNTY,
            bb_t.contract.RETIRE,
            bb_t.contract.TRACK,
        ];
        const is_likely = (ctr) => this.is_likely_contract(ctr);
        const not_blacklisted = (ctr) => !blacklist.includes(ctr);
        let contract = priority.filter(is_likely).filter(not_blacklisted);
        if (MyArray.is_empty(contract)) {
            return empty_string;
        }

        // eslint-disable-next-line max-len
        const count = (ctr) => this.#ns.bladeburner.getActionCountRemaining("Contract", ctr);
        const is_plentiful = (ctr) => count(ctr) > bb_t.MIN_CONTRACTS;
        contract = contract.filter(is_plentiful);

        return MyArray.is_empty(contract) ? empty_string : contract[0];
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

/**
 * Whether the Bladeburner manager is running.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if the Bladeburner manager is running;
 *     false otherwise.
 */
export function is_bb_running(ns) {
    const script = ["/quack/bladeburner/go.js", "/quack/bladeburner/bb.js"];
    const is_running = (s) => ns.isRunning(s, home);
    return script.some(is_running);
}
