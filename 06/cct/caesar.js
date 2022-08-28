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
 * An array of uppercase letters of the English alphabet.
 */
function english_alphabet() {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
}

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
 * @param plaintext Encrypt this string using the Caesar cipher.  Cannot be
 *     empty string.
 * @param k The left shift length.  We shift to the left by this many
 *     characters, taking into account rotation (wrap around).  Must be a
 *     non-negative integer.
 * @return The ciphertext corresponding to the plaintext, encrypted using the
 *     Caesar cipher having a left shift of k positions.
 */
function caesar(plaintext, k) {
    // Sanity checks.
    const ell = Math.floor(k);
    assert(plaintext.length > 0);
    assert(ell >= 0);
    // Encryption.
    const alphabet = english_alphabet();
    const n = alphabet.length;
    const ptxt = plaintext.toUpperCase();
    let ciphertext = "";
    for (let i = 0; i < ptxt.length; i++) {
        if (!is_alphabetic(ptxt[i])) {
            ciphertext += ptxt[i];
            continue;
        }
        // Index of the ciphertext character.
        let j = index(ptxt[i]) - ell;
        if (j < 0) {
            j = n + j;
        }
        ciphertext += alphabet[j];
    }
    return ciphertext;
}

/**
 * The index of an alphabetic character.
 *
 * @param c A character of the English alphabet.
 * @return The index of the given character, where index starts from zero.
 */
function index(c) {
    const alphabet = new Map([
        ["A", 0],
        ["B", 1],
        ["C", 2],
        ["D", 3],
        ["E", 4],
        ["F", 5],
        ["G", 6],
        ["H", 7],
        ["I", 8],
        ["J", 9],
        ["K", 10],
        ["L", 11],
        ["M", 12],
        ["N", 13],
        ["O", 14],
        ["P", 15],
        ["Q", 16],
        ["R", 17],
        ["S", 18],
        ["T", 19],
        ["U", 20],
        ["V", 21],
        ["W", 22],
        ["X", 23],
        ["Y", 24],
        ["Z", 25]
    ]);
    assert(alphabet.has(c));
    return alphabet.get(c);
}

/**
 * Whether a character is an uppercase letter of the English alphabet.
 *
 * @param c A character.  Cannot be empty string.
 * @return true if the given character is an uppercase letter of the English
 *     alphabet; false otherwise.
 */
function is_alphabetic(c) {
    assert(1 == c.length);
    return english_alphabet().includes(c);
}

/**
 * Encryption I: Caesar Cipher: Caesar cipher is one of the simplest encryption
 * technique.  It is a type of substitution cipher in which each letter in the
 * plaintext is replaced by a letter some fixed number of positions down the
 * alphabet.  For example, with a left shift of 3, D would be replaced by A, E
 * would become B, and A would become X (because of rotation).  You are given
 * an array with two elements.  The first element is the plaintext, the second
 * element is the left shift value.  Return the ciphertext as uppercase string.
 * Spaces remains the same.
 *
 * This is Ceasar cipher encryption, where the plaintext alphabet is the
 * uppercase characters of the English alphabet.
 *
 * Usage: run caesar.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The hostname of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const [plaintext, k] = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(
        caesar(plaintext, k), cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/caesar.txt";
        const data = "[" + plaintext + ", " + k + "]";
        await log_cct_failure(ns, log, cct, host, data);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
