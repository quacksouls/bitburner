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

import { log_cct_failure } from "./libbnr.js";

/**
 * The number of possible partitions of a non-negative integer n.  That is,
 * the number of ways to write n as a sum of positive integers.  In number
 * theory, the partition function p(n) solves the problem.  Here, we use
 * a recurrence relation due to Euler, derived from using Euler's pentagonal
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
 * In practice, we only sum up to and including k := n.  Refer to the following
 * for more details:
 *
 * [1] https://en.wikipedia.org/wiki/Pentagonal_number_theorem
 * [2] On Euler's Pentagonal Theorem
 *     https://www.mathpages.com/home/kmath623/kmath623.htm
 * [3] John A. Ewell.  Recurrences for the Partition Function and Its Relatives.
 *     Rocky Mountain Journal of Mathematics, volume 34, issue 2, pp.619--627,
 *     2004.
 *     DOI: 10.1216/rmjm/1181069871
 *
 * @param n We want to determine the number of partitions of this number.
 *     Must be a non-negative integer.
 * @return Possible values:
 *     * 1 if n = 0.
 *     * 0 if n < 0.
 *     * p(n)
 */
let partition = (function () {
    // A memoized version of the partition function.
    const cache = new Map();
    function p(n) {
        // Sanity check.
        const num = Math.floor(n);
        if (num < 0) {
            return 0;
        }
        // Base case.
        if (0 == num) {
            return 1;
        }
        // Check the cache.
        if (cache.has(num)) {
            return cache.get(num);
        }
        // Recursion.
        let sum = 0;
        for (let k = 1; k <= num; k++) {
            const c = (k * (3 * k - 1)) / 2;
            const d = (k * (3 * k + 1)) / 2;
            const a = p(num - c);
            const b = p(num - d);
            const sign = (-1) ** (k - 1);
            sum += sign * (a + b);
        }
        cache.set(num, sum);
        return cache.get(num);
    }
    return p;
})();

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
 * Use Euler's pentagonal number theorem.
 *
 * Usage: run sum.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The host name of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const n = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(
        partition(n) - 1, cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/sum.txt";
        await log_cct_failure(ns, log, cct, host, n);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
