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

import { assert } from "/quack/lib/util.js";

/**
 * A class to hold various utility methods for dealing with arrays.  Cannot
 * name it "Array" because there is already a class called "Array" in the
 * standard API library.
 */
export class MyArray {
    /**
     * Whether the given array has only non-negative numbers.
     *
     * @param {array} array An array of integers.  Cannot be an empty array.
     * @returns {boolean} True if the array has only non-negative integers;
     *     false otherwise.
     */
    static all_nonnegative(array) {
        assert(!this.is_empty(array));
        for (const a of array) {
            if (a < 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Whether an array is empty, i.e. has zero elements.
     *
     * @param {array} arr Test this array.
     * @returns {boolean} True if the given array is empty; false otherwise.
     */
    static is_empty(arr) {
        assert(Array.isArray(arr));
        return arr.length === 0;
    }

    /**
     * The maximum element of an array.
     *
     * @param {array} array We want to determine the maximum element of this
     *     array.  Cannot be an empty array.
     * @returns {number} The largest element of the given array.
     */
    static max(array) {
        assert(!this.is_empty(array));
        const init_value = -Infinity;
        const max = (x, y) => Math.max(x, y);
        return array.reduce(max, init_value);
    }

    /**
     * A sequence of non-negative integers, starting from zero.  Each number in
     * the sequence is one more than the previous number.
     *
     * @param {number} num How many numbers in the sequence.  Must be positive.
     *     If num := 4, then our sequence is [0, 1, 2, 3].
     * @returns {array} A sequence of num numbers starting from 0.
     */
    static sequence(num) {
        const n = Math.floor(num);
        assert(n > 0);

        // Zoekeeper (Ansopedi#3422) on the Bitburner server of Discord pointed
        // out that this code is faster:
        //
        // return Array(n).fill().map((_, index) => index);
        //
        // However, the above is less readable than the line below.
        return [...Array(n).keys()];
    }

    /**
     * Sort an array in ascending order.
     *
     * @param {array} array We want to sort this array.  Cannot be empty.
     * @returns {array} A new array whose elements are sorted in ascending
     *     order.  If the array has duplicate elements, we are actually sorting
     *     in non-decreasing order.
     */
    static sort_ascending(array) {
        assert(!this.is_empty(array));
        const arr = Array.from(array);
        const ascending = (a, b) => a - b;
        arr.sort(ascending);
        return arr;
    }

    /**
     * Sort an array of 2-tuples in ascending order, using the first element of
     * each tuple.  The usual scenario is when we have an array of arrays like
     * so:
     *
     * [[1, 2], [3, 1], [1, 3], [5, 4]]
     *
     * where each element is a 2-tuple, i.e. an array of 2 elements.  The
     * sorted array would be
     *
     * [[1, 2], [1, 3], [3, 1], [5, 4]]
     *
     * @param {array} array We want to sort this array of 2-tuples.  Cannot be
     *     an empty array.
     * @returns {array} A new array of 2-tuples, where each element is sorted in
     *     ascending order.  The sort is done based on the first element of
     *     each 2-tuple.
     */
    static sort_ascending_tuple(array) {
        assert(!this.is_empty(array));
        const arr = Array.from(array);
        const ascending = (a, b) => a[0] - b[0];
        arr.sort(ascending);
        return arr;
    }

    /**
     * Sort an array in descending order.
     *
     * @param {array} array We want to sort this array.  Cannot be empty.
     * @returns {array} A new array whose elements are sorted in descending
     *     order.  If the array has duplicate elements, then we are actually
     *     sorting the array in non-increasing order.
     */
    static sort_descending(array) {
        assert(!this.is_empty(array));
        const arr = Array.from(array);
        const descending = (a, b) => b - a;
        arr.sort(descending);
        return arr;
    }

    /**
     * Sum the elements of an array.
     *
     * @param {array} array We want to add together the elements of this array.
     *     Cannot be an empty array.
     * @returns {number} The sum of the elements in the given array.
     */
    static sum(array) {
        assert(!this.is_empty(array));
        const init_value = 0;
        const add = (sum, current) => sum + current;
        return array.reduce(add, init_value);
    }
}
