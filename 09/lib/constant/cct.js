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

// Various constant values related to Coding Contracts.

/**
 * The suffix for files that contain Coding Contracts.
 */
export const cct_suffix = ".cct";

/**
 * The time in milliseconds required for the game to randomly generate a random
 * Coding Contract on a random server, while in game.  While the game is
 * running, the probability for a Coding Contract to be spawned is 0.25.  Each
 * game cycle is 200 milliseconds.  The game randomly generates a Coding
 * Contract once every 3000 cycles.  Thus once every 200 x 3000 = 600,000
 * milliseconds, or every 10 minutes, we have 25% chance for a Coding Contract
 * to spawn on a server.  These constants are taken from
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/engine.tsx
 */
export const cct_update_interval = 6 * 1e5;

/**
 * Various colours for graph colouring, i.e. testing whether a graph is
 * bipartite.
 */
export const colour = {
    "BLUE": 0,
    "RED": 1,
    "WHITE": 2
};

/**
 * The types of chunk data in Lempel-Ziv compression and decompression.
 */
export const lzchunk = {
    // The chunk format L<string>.
    "LS": 1,
    // The chunk format LX.
    "LX": 2
};

/**
 * The opening and closing parentheses.
 */
export const parenthesis = {
    "CLOSE": ")",
    "OPEN": "("
};

/**
 * A list of small prime numbers.
 */
export const small_primes = [
    2,
    3,
    5,
    7,
    11,
    13,
    17,
    19,
    23,
    29,
    31,
    37,
    41,
    43,
    47,
    53,
    59,
    61,
    67,
    71,
    73,
    79,
    83,
    89,
    97,
    101,
    103,
    107,
    109,
    113,
    127,
    131,
    137,
    139,
    149,
    151,
    157,
    163,
    167,
    173,
    179,
    181,
    191,
    193,
    197,
    199,
    211
];

/**
 * The Vigenère square.
 */
export const vigenere_square = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "BCDEFGHIJKLMNOPQRSTUVWXYZA",
    "CDEFGHIJKLMNOPQRSTUVWXYZAB",
    "DEFGHIJKLMNOPQRSTUVWXYZABC",
    "EFGHIJKLMNOPQRSTUVWXYZABCD",
    "FGHIJKLMNOPQRSTUVWXYZABCDE",
    "GHIJKLMNOPQRSTUVWXYZABCDEF",
    "HIJKLMNOPQRSTUVWXYZABCDEFG",
    "IJKLMNOPQRSTUVWXYZABCDEFGH",
    "JKLMNOPQRSTUVWXYZABCDEFGHI",
    "KLMNOPQRSTUVWXYZABCDEFGHIJ",
    "LMNOPQRSTUVWXYZABCDEFGHIJK",
    "MNOPQRSTUVWXYZABCDEFGHIJKL",
    "NOPQRSTUVWXYZABCDEFGHIJKLM",
    "OPQRSTUVWXYZABCDEFGHIJKLMN",
    "PQRSTUVWXYZABCDEFGHIJKLMNO",
    "QRSTUVWXYZABCDEFGHIJKLMNOP",
    "RSTUVWXYZABCDEFGHIJKLMNOPQ",
    "STUVWXYZABCDEFGHIJKLMNOPQR",
    "TUVWXYZABCDEFGHIJKLMNOPQRS",
    "UVWXYZABCDEFGHIJKLMNOPQRST",
    "VWXYZABCDEFGHIJKLMNOPQRSTU",
    "WXYZABCDEFGHIJKLMNOPQRSTUV",
    "XYZABCDEFGHIJKLMNOPQRSTUVW",
    "YZABCDEFGHIJKLMNOPQRSTUVWX",
    "ZABCDEFGHIJKLMNOPQRSTUVWXY"
];
