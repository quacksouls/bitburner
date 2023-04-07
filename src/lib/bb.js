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
        const contract = Object.values(bb_t.contract).filter(is_likely);
        assert(!MyArray.is_empty(contract));

        // Prioritize Tracking contracts.
        if (contract.includes(bb_t.contract.TRACK)) {
            return bb_t.contract.TRACK;
        }

        // Randomly choose a likely contract.
        const min = 0;
        const max = contract.length - 1;
        const idx = random_integer(min, max);
        return contract[idx];
    }
}
