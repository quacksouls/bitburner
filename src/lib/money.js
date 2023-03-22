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

import { home } from "/quack/lib/constant/server.js";
import { number_format } from "/quack/lib/util.js";

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
        return `$${number_format(amount)}`;
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

/**
 * The amount of money the player has.
 *
 * @param {NS} ns The Netscript API.
 * @returns {number} Our current amount of money.
 */
export function money(ns) {
    return ns.getServerMoneyAvailable(home);
}
