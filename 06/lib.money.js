/**
 * Copyright (C) 2022 Duck McSouls
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
        this.#million = 10 ** 6;
    }

    /**
     * One billion, i.e. 10^9.
     */
    billion() {
        return 1000 * this.million();
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
