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

// Various constants related to time.

/**
 * Various pre-defined periods.  Use these as our waiting times.  If we want
 * a custom period of time, we should define it using the given amount of
 * time in millisecond, second, or minute.
 */
export const wait_t = {
    // The default waiting period in seconds.  Use this for most purposes, when
    // we wait for an action to complete.
    DEFAULT: 5e3,
    // One hour expressed in milliseconds.
    HOUR: 36e5,
    // One millisecond.
    MILLISECOND: 1,
    // One minute expressed in milliseconds.
    MINUTE: 6e4,
    // One second expressed in milliseconds.
    SECOND: 1e3,
};
