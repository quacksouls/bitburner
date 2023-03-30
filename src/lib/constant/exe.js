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

/// ///////////////////////////////////////////////////////////////////////
// A bunch of constant values related to programs that can be created or bought
// via the dark web.
/// ///////////////////////////////////////////////////////////////////////

import { number } from "/quack/lib/constant/number.js";

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
export const cheapest_program = {
    COST: 5e5,
    NAME: "DeepscanV1.exe",
};

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
 * The purchasing schedule.  Use this schedule to help us buy a batch of
 * programs, depending on our current funds.  This schedule is used whenever our
 * money is less than some pre-defined constant M.  If our money is at least M,
 * then we switch to a dynamic purchasing schedule.
 */
export const buy_schedule = {
    /**
     * When we use a dynamic purchasing schedule, this constant is used to help
     * us determine how many programs to buy in a batch.
     */
    DIVISOR: 1e12,
    /**
     * The money threshold at which we switch to a dynamic purchasing schedule.
     * If our money is less than this constant, use the pre-defined schedule
     * below.
     */
    DYNAMIC_TAU: 100e12,
    /**
     * How many programs in a batch.  Each number n means we purchase n copies
     * of a particular program.
     */
    howmany: [50, 25, 12, 6, 3, 1, 1],
    /**
     * The maximum batch size.  How many programs to purchase in one go.  Need a
     * limit on the batch size, otherwise the script for Intelligence farming
     * would slow down the UI.
     */
    MAX_BATCH_SIZE: 1e4,
    /**
     * Various money thresholds.
     */
    money: [
        10 * number.TRILLION,
        number.TRILLION,
        500 * number.BILLION,
        100 * number.BILLION,
        number.BILLION,
        100 * number.MILLION,
        10 * number.MILLION,
    ],
    /**
     * The sleep time.  We sleep a given amount of time, depending on the batch
     * size and money.
     */
    time: [
        1, // 1 millisecond
        1,
        1e3, // 1 second
        10e3, // 10 seconds
        60e3,
        120e3, // 120 seconds or 2 minutes
        180e3, // 180 seconds or 3 minutes
    ],
};

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
