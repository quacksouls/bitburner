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

import { assert } from "/lib/util.js";

/**
 * A class to hold various utility methods for dealing with arrays.  Cannot
 * name it "Array" because there is already a class called "Array" in the
 * standard API library.
 */
export class MyArray {
    /**
     * Initialize an array object.
     */
    constructor() {
        // Nothing to do here.
    }

    /**
     * Whether the given array has only non-negative numbers.
     *
     * @param array An array of integers.  Cannot be an empty array.
     * @return true if the given array has only non-negative integers;
     *     false otherwise.
     */
    all_nonnegative(array) {
        assert(array.length > 0);
        for (const a of array) {
            if (a < 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * The maximum element of an array.
     *
     * @param We want to determine the maximum element of this array.  Cannot
     *     be an empty array.
     * @return The largest element of the given array.
     */
    max(array) {
        assert(array.length > 0);
        const init_value = -Infinity;
        const mx = array.reduce(
            function (x, y) {
                return Math.max(x, y);
            },
            init_value
        );
        return mx;
    }

    /**
     * A sequence of non-negative integers, starting from zero.  Each number in
     * the sequence is one more than the previous number.
     *
     * @param num How many numbers in the sequence.  Must be positive.  If
     *     num := 4, then our sequence is [0, 1, 2, 3].
     * @return An array representing a sequence of num numbers starting from 0.
     */
    sequence(num) {
        const n = Math.floor(num);
        assert(n > 0);
        return Array(n).fill().map((_, index) => index);
    }

    /**
     * Sort an array in ascending order.
     *
     * @param array We want to sort this array.  Cannot be an empty array.
     * @return A new array whose elements are sorted in ascending order.  If
     *     the array has duplicate elements, we are actually sorting in
     *     non-decreasing order.
     */
    sort_ascending(array) {
        assert(array.length > 0);
        const arr = Array.from(array);
        arr.sort(
            function (a, b) {
                return a - b;
            }
        );
        return arr;
    }

    /**
     * Sort an array in descending order.
     *
     * @param array We want to sort this array.  Cannot be an empty array.
     * @return A new array whose elements are sorted in descending order.  If
     *     the array has duplicate elements, then we are actually sorting the
     *     array in non-increasing order.
     */
    sort_descending(array) {
        assert(array.length > 0);
        const arr = Array.from(array);
        arr.sort(
            function (a, b) {
                return b - a;
            }
        );
        return arr;
    }

    /**
     * Sum the elements of an array.
     *
     * @param array We want to add the elements of this array.  Cannot be an
     *     empty array.
     * @return The sum of the elements in the given array.
     */
    sum(array) {
        assert(array.length > 0);
        const init_value = 0;
        const total = array.reduce(
            function (sum, current) {
                return sum + current;
            },
            init_value
        );
        return total;
    }
}
