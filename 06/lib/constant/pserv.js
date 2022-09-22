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

// A bunch of constant values related to purchased servers.

export const pserv = {
    // The minimum amount of RAM each purchased server should have to be
    // considered high-end.
    "HIGH_RAM": 16384,
    // By default, we purchase this many servers to kickstart our farm of
    // purchased servers as an early source of income and Hack XP.
    "MIN": 13,
    // The prefix for the name of each purchased server.  The very first
    // purchased server is always named "pserv".  Any subsequent purchased
    // server is named as pserv-n, where n is a non-negative integer.
    "PREFIX": "pserv",
    // An array of valid RAM for a purchased server.  Each RAM amount is a
    // power of 2.
    "RAM": [
        32,
        64,
        128,
        256,
        512,
        1024,
        2048,
        4096,
        8192,
        16384,
        32768,
        65536,
        131072,
        262144,
        524288,
        1048576
    ]
};
