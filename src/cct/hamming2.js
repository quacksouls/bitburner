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

import { MyArray } from "/quack/lib/array.js";
import {
    count_one,
    log_cct_failure,
    parity_position,
    print_error,
    print_success,
} from "/quack/lib/cct.js";
import { base, empty_string } from "/quack/lib/constant/misc.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * Check the parity bits.
 *
 * @param {string} msg An encoded message as a bit string.
 * @param {number} nparity The number of parity bits in the encoded message.
 * @returns {array} An array of indices where the parity bit has detected an
 *     error.  Each index is the location of a parity (i.e. redundant) bit.
 *     The value of this parity bit is different from the parity of the
 *     positions that the bit is meant to check.  An empty array if there
 *     are no errors in the parity check.
 */
function check_parity(msg, nparity) {
    // The positions where the parity bits are placed.
    const pos = parity_position(nparity);
    // Locations of error.  Each location is an index of the bit string.
    // Each index is the position of a parity (i.e. redundant) bit.
    const error = [];

    // Check each parity (i.e. redundant) bit.
    for (const p of pos) {
        assert(p > 0);

        // The function count_one() also counts the value of the parity
        // bit located at index p in the bit string.  If the value of
        // msg[p] is 1, we must subtract 1 from the result of the
        // count_one() function.
        let n1 = count_one(msg, p);
        if (msg[p] === 1) {
            n1--;
        }

        // Is there an error?
        const parity = n1 % 2;
        if (parity !== msg[p]) {
            error.push(p);
        }
    }
    return error;
}

/**
 * Decode a binary string to an integer.
 *
 * @param {string} msg A bit string that has been encoded using Hamming code.
 *     Going from left to right, the very first bit is the overall
 *     parity bit.  This is the extended Hamming code with an additional
 *     parity bit, also known as "single error correction, double error
 *     detection" (SECDED).
 * @returns {number} The integer corresponding to the encoded bit string.
 */
function decode(msg) {
    assert(!is_empty_string(msg));
    const _msg = Array.from(msg).map((s) => parseInt(s, base.DECIMAL));
    const nparity = num_parity(_msg);
    const _msgc = secded(_msg, nparity);
    return to_integer(_msgc, nparity);
}

/**
 * The number of parity (or redundant) bits.  Let p be the number of parity
 * bits, excluding the overall parity bit.  Let m be the number of message
 * bits.  These numbers satisfy the inequality
 *
 * 2^p >= m + p + 1
 *
 * @param {string} msg A bit string that has been encoded using Hamming code.
 *     The 0-th position is reserved for the overall parity bit.  The first
 *     parity (or redundant) bit is at index 1.  The second parity bit is at
 *     index 2.  Index 3 is the first index where a data bit is located.
 *     Assuming the message string has at least 1 bit, the encoded bit string
 *     has at least 4 bits.
 * @returns {number} The number of redundant bits, excluding the overall parity
 *     bit.
 */
function num_parity(msg) {
    const lower_bound = 4;
    assert(msg.length >= lower_bound);

    // Another way to calculate the number of parity bits.
    // let i = 0; // How many parity bits.
    // let pos = 2 ** i; // Position of a parity bit.
    // while (pos < msg.length) {
    //     i++;
    //     pos = 2 ** i;
    // }
    // assert(i === Math.ceil(Math.log2(msg.length)));
    // return i;

    return Math.ceil(Math.log2(msg.length));
}

/**
 * Correct a single error and detect two errors.  Also known as "single error
 * correction, double error detection" (SECDED).
 *
 * @param {string} msg A bit string that has been encoded using the extended
 *     Hamming code.
 * @param {number} nparity The number of parity (i.e. redundant) bits in the bit
 *     string.
 * @returns {string} The same bit string as msg, but with a single error
 *     corrected if there is an error in the bit string.
 */
function secded(msg, nparity) {
    // Check for errors in the parity (i.e. redundant) bits.
    const error = check_parity(msg, nparity);
    // No errors in the bit string.
    if (MyArray.is_empty(error)) {
        return msg;
    }

    // We have an error in the bit string.  Calculate the sum of the indices of
    // the erroneous parity bits.  This sum gives the index of where an error
    // occurs.  Correct one error.
    const i = MyArray.sum(error);
    const _msg = Array.from(msg);
    _msg[i] = (_msg[i] + 1) % 2;

    // Check the overall parity bit.  This allows us to check for the presence
    // of a second error, but we would not be able to correct the second error.
    const n1 = MyArray.sum(_msg.slice(1, _msg.length));
    assert(_msg[0] === n1 % 2);
    return _msg;
}

/**
 * Convert a Hamming code to an integer.
 *
 * @param {string} msg A bit string encoded using Hamming code.
 * @param {number} nparity The number of parity (i.e. redundant) bits in the
 *     bit string.  This does not include the overall parity bit, which is
 *     assumed to be at index 0 of msg.
 * @returns {number} An integer representation of the Hamming encoded bit
 *     string.
 */
function to_integer(msg, nparity) {
    assert(msg.length > 3);
    assert(nparity > 0);

    // Extract data bits, i.e. those bits that are not redundant bits and not
    // the overall parity bit.  Index 0 is reserved for the overall parity bit.
    // Index 1 is reserved for a redundant bit, so is index 2.  Therefore, we
    // start at index 3.
    const pos = new Set(parity_position(nparity));
    const data = [];
    for (let i = 3; i < msg.length; i++) {
        if (pos.has(i)) {
            continue;
        }
        data.push(msg[i]);
    }

    // The number is a binary representation of an integer.  Convert the binary
    // representation to a decimal representation.
    return parseInt(data.join(empty_string), base.BINARY);
}

/**
 * HammingCodes: Encoded Binary to Integer: You are given an encoded binary
 * string.  Treat it as a Hamming code with 1 possible error at a random index.
 * Find the possible wrong bit, fix it, and extract the decimal value from
 * the string.  Return the decimal value as a string.
 *
 * Note 1: The length of the binary string is dynamic, but its encoding/decoding
 *     follows Hamming's rule.
 * Note 2: Index 0 has an overall parity bit.
 * Note 3: There's a ~55% chance of having an altered bit.
 *
 * Usage: run quack/cct/hamming2.js [cct] [hostname]
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const [cct, host] = ns.args;

    // Solve the Coding Contract.
    const msg = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(decode(msg), cct, host);

    // Log the result in case of failure.
    if (is_empty_string(result)) {
        const log = "/quack/cct/hamming2.txt";
        await log_cct_failure(ns, log, cct, host, msg);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
