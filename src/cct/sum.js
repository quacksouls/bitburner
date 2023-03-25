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
 * The number of possible partitions of a non-negative integer n.  That is,
 * the number of ways to write n as a sum of positive integers.  In number
 * theory, the partition function p(n) solves the problem.  One solution is to
 * use a recurrence relation due to Euler, derived from using Euler's pentagonal
 * number theorem.  The recurrence relation is
 *
 * p(n) := \sum_{k \in PP} (-1)^{k-1} \{ A + B \}
 *
 * where
 *
 * A := p(n - k(3k - 1) / 2)
 * B := p(n - k(3k + 1) / 2)
 * PP := The set of all positive integers.
 *
 * In practice, we only sum up to and including k := n.  Another way to
 * calculate p(n) is to note that p(n) is the coefficient of z^n in the
 * generating function
 *
 * P(z) = \prod_{i=1}^n \frac{1}{1 - z^i}
 *
 * Calculating the coefficient of z^n is straightforward.  Refer to the
 * following for more details:
 *
 * [1] https://en.wikipedia.org/wiki/Pentagonal_number_theorem
 * [2] On Euler's Pentagonal Theorem
 *     https://www.mathpages.com/home/kmath623/kmath623.htm
 * [3] John A. Ewell.  Recurrences for the Partition Function and Its Relatives.
 *     Rocky Mountain Journal of Mathematics, volume 34, issue 2, pp.619--627,
 *     2004.
 *     DOI: 10.1216/rmjm/1181069871
 *
 * @param {number} n We want to determine the number of partitions of this
 *     number.  Must be a non-negative integer.
 * @returns {number} Possible values:
 *     (1) 1 if n = 0.
 *     (2) 0 if n < 0.
 *     (3) p(n)
 */
function partition(n) {
    assert(n >= 0);
    if (n === 0) {
        return 1;
    }

    // Use an array of n + 1 elements because we also need to take care of the
    // base case.
    const cache = Array(n + 1).fill(0);
    cache[0] = 1;
    for (let i = 1; i <= n; i++) {
        for (let j = i; j <= n; j++) {
            cache[j] += cache[j - i];
        }
    }
    return cache[n];
}

/**
 * Total Ways to Sum: Given a number, how many different distinct ways can
 * that number be written as a sum of at least two positive integers?
 *
 * This is the problem of integer partition, in particular calculating
 * the partition number of a positive integer.  The problem asks for a
 * partition that has at least two parts, so we must subtract 1 from
 * the partition number.  See Wikipedia for more details:
 *
 * https://en.wikipedia.org/wiki/Partition_(number_theory)
 * https://en.wikipedia.org/wiki/Partition_function_(number_theory)
 *
 * Use the method of generating function.
 *
 * Usage: run quack/cct/sum.js [cct] [hostname]
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const [cct, host] = ns.args;

    // Solve the coding contract.
    const n = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(partition(n) - 1, cct, host);

    // Log the result in case of failure.
    if (is_empty_string(result)) {
        const log = "/quack/cct/sum.txt";
        await log_cct_failure(ns, log, cct, host, n);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
