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

import {
    english_alphabet,
    char_index,
    is_alphabetic,
    log_cct_failure,
    print_error,
    print_success,
} from "/quack/lib/cct.js";
import { empty_string } from "/quack/lib/constant/misc.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * The Caesar cipher on the given plaintext and left shift length k.  Suppose
 * letters of the plaintext are uppercase characters in the English alphabet.
 * Given a left shift of k, each alphabetic character in the plaintext is
 * substituted with an alphabetic character found by left shifting by k
 * positions along the alphabet.  For example, using k := 3 we have the
 * encryption:
 *
 * DEF -> ABC
 * ABC -> XYZ
 * CAT DOG. -> ZXQ ALD.
 *
 * As shown in the above examples, we wrap around the alphabet whenever
 * necessary.  Furthermore, the substitution only applies to characters of the
 * plaintext alphabet.  Punctuation, whitespace, and special characters are
 * ignored.
 *
 * @param {string} plaintext Encrypt this string using the Caesar cipher.
 *     Cannot be empty string.
 * @param {number} k The left shift length.  We shift to the left by this many
 *     characters, taking into account rotation (wrap around).  Must be a
 *     non-negative integer.
 * @returns {string} The ciphertext corresponding to the plaintext, encrypted
 *     using the Caesar cipher having a left shift of k positions.
 */
function caesar(plaintext, k) {
    // Sanity checks.
    const ell = Math.floor(k);
    assert(!is_empty_string(plaintext));
    assert(ell >= 0);

    // Encryption.
    const alphabet = english_alphabet();
    const n = alphabet.length;
    const ptxt = plaintext.toUpperCase();
    let ciphertext = empty_string;
    for (let i = 0; i < ptxt.length; i++) {
        if (!is_alphabetic(ptxt[i])) {
            ciphertext += ptxt[i];
            continue;
        }

        // Index of the ciphertext character.
        let j = char_index(ptxt[i]) - ell;
        if (j < 0) {
            j += n;
        }
        ciphertext += alphabet[j];
    }
    return ciphertext;
}

/**
 * Encryption I: Caesar Cipher: Caesar cipher is one of the simplest encryption
 * techniques.  It is a type of substitution cipher in which each letter in the
 * plaintext is replaced by a letter some fixed number of positions down the
 * alphabet.  For example, with a left shift of 3, D would be replaced by A, E
 * would become B, and A would become X (because of rotation).  You are given
 * an array with two elements.  The first element is the plaintext, the second
 * element is the left shift value.  Return the ciphertext as uppercase string.
 * Spaces remain the same.
 *
 * This is Caesar cipher encryption, where the plaintext alphabet is the
 * uppercase characters of the English alphabet.
 *
 * Usage: run quack/cct/caesar.js [cct] [hostname]
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The hostname of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const [plaintext, k] = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(caesar(plaintext, k), cct, host);
    // Log the result in case of failure.
    if (is_empty_string(result)) {
        const log = "/quack/cct/caesar.txt";
        const data = `[${plaintext}, ${k}]`;
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
