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
 * The number of ways to partition an integer using only integers from  a
 * given set.  Let n be our target sum and let our set of denominations be
 * D := [d_0, d_1, ..., d_{m-1}].  The problem has the following recursive
 * interpretation.  Let C(n, m) be the number of ways to partition n using the
 * first m denominations in D, i.e. using all denominations in D.  Consider
 * the denomination d_{m-1}.  Either a partition contains d_{m-1} or it does
 * not.  If a partition contains d_{m-1}, then the partition can have one more
 * more copies of d_{m-1}.  The number of partitions that contain d_{m-1} is
 * C(n - d_{m-1}, m).  If a partition does not contain d_{m-1}, then zero
 * copies of d_{m-1} occur in the partition.  The number of partitions that
 * exclude d_{m-1} is the number C(n, m-1).  Thus we have the recurrence
 * relation C(n, m) := C(n - d_{m-1}, m) + C(n, m-1).  The base cases are
 *
 * * C(n, m) := 1 if n = 0.
 * * C(n, m) := 0 if n < 0.
 * * C(n, m) := 0 if n >= 1 and m <= 0.
 *
 * @param n We want to partition this number.  Must be a positive integer.
 * @param m Use the first m values in the array of denominations.
 * @param denom An array of positive integers to use to partition n.
 *     Elements of the array are unique.  The array of denominations.
 * @return The number of ways to partition n using only integers from
 *     the denomination array.
 */
function partition(n, m, denom) {
    // Base cases.
    if ((n < 0) || (m <= 0)) {
        return 0;
    }
    if (0 == n) {
        return 1;
    }
    // Recursion.
    return partition(n - denom[m - 1], m, denom) + partition(n, m - 1, denom);
}

/**
 * Total Ways to Sum II: You are given an array with two elements. The first
 * element is an integer n.  The second element is an array of numbers
 * representing the set of available integers.  How many different ways can
 * that number n be written as a sum of integers contained in the given set?
 * You may use each integer in the set zero or more times.
 *
 * This is also known as the money changing problem.  Suppose we have a target
 * amount of money n.  We have m distinct dollar notes a_0, a_1, ..., a_{m-1}.
 * How many ways are there to combine one or more notes such that the total
 * amount is n?  We can use a note zero, one, or more times.  More details here:
 *
 * https://algorithmist.com/wiki/Coin_change
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const n = 189;
    const array = [1, 2, 3, 4, 7, 9, 10, 11, 12, 13, 14];
    ns.tprint(partition(n, array.length, array));
}
