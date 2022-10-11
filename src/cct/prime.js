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

import { MyArray } from "/lib/array.js";
import { log_cct_failure, print_error, print_success } from "/lib/cct.js";
import { small_primes } from "/lib/constant/cct.js";
import { assert } from "/lib/util.js";

/**
 * Obtain a factor of a positive integer.
 *
 * @param n A positive integer greater than 1.
 * @return A factor of n.  If 1 and n are the only factors of n, then n is
 *     prime so return n.
 */
function factor(n) {
    assert(n > 1);
    // If n is even, then 2 is a factor of n.
    if (is_even(n)) {
        return 2;
    }
    // Use trial division to find a factor of n.  Suppose n can be factorized
    // as n = ab, where a > 1 and b > 1.  If n is a perfect square, then
    // n = ab = a^2.  Assume n is not a perfect square.  One of the factors a
    // and b is at most sqrt(n).  Divide n by odd integers between 3 and
    // sqrt(n), inclusive.
    const max = Math.ceil(Math.sqrt(n));
    let i = 3;
    while (i <= max) {
        const remainder = n % i;
        // Found a factor of n.
        if (0 == remainder) {
            return i;
        }
        i += 2;
    }
    assert(i > max);
    return n;
}

/**
 * Whether a number is even.
 *
 * @param n A positive integer greater than 1.
 * @return true if n is even; false otherwise.
 */
function is_even(n) {
    assert(n > 1);
    const remainder = n % 2;
    return 0 == remainder;
}

/**
 * The largest prime factor of a positive integer.
 *
 * @param n A positive integer greater than 1.
 * @return The largest prime factor of the given integer.
 *     Return -1 if there is an error.
 */
function max_prime_factor(n) {
    // Sanity checks.
    assert(n > 1);
    assert(Number.isSafeInteger(n));
    // Determine the largest prime factor.
    const pfactor = prime_factorization(n);
    const array = new MyArray();
    return array.max(pfactor);
}

/**
 * The prime factorization of a positive integer.
 *
 * @param n A positive integer greater than 1.
 * @return An array containing the prime factorization of n.
 */
function prime_factorization(n) {
    assert(n > 1);
    // First, take care of the small primes.
    const prime = new Set(small_primes);
    if (prime.has(n)) {
        return [n];
    }
    // A list of factors of n.  We want to break these factors into prime
    // factors.
    const candidate = [n];
    // The prime factors of n.
    const pfactor = new Array();
    while (candidate.length > 0) {
        const k = candidate.pop();
        const a = factor(k);
        // k cannot be factorized any further, hence is prime.
        if (a == k) {
            pfactor.push(k);
            continue;
        }
        // The integer a is a factor of k.  Obtain another factor b such that
        // ab == k, where a > 1, b > 1, and each factor is less than k.
        assert(a > 1);
        assert(a < k);
        const b = k / a;
        const remainder = k % b;
        assert(0 == remainder);
        candidate.push(a);
        candidate.push(b);
    }
    return pfactor;
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
 * Usage: run cct/prime.js [cct] [hostname]
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
    const result = ns.codingcontract.attempt(max_prime_factor(n), cct, host, {
        returnReward: true,
    });
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/prime.txt";
        await log_cct_failure(ns, log, cct, host, n);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
