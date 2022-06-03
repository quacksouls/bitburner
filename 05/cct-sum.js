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

/**
 * The number of possible partitions of a non-negative integer n.  That is,
 * the number of ways to write n as a sum of positive integers.  In number
 * theory, the partition function p(n) solves the problem.  Here, we use
 * a recurrence relation due Euler.
 *
 * @param ns The Netscript API.
 * @param n We want to determine the number of partitions of this number.
 *     Must be a non-negative integer.
 * @return Possible values:
 *     * 1 if n == 0.
 *     * 0 if n < 0.
 *     * p(n)
 */
async function partition(ns, n) {
    // Sanity check.
    const num = Math.floor(n);
    if (num < 0) {
        return 0;
    }
    // Base case.
    if (0 == num) {
        return 1;
    }
    // Recursion.
    let sum = 0;
    const time = 1;
    for (let k = 1; k <= num; k++) {
        const c = (k*(3*k - 1)) / 2;
        const d = (k*(3*k + 1)) / 2;
        const a = await partition(ns, num - c);
        const b = await partition(ns, num - d);
        const sign = (-1) ** (k - 1);
        sum += sign * (a + b);
        await ns.sleep(time);
    }
    return sum;
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
 * Use Euler's pentagonal number theorem.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const n = Math.floor(ns.args[0]);
    const p = await partition(ns, n);
    ns.tprint(p - 1);
}
