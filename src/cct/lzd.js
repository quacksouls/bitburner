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
import { lzchunk } from "/quack/lib/constant/cct.js";
import { base, empty_string } from "/quack/lib/constant/misc.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * Use a variant of the Lempel-Ziv (LZ) algorithm to decompress a string.  The
 * string is assumed to follow the format
 *
 * C_1 C_2 C_3 ... C_n
 *
 * where C_i is the i-th chunk of the string.  Each chunk has two parts:
 *
 * (1) L := The length of an uncompressed portion of data.  The length L is an
 *     integer between 1 and 9, inclusive.  The length number is the first part
 *     of any chunk.
 * (2) data := The chunk data, which is the second part of any chunk.  The
 *     chunk data can be further decomposed into two types:
 *     (a) Literal characters.  A chunk with this second part is denoted as
 *         "L<string>", where <string> is a string of L characters.  We append
 *         these L characters directly into the uncompressed string.  For
 *         example, given the chunk "3abc", the digit "3" is the first part of
 *         the chunk and the string "abc" is the second part.  The length 3,
 *         together with the string, tells us to copy the first 3 characters of
 *         the string and append the characters to the uncompressed data.  That
 *         is, we append the string "abc" to our uncompressed data.
 *     (b) An ASCII digit X.  A chunk having this second part is denoted as
 *         "LX", where X is a decimal digit between 1 and 9, inclusive.  The
 *         value of X tells us how many characters in the uncompressed string
 *         to backtrack.  Going from right to left in the uncompressed string,
 *         we traverse X locations, copy the character at the X-th location,
 *         and append the character to our uncompressed string.  Repeat the
 *         process as many times as necessary until we have appended L
 *         characters.  For example, suppose we have the chunk "53" and our
 *         (still incomplete) uncompressed string is "abcd".  The first part
 *         "5" tells us how many characters to append to the uncompressed
 *         string.  The second part "3" tells us to backtrack 3 positions in
 *         the uncompressed string to locate the character to copy and append.
 *         Here's how to obtain the first character to append.  Going from
 *         right to left in the uncompressed string "abcd", we backtrack to the
 *         3rd character, namely "b".  We copy this character and append it to
 *         our uncompressed string, resulting in the new uncompressed string
 *         "abcdb".  One down, four to go.  For our second character, we
 *         backtrack 3 locations in the uncompressed string "abcdb" to arrive
 *         at "c".  Copy and append this character to produce the new
 *         uncompressed string "abcdbc".  Two down, three to go.  The third
 *         character to copy and append is "d", resulting in the uncompressed
 *         string "abcdbcd".  The fourth character we want is "b" and we now
 *         have the uncompressed string "abcdbcdb".  Our fifth character is
 *         "c" and our uncompressed string is "abcdbcdbc".
 *
 * The chunk type alternates and we always start with a chunk of the type
 * L<string>.  The compressed data follows the format
 *
 * L<string> LX L<string> LX ...
 *
 * If L := 0, the chunk ends immediately and we start a new chunk of the type
 * different from the previous type.  A portion of the compressed data might be
 *
 * ... L<string> 0 L<string> ...
 *
 * or, as another example,
 *
 * ... LX 0 LX ...
 *
 * The above rules help us to make sense of the compressed data "312312021".
 * We have these chunks: "3123", "12", "0", "21".  The uncompressed string is
 * "123222".  Refer to the following for more details on the LZ algorithm.
 *
 * [1] J. Ziv and A. Lempel.  A universal algorithm for sequential data
 *     compression.  IEEE Transactions on Information Theory, volume 23,
 *     issue 3, pp.337--343, 1977.
 *     DOI: 10.1109/TIT.1977.1055714
 * [2] Colt McAnlis and Aleks Haecky.  Understanding Compression: Data
 *     Compression for Modern Developers.  O'Reilly, 2016.
 * [3] The Hitchhiker's Guide to Compression
 *     https://go-compression.github.io/
 *
 * @param {string} data We want to decompress this string.  The string is
 *     assumed to be the output of a variant of the LZ compression algorithm.
 *     Cannot be an empty string.
 * @returns {string} The decompressed string corresponding to the input data.
 */
function decompress(data) {
    assert(!is_empty_string(data));

    // Always start with the chunk format L<string>.
    let chunk_type = lzchunk.LS;
    // Where are we in the compressed string?
    let i = 0;
    // The uncompressed string.
    let result = empty_string;
    while (i < data.length) {
        const ell = parseInt(data[i], base.DECIMAL);

        // Is this chunk of type L<string>?
        if (lzchunk.LS === chunk_type) {
            // Do we end the chunk now?
            if (end_now(ell)) {
                i++;
                chunk_type = lzchunk.LX;
                continue;
            }

            // Copy the following L characters and append them to the
            // uncompressed string.
            const start = i + 1;
            const end = start + ell;
            result = result.concat(data.slice(start, end));
            chunk_type = lzchunk.LX;
            i = end;
            continue;
        }

        // This chunk is of type LX, which has 2 characters.
        assert(lzchunk.LX === chunk_type);
        // Do we end the chunk now?
        if (end_now(ell)) {
            i++;
            chunk_type = lzchunk.LS;
            continue;
        }

        // Backtrack X characters in the uncompressed string.  Copy and append
        // the X-th character to the uncompressed string.  Repeat L times.
        const x = parseInt(data[i + 1], base.DECIMAL);
        for (let j = 0; j < ell; j++) {
            const k = result.length - x;
            result = result.concat(result[k]);
        }
        chunk_type = lzchunk.LS;
        i += 2;
    }
    return result;
}

/**
 * Whether to end a chunk now.  Each chunk is either of the formats L<string>
 * or LX.  Here, L is a decimal digit between 0 and 9, inclusive.
 *
 * @param {number} ell The first part of any chunk, denoted as L.  Assumed to be
 *     a decimal digit between 0 and 9, inclusive.
 * @returns {boolean} True if a chunk ends now; false otherwise.
 */
function end_now(ell) {
    return ell === 0;
}

/**
 * Compression II: LZ Decompression: Lempel-Ziv (LZ) compression is a data
 * compression technique that encodes data using references to earlier parts of
 * the data.  In this variant of LZ, data is encoded as two types of chunk.
 * Each chunk begins with a length L, encoded as a single ASCII digit from 1 to
 * 9, followed by the chunk data, which is either:
 *
 * 1. Exactly L characters, which are to be copied directly into the
 *    uncompressed data.
 * 2. A reference to an earlier part of the uncompressed data.  To do this, the
 *    length is followed by a second ASCII digit X.  Each of the L output
 *    characters is a copy of the character X places before it in the
 *    uncompressed data.
 *
 * For both chunk types, a length of 0 instead means the chunk ends
 * immediately, and the next character is the start of a new chunk.  The two
 * chunk types alternate, starting with type 1, and the final chunk may be of
 * either type.  You are given an LZ-encoded string.  Decode it and output the
 * original string.
 *
 * Usage: run quack/cct/lzd.js [cct] [hostname]
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const [cct, host] = ns.args;

    // Solve the Coding Contract.
    const data = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(decompress(data), cct, host);

    // Log the result in case of failure.
    if (is_empty_string(result)) {
        const log = "/quack/cct/lzd.txt";
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
