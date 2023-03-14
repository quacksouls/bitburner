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
import { base } from "/quack/lib/constant/misc.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * Use Hamming code to encode a string of bits.
 *
 * @param n A positive integer.  This is our data.
 * @return A bit string representing the Hamming encoding of the given data.
 */
function encode(n) {
    assert(n > 0);
    // Convert from decimal to binary.  A decimal number is expressed in
    // base 10, whereas a binary number is expressed in base 2.
    const data = n
        .toString(base.BINARY)
        .split("")
        .map((s) => parseInt(s, base.DECIMAL));
    // Determine the number of parity bits.
    const nparity = num_parity(data);
    assert(nparity > 0);
    // Lay out the data bits in the incomplete encoded message.  Set each
    // redundant bit as well as the overall parity bit.
    const TRASH = -1;
    let msg = lay_data_bits(data, nparity, TRASH);
    msg = set_parity(msg, nparity);
    return msg.join("");
}

/**
 * Lay out the data bits in the encoded message.  Position 0 in the message
 * is reserved for the overall parity bit.  Position 2^i in the message is
 * reserved for a parity (or redundant) bit, where i = 0, 1, 2, ...
 *
 * @param data An array of bits, representing the bit string of the data.
 * @param p The number of parity bits in the encoded message.  This number
 *     does not include the overall parity bit.
 * @param trash Rubbish placed at positions not occupied by a data bit.
 * @return An incomplete bit string, where only the data bits are placed.
 *     A position not occupied by a data bit is filled with rubbish whose
 *     value is determined by trash.
 */
function lay_data_bits(data, p, trash) {
    // The number of bits in our encoded message.  The extra one bit
    // is the overall parity bit, which is used to check the parity
    // of the whole message.
    const m = data.length + p + 1;
    // Determine the positions where the parity (i.e. redundant) bits are
    // to be placed.
    const pos = new Set(parity_position(p));
    // Lay out the data bits.
    const msg = Array(m).fill(trash);
    const _data = Array.from(data);
    // Index 0 is reserved for the overall parity bit.  Indices 1 and 2 are
    // for parity (i.e. redundant) bits.  So we start at index 3.
    for (let k = 3; k < m; k++) {
        if (pos.has(k)) {
            continue;
        }
        msg[k] = _data.shift();
    }
    return msg;
}

/**
 * Determine the number of parity bits.  Let p be the number of parity bits
 * and k the number of bits in the data.  The number of parity bits must
 * satisfy the inequality
 *
 * 2^p >= k + p + 1
 *
 * @param data The bit string to be encoded using Hamming code.
 * @return The number of parity bits.  This number does not include the overall
 *     parity bit.
 */
function num_parity(data) {
    assert(data.length > 0);
    let p = 0;
    let max;
    const k = data.length;
    do {
        p++;
        max = 2 ** p;
    } while (max < k + p + 1);
    // The encoded message has m := k + p + 1 bits, as explained below.
    //
    // k := The number of bits in the data, represented as a bit string.
    // p := The number of parity (i.e. redundant) bits.
    // 1 := The extra bit reserved for the overall parity bit.
    //
    // The number p of parity (i.e. redundant) bits is
    //
    // p = [log(m)]
    //
    // where the operator [] means the ceiling function and log() is the
    // logarithm using base 2.
    const m = k + p + 1;
    assert(p === Math.ceil(Math.log2(m)));
    return p;
}

/**
 * Set each parity bit.  The encoded message has a number of locations
 * that are reserved for parity bits.  We set each of these locations to
 * 1 or 0.
 *
 * @param msg An incomplete encoded message.  Assume only the data bits
 *     to have been laid out.
 * @param nparity The number of parity bits in the encoded message.  This
 *     number does not include the overall parity bit.
 * @return The same as the input msg array, but the location of parity
 *     bits have been set.  We do not modify msg.  We also set the
 *     overall parity bit.
 */
function set_parity(msg, nparity) {
    assert(msg.length > 0);
    assert(nparity > 0);
    // The positions where the parity bits are placed.  Do not include the
    // position of the overall parity bit.
    const pos = parity_position(nparity);
    // Set each parity bit.
    const _msg = Array.from(msg);
    for (const p of pos) {
        assert(p > 0);
        const n1 = count_one(_msg, p);
        // Is the number of 1s even or odd?  If the total number of 1s is
        // even, then the parity is 0.  Otherwise the parity is 1.
        _msg[p] = n1 % 2;
    }
    // Count the number of 1s in the encoded message, excluding the
    // very first position.
    const _msga = _msg.slice(1, _msg.length);
    const n1 = MyArray.sum(_msga);
    // Set the overall parity bit.
    _msg[0] = n1 % 2;
    return _msg;
}

/**
 * HammingCodes: Integer to Encoded Binary: You are given a decimal value.
 * Convert it into a binary string and encode it as a Hamming code.  For
 * example, the decimal value 8 will result in the binary string 1000, which
 * will be encoded with the pattern 'pppdpddd', where p is a parity bit and d
 * a data bit.  As another example, the binary representation of the decimal
 * value 21 is '10101'.  The binary string is encoded as the pattern
 * 'pppdpdddpd' to result in '1001101011'.
 * NOTE: You need a parity bit at index 0 as an overall parity bit.  Important
 * rule for encoding: Not allowed to add additional leading 0s to the binary
 * value, i.e. the binary value has to be encoded as is.
 *
 * This is the problem of using Hamming code to encode a binary string, i.e.
 * a string of bits.  The Hamming code is extended with an additional overall
 * parity bit, which is located at index 0 in the encoded bit string.  The
 * original paper where Hamming code is described:
 *
 * R. W. Hamming.  Error detecting and error correcting codes.  The Bell System
 * Technical Journal, volume 29, issue 2, 1950, pp.147--160.
 * DOI: 10.1002/j.1538-7305.1950.tb00463.x
 *
 * Expository notes here:
 *
 * https://en.wikipedia.org/wiki/Hamming_code
 * https://medium.com/swlh/hamming-code-generation-correction-with-explanations-using-c-codes-38e700493280
 * https://users.cs.fiu.edu/~downeyt/cop3402/hamming.html
 * https://www.youtube.com/watch?v=X8jsijhllIA
 * https://harryli0088.github.io/hamming-code/
 *
 * Usage: run quack/cct/hamming.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The hostname of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const n = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(encode(n), cct, host);
    // Log the result in case of failure.
    if (is_empty_string(result)) {
        const log = "/quack/cct/hamming.txt";
        await log_cct_failure(ns, log, cct, host, n);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
