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

import { log_cct_failure, print_error, print_success } from "/lib/cct.js";
import { INVALID, VALID } from "/lib/constant/bool.js";
import { assert } from "/lib/util.js";

/**
 * All valid IPv4 addresses from a string of digits.
 *
 * @param string A string of decimal digits.  Cannot be an empty string.
 * @return An array where each element is a string representing a valid
 *     IPv4 address.  An empty array if no valid IPv4 addresses can be
 *     generated from the given string.
 */
function all_ip(string) {
    assert(string.length > 0);
    // An IPv4 address has 4 octets, each of which is a segment of the digit
    // string.  No two segments overlap.  Each segment contains at most 3
    // digits.  The total length of all segments must be the same as the number
    // of digits in the digit string.
    const max_octet_length = 3;
    const ip_length = string.length;
    const ip = new Array();
    for (let i = 1; i <= max_octet_length; i++) {
        for (let j = 1; j <= max_octet_length; j++) {
            for (let k = 1; k <= max_octet_length; k++) {
                for (let ell = 1; ell <= max_octet_length; ell++) {
                    // Ensure the length of each octet sums to the length of a
                    // valid IPv4 address.
                    if (ip_length != i + j + k + ell) {
                        continue;
                    }
                    // Extract each segment.
                    const octet = extract_octets(string, i, j, k);
                    // Is each segment a valid octet in an IPv4 address?
                    if (!is_valid_ip(octet)) {
                        continue;
                    }
                    // We have found a valid IPv4 address.  Octets in an IPv4
                    // address are delimited by a period.
                    ip.push(octet.join("."));
                }
            }
        }
    }
    return ip;
}

/**
 * Extract 4 octets from a digit string.
 *
 * @param string A string of decimal digits.
 * @param i, j, k The boundary of each octet, where the boundary is with
 *     respect to the digit string.  Going from left to right in the digit
 *     string, the first octet starts from index 0 and ends at index i - 1,
 *     inclusive.  The range of indices of the first octet can be written as
 *     the closed interval [0, i - 1], meaning that digits in the first octet
 *     are digits found at the given range of indices in the digit string.
 *     The second octet has the range of indices [i, i + j - 1].  The third
 *     octet has the range of indices [i + j, i + j + k - 1].  Finally, the
 *     fourth octet has the range of indices [i + j + k, n - 1], where n is
 *     the length of the digit string.
 * @return An array where each element is a string of digits representing an
 *     octet of the digit string.
 */
function extract_octets(string, i, j, k) {
    assert(string.length > 0);
    assert(i > 0);
    assert(j > 0);
    assert(k > 0);
    const a = string.substring(0, i);
    const b = string.substring(i, i + j);
    const c = string.substring(i + j, i + j + k);
    const d = string.substring(i + j + k, string.length);
    return [a, b, c, d];
}

/**
 * Whether a given sequence of octets forms a valid IPv4 address.
 * A valid IPv4 address has 4 valid octets.
 *
 * @param octet An array of candidate octets to test.
 * @return true if each octet is valid; false otherwise.
 */
function is_valid_ip(octet) {
    assert(4 == octet.length);
    for (const seg of octet) {
        if (!is_valid_octet(seg)) {
            return INVALID;
        }
    }
    return VALID;
}

/**
 * Whether a given segment is a valid octet in an IPv4 address.
 *
 * @param octet A digit string.  Cannot be an empty string.
 * @return true if the given segment is a valid IPv4 octet; false otherwise.
 */
function is_valid_octet(octet) {
    assert(octet.length > 0);
    // An octet cannot begin with '0'.  The exception to this rule
    // is when the octet itself represents the number 0.
    if ("0" == octet[0]) {
        if ("0" != octet) {
            return INVALID;
        }
    }
    // An octet represents an integer between 0 and 255, inclusive.
    const base = 10;
    const n = parseInt(octet, base);
    const min = 0;
    const max = 255;
    if ((min <= n) && (n <= max)) {
        return VALID;
    }
    return INVALID;
}

/**
 * Generate IP Addresses: Given a string containing only digits, return an
 * array with all possible valid IP address combinations that can be created
 * from the string.  An octet in the IP address cannot begin with '0' unless
 * the number itself is actually 0.  For example, '192.168.010.1' is NOT
 * a valid IP.
 *
 * From the problem description, we only need to consider IPv4 addresses.
 * Don't need to handle IPv6 addresses.
 *
 * Usage: run cct/ip.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The hostname of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const string = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(
        all_ip(string), cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/ip.txt";
        await log_cct_failure(ns, log, cct, host, string);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
