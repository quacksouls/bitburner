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

import { log_cct_failure } from "/lib/cct.js";
import { assert } from "/lib/util.js";

/**
 * Encode a string that consists of the same character.
 *
 * @param c A character.
 * @param n The run-length of the given character.
 * @return A run-length encoding of the given character.
 */
function encode(c, n) {
    assert(1 == c.length);
    assert(n > 0);
    let k = n;
    const max = 9;
    if (k <= max) {
        return k + "" + c;
    }
    // A run-length of more than 9 is split into multiple runs.
    const s = new Array();
    do {
        s.push(max + "" + c);
        k -= max;
    } while (k > max);
    s.push(k + "" + c);
    return s.join("");
}

/**
 * The run-length encoding (RLE) of a string.
 *
 * @param string We want to compress this string by means of run-length
 *     encoding.
 * @return The RLE of the given string.
 */
function rle(string) {
    const str = string;
    let n = 1;
    let c = str[0];
    const e = new Array();
    const lastidx = string.length - 1;
    for (let i = 1; i < str.length; i++) {
        // Is this character the same as the previous character?
        if (c == str[i]) {
            n++;
            // Are we at the end of the string?
            if (i == lastidx) {
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
        if (i == lastidx) {
            e.push(encode(c, n));
        }
    }
    return e.join("");
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
 * Usage: run rle.js [cct] [hostname]
 *
 * @param ns
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The host name of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const string = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(
        rle(string), cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/rle.txt";
        await log_cct_failure(ns, log, cct, host, string);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
