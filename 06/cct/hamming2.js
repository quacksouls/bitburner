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

import { array_sum, assert, count_one, parity_position } from "./libbnr.js";

/**
 * Check the parity bits.
 *
 * @param msg An encoded message as a bit string.
 * @param nparity The number of parity bits in the encoded message.
 * @return An array of indices where the parity bit has detected an error.
 *     Each index is the location of a parity (i.e. redundant) bit.  The
 *     value of this parity bit is different from the parity of the
 *     positions that the bit is meant to check.  An empty array if there
 *     are no errors in the parity check.
 */
function check_parity(msg, nparity) {
    // The positions where the parity bits are placed.
    const pos = parity_position(nparity);
    // Locations of error.  Each location is an index of the bit string.
    // Each index is the position of a parity (i.e. redundant) bit.
    const error = new Array();
    // Check each parity (i.e. redundant) bit.
    for (const p of pos) {
        assert(p > 0);
        // The function count_one() also counts the value of the parity
        // bit located at index p in the bit string.  If the value of
        // msg[p] is 1, we must subtract 1 from the result of the
        // count_one() function.
        let n1 = count_one(msg, p);
        if (1 == msg[p]) {
            n1--;
        }
        // Is there an error?
        const parity = n1 % 2;
        if (parity != msg[p]) {
            error.push(p);
        }
    }
    return error;
}

/**
 * Decode a binary string to an integer.
 *
 * @param msg A bit string that has been encoded using Hamming code.
 *     Going from left to right, the very first bit is the overall
 *     parity bit.  This is the extended Hamming code with an additional
 *     parity bit, also known as "single error correction, double error
 *     detection" (SECDED).
 * @return The integer corresponding to the encoded bit string.
 */
function decode(msg) {
    assert(msg.length > 0);
    const base = 10;
    const _msg = Array.from(msg).map(s => parseInt(s, base));
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
 * @param msg A bit string that has been encoded using Hamming code.
 *     The 0-th position is reserved for the overall parity bit.  The first
 *     parity (or redundant) bit is at the 1st position.  The second parity
 *     bit is at index 2.  Index 3 is the first index where a data bit is
 *     located.  Assuming the message string has at least 1 bit, the encoded
 *     bit string has at least 4 bits.
 * @return The number of redundant bits, excluding the overall parity bit.
 */
function num_parity(msg) {
    const lower_bound = 4;
    assert(msg.length >= lower_bound);
    const lastidx = msg.length - 1;
    let i = 0;         // How many parity bits.
    let pos = 2 ** i;  // Position of a parity bit.
    while (pos <= lastidx) {
        i++;
        pos = 2 ** i;
    }
    return i;
}

/**
 * Correct a single error and detect two errors.  Also known as "single error
 * correction, double error detection" (SECDED).
 *
 * @param msg A bit string that has been encoded using the extended Hamming
 *     code.
 * @param nparity The number of parity (i.e. redundant) bits in the bit string.
 * @return The same bit string as msg, but with a single error corrected if
 *     there is an error in the bit string.
 */
function secded(msg, nparity) {
    // Check for errors in the parity (i.e. redundant) bits.
    const error = check_parity(msg, nparity);
    // No errors in the bit string.
    if (0 == error.length) {
        return msg;
    }
    // An error in the bit string.  The sum of the indices of the erroneous
    // parity bits.  This sum gives the index of where an error occurs.
    // Correct one error.
    const i = array_sum(error);
    const _msg = Array.from(msg);
    _msg[i] = (_msg[i] + 1) % 2;
    // Check the overall parity bit.  This allows us to check for the presence
    // of a second error, but we would not be able to correct the second error.
    const n1 = array_sum(_msg.slice(1, _msg.length));
    assert(_msg[0] == (n1 % 2));
    return _msg;
}

/**
 * Convert a Hamming code to an integer.
 *
 * @param msg A bit string encoded using Hamming code.
 * @param nparity The number of parity (i.e. redundant) bits in the
 *     bit string.  This does not include the overall parity bit, which is
 *     assumed to be at index 0 of msg.
 * @return An integer representation of the Hamming encoded bit string.
 */
function to_integer(msg, nparity) {
    assert(msg.length > 3);
    assert(nparity > 0);
    // Extract data bits, i.e. those bits that are not redundant bits and not
    // the overall parity bit.  Index 0 is reserved for the overall parity bit.
    // Index 1 is reserved for a redundant bit, so is index 2.  Therefore, we
    // start at index 3.
    const pos = new Set(parity_position(nparity));
    let data = new Array();
    for (let i = 3; i < msg.length; i++) {
        if (pos.has(i)) {
            continue;
        }
        data.push(msg[i]);
    }
    // The number is a binary representation of an integer.  Convert the binary
    // representation to a decimal representation.
    const base = 2;
    return parseInt(data.join(""), base);
}

/**
 * HammingCodes: Encoded Binary to Integer: You are given an encoded binary
 * string.  Treat it as a Hamming code with 1 possible error at a random index.
 * Find the possible wrong bit, fix it, and extract the decimal value from
 * the string.  Return the decimal value as a string.
 *
 * Note 1: The length of the binary string is dynamic, but its encoding/decoding
 *     follows Hamming's rule.
 * Note 2: Index 0 is an overall parity bit.
 * Note 3: There's a ~55% chance of having an altered bit.
 *
 * Usage: run hamming2.js [cct] [hostName]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The host name of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const msg = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(
        decode(msg), cct, host, { returnReward: true }
    );
    ns.tprint(host + ": " + cct + ": " + result);
}
