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

// A bunch of constant values related to programs that can be created or bought via the dark web.

/**
 * All programs that can be created.  These programs can also be purchased via
 * the dark web.
 */
export function all_programs() {
    // A map where the key/value pair is as follows:
    //
    // key := The name of a program.
    // value := The minimum Hack stat at which we are able to create the
    //     program.
    const program = new Map();
    program.set("BruteSSH.exe", 50);
    program.set("FTPCrack.exe", 100);
    program.set("HTTPWorm.exe", 500);
    program.set("relaySMTP.exe", 250);
    program.set("SQLInject.exe", 750);
    program.set("DeepscanV1.exe", 75);
    program.set("DeepscanV2.exe", 400);
    program.set("ServerProfiler.exe", 75);
    program.set("AutoLink.exe", 25);
    program.set("Formulas.exe", 1000);
    return program;
}

/**
 * These programs are port openers.  Each program can be used to open a
 * specific port on a server.
 */
export const program = [
    "BruteSSH.exe",
    "FTPCrack.exe",
    "HTTPWorm.exe",
    "relaySMTP.exe",
    "SQLInject.exe"
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
    "ServerProfiler.exe"
];
