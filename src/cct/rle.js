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

import { log_cct_failure, print_error, print_success } from "/quack/lib/cct.js";
import { empty_string } from "/quack/lib/constant/misc.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * Encode a string that consists of the same character.
 *
 * @param {string} c A character.
 * @param {number} n The run-length of the given character.
 * @returns {string} A run-length encoding of the given character.
 */
function encode(c, n) {
    assert(c.length === 1);
    assert(n > 0);
    let k = n;
    const max = 9;
    if (k <= max) {
        return `${k}${c}`;
    }

    // A run-length of more than 9 is split into multiple runs.
    const s = [];
    do {
        s.push(`${max}${c}`);
        k -= max;
    } while (k > max);
    s.push(`${k}${c}`);
    return s.join(empty_string);
}

/**
 * The run-length encoding (RLE) of a string.
 *
 * @param {string} string We want to compress this string by means of run-length
 *     encoding.
 * @returns {string} The RLE of the given string.
 */
function rle(string) {
    const str = string;
    let n = 1;
    let c = str[0];
    const e = [];
    const lastidx = string.length - 1;
    for (let i = 1; i < str.length; i++) {
        // Is this character the same as the previous character?
        if (c === str[i]) {
            n++;
            // Are we at the end of the string?
            if (i === lastidx) {
                e.push(encode(c, n));
                break;
            }
            continue;
        }

        // The current character is different from the previous character.
        e.push(encode(c, n));
        n = 1;
        c = str[i];

        // Are we at the end of the string?
        if (i === lastidx) {
            e.push(encode(c, n));
        }
    }
    return e.join(empty_string);
}

/**
 * Compression I: RLE Compression: Run-length encoding (RLE) is a data
 * compression technique which encodes data as a series of runs of a repeated
 * single character.  Runs are encoded as a length, followed by the character
 * itself.  Lengths are encoded as a single ASCII digit.  Runs of 10 characters
 * or more are encoded by splitting them into multiple runs.  You are given a
 * string as input.  Encode it using run-length encoding with the minimum
 * possible output length.
 *
 * Usage: run quack/cct/rle.js [cct] [hostname]
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const [cct, host] = ns.args;

    // Solve the Coding Contract.
    const string = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(rle(string), cct, host);

    // Log the result in case of failure.
    if (is_empty_string(result)) {
        const log = "/quack/cct/rle.txt";
        await log_cct_failure(ns, log, cct, host, string);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
