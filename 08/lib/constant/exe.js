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

// A bunch of constant values related to programs that can be created or bought
// via the dark web.

/**
 * All programs that can be created.  These programs can also be purchased via
 * the dark web.  Data taken from this file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Programs/data/ProgramsMetadata.ts
 */
export function all_programs() {
    // A map where the key/value pair is as follows:
    //
    // key := The name of a program.
    // value := The minimum Hack stat at which we are able to create the
    //     program.
    const program = new Map([
        ["BruteSSH.exe", 50],
        ["FTPCrack.exe", 100],
        ["HTTPWorm.exe", 500],
        ["relaySMTP.exe", 250],
        ["SQLInject.exe", 750],
        ["DeepscanV1.exe", 75],
        ["DeepscanV2.exe", 400],
        ["ServerProfiler.exe", 75],
        ["AutoLink.exe", 25],
        ["Formulas.exe", 1000],
    ]);
    return program;
}

/**
 * The cheapest programs available via the dark web are:
 *
 * (1) BruteSSH.exe
 * (2) ServerProfiler.exe
 * (3) DeepscanV1.exe
 *
 * Each costs the same amount of $500k.  Data taken from this page:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/DarkWeb/DarkWebItems.ts
 *
 * If we are to delete any of these cheapest programs, then we should
 * definitely keep BruteSSH.exe.  The remaining candidates for deletion are
 * ServerProfiler.exe and DeepscanV1.exe.  Decide which of these two programs
 * we do not need and delete that one.
 */
export const cheapest_program = "DeepscanV1.exe";

/**
 * These programs are port openers.  Each program can be used to open a
 * specific port on a server.
 */
export const program = [
    "BruteSSH.exe",
    "FTPCrack.exe",
    "HTTPWorm.exe",
    "relaySMTP.exe",
    "SQLInject.exe",
];

/**
 * These are utility programs.  They are useful when we need to manually
 * traverse the network of world servers.
 */
export const utility_program = [
    "AutoLink.exe",
    "DeepscanV1.exe",
    "DeepscanV2.exe",
    "Formulas.exe",
    "ServerProfiler.exe",
];
