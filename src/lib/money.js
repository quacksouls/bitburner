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

/**
 * A class to hold information about money.
 */
export class Money {
    /**
     * The value for one million.
     */
    #million;

    /**
     * Initialize a money object.
     */
    constructor() {
        this.#million = 1e6;
    }

    /**
     * One billion, i.e. 10^9.
     */
    billion() {
        return 1000 * this.million();
    }

    /**
     * Format currency.
     *
     * @param {number} amount Format this amount as currency.
     * @returns {string} The given amount formatted as currency.
     */
    static format(amount) {
        const ndigit = 3; // How many significant digits.
        const fmt = (divisor, suffix) => {
            const fstr = (Math.abs(Number(amount)) / divisor).toFixed(ndigit);
            return `$${fstr}${suffix}`;
        };
        const is_quintillion = (n) => Math.abs(Number(n)) >= 1e18;
        const is_quadrillion = (n) => Math.abs(Number(n)) >= 1e15;
        const is_trillion = (n) => Math.abs(Number(n)) >= 1e12;
        const is_billion = (n) => Math.abs(Number(n)) >= 1e9;
        const is_million = (n) => Math.abs(Number(n)) >= 1e6;
        const is_thousand = (n) => Math.abs(Number(n)) >= 1e3;

        let [divisor, suffix] = [0, ""];
        if (is_quintillion(amount)) {
            [divisor, suffix] = [1e18, "Q"];
        } else if (is_quadrillion(amount)) {
            [divisor, suffix] = [1e15, "q"];
        } else if (is_trillion(amount)) {
            [divisor, suffix] = [1e12, "t"];
        } else if (is_billion(amount)) {
            [divisor, suffix] = [1e9, "b"];
        } else if (is_million(amount)) {
            [divisor, suffix] = [1e6, "m"];
        } else if (is_thousand(amount)) {
            [divisor, suffix] = [1e3, "k"];
        } else {
            [divisor, suffix] = [1, ""];
        }
        return fmt(divisor, suffix);
    }

    /**
     * One million, i.e. 10^6.
     */
    million() {
        return this.#million;
    }

    /**
     * One quadrillion, i.e. 10^15.
     */
    quadrillion() {
        return 1000 * this.trillion();
    }

    /**
     * One trillion, i.e. 10^12.
     */
    trillion() {
        return 1000 * this.billion();
    }
}
