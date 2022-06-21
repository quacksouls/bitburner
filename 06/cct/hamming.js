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
 * Use Hamming code to encode a string of bits.
 *
 * @param n A positive integer.  This is our data.
 * @return A bit string representing the Hamming encoding of the given data.
 */
function encode(n) {
    assert(n > 0);
    // Convert from decimal to binary.  A decimal number is expressed in
    // base 10, whereas a binary number is expressed in base 2.
    const base = 2;
    const data = n.toString(base).split("").map(s => parseInt(s));
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
 * @param p The number of parity bits in the encoded message.
 * @param trash Rubbish placed at positions not occupied by a data bit.
 * @return An incomplete bit string, where only the data bits are placed.
 *     A position not occupied by a data bit is filled with rubbish as
 *     determined by @trash.
 */
function lay_data_bits(data, p, trash) {
    // The number of bits in our encoded message.  The extra one bit
    // is the overall parity bit, which is used to check the parity
    // of the whole message.
    const m = data.length + p + 1;
    // Determine the positions where the parity bits are to be placed.
    const pos = new Set(parity_position(p));
    // Lay out the data bits.
    const msg = Array(m).fill(trash);
    const _data = Array.from(data);
    _data.reverse();  // Reverse so we can use pop().
    for (let k = 3; k < m; k++) {
        if (pos.has(k)) {
            continue;
        }
        msg[k] = _data.pop();
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
 * @return The number of parity bits.
 */
function num_parity(data) {
    assert(data.length > 0);
    let p = 0;
    let max;
    const k = data.length;
    do {
        p++;
        max = 2 ** p;
    } while (max < (k + p + 1));
    return p;
}

/**
 * Set each parity bit.  The encoded message has a number of locations
 * that are reserved for parity bits.  We set each of these location to
 * 1 or 0.
 *
 * @param msg An incomplete encoded message.  Assume only the data bits
 *     to have been laid out.
 * @param nparity The number of parity bits in the encoded message.
 * @return The same as the input @msg array, but the location of parity
 *     bits have been set.  We do not modify @msg.
 */
function set_parity(msg, nparity) {
    assert(msg.length > 0);
    assert(nparity > 0);
    // The positions where the parity bits are placed.
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
    const n1 = array_sum(_msga);
    // Set the overall parity bit.
    _msg[0] = n1 % 2;
    return _msg;
}

/**
 * HammingCodes: Integer to Encoded Binary: You are given a decimal value.
 * Convert it into a binary string and encode it as a 'Hamming-Code'.
 * For example, the decimal value 8 will result in the binary string
 * 1000, which will be encoded with the pattern 'pppdpddd', where p is a
 * parity bit and d a data bit.  As another example, the binary
 * representation of the decimal value 21 is or '10101'.  The binary string
 * is encoded along the pattern 'pppdpdddpd' to result in '1001101011'.
 * NOTE: You need a parity bit at index 0 as an 'overall' parity bit.
 * Important rule for encoding: Not allowed to add additional leading '0's
 * to the binary value, i.e. the binary value has to be encoded as is.
 *
 * This is the problem of using Hamming code to encode a binary string, i.e.
 * a string of bits.  The Hamming code is extended with an additional overall
 * parity bit, which is located at index 0 in the encoded bit string.  Further
 * details here:
 *
 * https://en.wikipedia.org/wiki/Hamming_code
 * https://medium.com/swlh/hamming-code-generation-correction-with-explanations-using-c-codes-38e700493280
 * https://users.cs.fiu.edu/~downeyt/cop3402/hamming.html
 * https://www.youtube.com/watch?v=X8jsijhllIA
 * https://harryli0088.github.io/hamming-code/
 *
 * Usage: run hamming.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const n = 21;
    ns.tprint(encode(n).join(""));
}
