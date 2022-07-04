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
 * A class for handling time.
 */
export class Time {
    /**
     * Initialize a time object.
     */
    constructor() {
        // There isn't anything we need to do here.
    }

    /**
     * One millisecond.
     */
    millisecond() {
        return 1;
    }

    /**
     * The number of milliseconds in one minute.
     */
    minute() {
        return 60 * this.second();
    }

    /**
     * The number of milliseconds in one second.
     */
    second() {
        return 1000 * this.millisecond();
    }
}
