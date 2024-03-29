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

import { number } from "/quack/lib/constant/number.js";
import { assert } from "/quack/lib/util.js";

/// ///////////////////////////////////////////////////////////////////////
// Various static methods for handling numbers.
/// ///////////////////////////////////////////////////////////////////////

export class MyNumber {
    /**
     * Format a number according to whether it is in the thousands, millions,
     * billions, etc.
     *
     * @param {number} num Format this number.  Only support non-negative
     *     numbers for now.
     * @param {boolean} is_money Whether we are formatting money.  Default is
     *     false.
     * @returns {string} The same number, but formatted.
     */
    static format(num, is_money = false) {
        // Sanity checks.
        assert(num >= 0);
        const n = Math.abs(Number(num));
        const ndigit = 3;
        if (n < 1e3) {
            return is_money ? `${n.toFixed(ndigit)}` : `${n}`;
        }

        const fmt = (divisor, suffix) => {
            const fstr = (n / divisor).toFixed(ndigit);
            return `${fstr}${suffix}`;
        };

        // divisor := threshold[0][dindex]
        // suffix := threshold[0][sindex]
        const threshold = [
            [number.QUINTILLION, "Q"],
            [number.QUADRILLION, "q"],
            [number.TRILLION, "t"],
            [number.BILLION, "b"],
            [number.MILLION, "m"],
            [number.THOUSAND, "k"],
        ];
        const dindex = 0;
        const meet_threshold = (tau) => n >= tau[dindex];
        const [divisor, suffix] = threshold.find(meet_threshold);
        return fmt(divisor, suffix);
    }
}
