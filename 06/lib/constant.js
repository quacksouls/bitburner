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

// A bunch of constant values.  These can be numeric constants or string
// constants.

/**
 * The home server of the player.
 */
export const home = "home";

/**
 * These programs are port openers.  Each program can be used to open a
 * specific port on a server.
 */
export const program = [
    "BruteSSH.exe", "FTPCrack.exe", "HTTPWorm.exe", "relaySMTP.exe",
    "SQLInject.exe"
];

/**
 * The prefix for the name of each purchased server.  The very first purchased
 * server is always named "pserv".  Any subsequent purchased server is named as
 * pserv-n, where n is a non-negative integer.
 */
export const pserv_prefix = "pserv";

/**
 * The hack script.  This script is used for hacking a server.
 */
export const script = "hack.js";
