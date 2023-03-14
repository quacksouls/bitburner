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
    char_index,
    is_alphabetic,
    log_cct_failure,
    print_error,
    print_success,
} from "/quack/lib/cct.js";
import { vigenere_square } from "/quack/lib/constant/cct.js";
import { assert } from "/quack/lib/util.js";

/**
 * Pad the key so that it is the same length as the plaintext.
 *
 * @param plaintext We want to encrypt this string.  Cannot be empty string.
 * @param key Encryption is done using this key.  Cannot be empty string.
 * @return A string representing the key, possibly padded.  If the plaintext
 *     and key are of the same length, then return the original key.
 */
function pad_key(plaintext, key) {
    assert(plaintext.length > 0);
    assert(key.length > 0);
    if (plaintext.length === key.length) {
        return key;
    }
    let new_key = String(key);
    let i = 0;
    let n = 0;
    while (new_key.length < plaintext.length) {
        new_key += key[i];
        n++;
        i = n % key.length;
    }
    assert(new_key.length === plaintext.length);
    assert(new_key.length > key.length);
    return new_key;
}

/**
 * Vigenère encryption.  We encrypt only uppercase letters of the English
 * alphabet.  All other characters are ignored.
 *
 * @param plaintext We want to encrypt this string.  Cannot be empty string.
 * @param key Encryption is done using this key.  Cannot be empty string.
 * @return A ciphertext encrypted using the Vigenère cipher.
 */
function vigenere(plaintext, key) {
    // Sanity checks.
    assert(plaintext.length > 0);
    assert(key.length > 0);
    // Encryption.
    const ptxt = plaintext.toUpperCase();
    const pk = pad_key(plaintext, key);
    let ciphertext = "";
    const matrix = Array.from(vigenere_square);
    for (let i = 0; i < ptxt.length; i++) {
        if (!is_alphabetic(ptxt[i])) {
            ciphertext += ptxt[i];
            continue;
        }
        const row = char_index(ptxt[i]);
        const col = char_index(pk[i]);
        ciphertext += matrix[row][col];
    }
    assert(ciphertext.length === plaintext.length);
    return ciphertext;
}

/**
 * Encryption II: Vigenère Cipher: Vigenère cipher is a type of polyalphabetic
 * substitution.  It uses the Vigenère square to encrypt and decrypt plaintext
 * with a keyword.  Vigenère square:
 *
 *     A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
 *   +====================================================
 * A | A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
 * B | B C D E F G H I J K L M N O P Q R S T U V W X Y Z A
 * C | C D E F G H I J K L M N O P Q R S T U V W X Y Z A B
 * D | D E F G H I J K L M N O P Q R S T U V W X Y Z A B C
 * E | E F G H I J K L M N O P Q R S T U V W X Y Z A B C D
 * .......................................................
 * Y | Y Z A B C D E F G H I J K L M N O P Q R S T U V W X
 * Z | Z A B C D E F G H I J K L M N O P Q R S T U V W X Y
 *
 * For encryption each letter of the plaintext is paired with the corresponding
 * letter of a repeating keyword. For example, the plaintext DASHBOARD is
 * encrypted with the keyword LINUX:
 *
 * Plaintext: DASHBOARD
 *   Keyword: LINUXLINU
 *
 * So, the first letter D is paired with the first letter of the key L.
 * Therefore, row D and column L of the Vigenère square are used to get the
 * first cipher letter O.  This must be repeated for the whole ciphertext.  You
 * are given an array with two elements.  The first element is the plaintext,
 * the second element is the keyword.  Return the ciphertext as uppercase
 * string.
 *
 * This is Vigenère encryption, where the plaintext alphabet is the uppercase
 * characters of the English alphabet.
 *
 * Usage: run quack/cct/vigenere.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The hostname of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const [plaintext, key] = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(
        vigenere(plaintext, key),
        cct,
        host
    );
    // Log the result in case of failure.
    if (result.length === 0) {
        const log = "/quack/cct/vigenere.txt";
        const data = `[${plaintext}, ${key}]`;
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
