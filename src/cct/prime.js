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
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * The largest prime factor of a positive integer.
 *
 * @param {number} n A positive integer greater than 1.
 * @returns {number} The largest prime factor of the given integer.
 */
function max_prime_factor(n) {
    // Sanity checks.
    assert(n > 1);
    assert(Number.isSafeInteger(n));

    // Determine the largest prime factor.
    let k = Number(n);
    let p = k;
    // Divide n by the prime 2.
    while (k % 2 === 0) {
        k /= 2;
        p = 2;
    }

    // Use trial division to divide n by increasingly larger primes.  Start with
    // the next higher prime, i.e. 3.
    let i = 3;
    const max = Math.ceil(Math.sqrt(n));
    while (i <= max) {
        // The number i is an odd integer.  If i is a factor of k, then i is the
        // highest prime factor of n so far.
        while (k % i === 0 && k > 1) {
            k /= i;
            p = i;
        }
        i += 2;
    }
    p = k > 1 ? k : p;
    return p;
}

/**
 * Find Largest Prime Factor: Given a number, find its largest prime
 * factor.  A prime factor is a factor that is a prime number.
 *
 * Determine the largest prime factor of an integer.  See Wikipedia for
 * more details:
 *
 * https://en.wikipedia.org/wiki/Integer_factorization
 *
 * Usage: run quack/cct/prime.js [cct] [hostname]
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const [cct, host] = ns.args;

    // Solve the coding contract.
    const n = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(max_prime_factor(n), cct, host);

    // Log the result in case of failure.
    if (is_empty_string(result)) {
        const log = "/quack/cct/prime.txt";
        await log_cct_failure(ns, log, cct, host, n);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
