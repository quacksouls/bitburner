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

/// ///////////////////////////////////////////////////////////////////////
// Miscellaneous helper functions for solving coding contracts.
/// ///////////////////////////////////////////////////////////////////////

import { io } from "/quack/lib/constant/io.js";
import { colour, empty_string } from "/quack/lib/constant/misc.js";
import { log } from "/quack/lib/io.js";
import { assert } from "/quack/lib/util.js";

/**
 * The index of an alphabetic character.
 *
 * @param {string} c A character of the English alphabet.  Cannot be empty
 *     string.
 * @returns {number} The index of the given character; index starts from zero.
 */
export function char_index(c) {
    assert(c.length === 1);
    const alphabet = new Map([
        ["A", 0],
        ["B", 1],
        ["C", 2],
        ["D", 3],
        ["E", 4],
        ["F", 5],
        ["G", 6],
        ["H", 7],
        ["I", 8],
        ["J", 9],
        ["K", 10],
        ["L", 11],
        ["M", 12],
        ["N", 13],
        ["O", 14],
        ["P", 15],
        ["Q", 16],
        ["R", 17],
        ["S", 18],
        ["T", 19],
        ["U", 20],
        ["V", 21],
        ["W", 22],
        ["X", 23],
        ["Y", 24],
        ["Z", 25],
    ]);
    assert(alphabet.has(c));
    return alphabet.get(c);
}

/**
 * Count the total occurrence of 1 in a bit string.  This function does not
 * necessarily count all 1s in a bit string.  Some positions can be skipped.
 *
 * @param {string} msg A bit string, representing a possibly incomplete encoded
 *     message.  The message is encoded using Hamming code.  If the bit string
 *     is an incomplete encoded message, the location of each parity bit has
 *     been filled with rubbish.
 * @param {number} p The position of a parity (or redundant) bit.  Its value is
 *     always a power of 2.  We start counting from this position in the bit
 *     string.  The value of p also tells us how many consecutive positions to
 *     skip.  In Hamming code, when checking parity we check p consecutive
 *     positions and skip p consecutive positions, giving us a window of 2p
 *     consecutive positions.  To reach the next window, we should skip 2p
 *     positions.
 * @returns {number} The number of 1s in the given bit string, while skipping
 *     over some positions.
 */
export function count_one(msg, p) {
    assert(msg.length > 0);
    assert(p > 0);
    let n1 = 0;
    let i = p;
    const skip = 2 * p;
    while (i < msg.length) {
        for (let j = i; j < i + p; j++) {
            if (msg[j] === 1) {
                n1++;
            }
        }
        i += skip;
    }
    return n1;
}

/**
 * Uppercase letters of the English alphabet.
 *
 * @returns {string} All capital letters of the English alphabet.
 */
export function english_alphabet() {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
}

/**
 * Whether a character is an uppercase letter of the English alphabet.
 *
 * @param {string} c A character.  Cannot be empty string.
 * @returns {boolean} True if the given character is an uppercase letter of the
 *     English alphabet; false otherwise.
 */
export function is_alphabetic(c) {
    assert(c.length === 1);
    return english_alphabet().includes(c);
}

/**
 * Log a failure when attempting to solve a Coding Contract (CCT).
 *
 * @param {NS} ns The Netscript API.
 * @param {string} fname Write our log to this file.  Must be a text file with
 *     file extension ".txt".
 * @param {string} cct The file name of the CCT.
 * @param {string} host The hostname of the server where the CCT is located.
 * @param {string} data The data used for solving the CCT.
 */
export async function log_cct_failure(ns, fname, cct, host, data) {
    const date = new Date(Date.now());
    await ns.write(fname, date.toISOString(), io.APPEND);
    await ns.write(fname, `, ${host}, ${cct}${io.NEWLINE}`, io.APPEND);
    await ns.write(fname, data + io.NEWLINE, io.APPEND);
}

/**
 * Format a matrix as a string.
 *
 * @param {array<array>} mat A matrix, i.e. an array of arrays.
 * @returns {string} The given matrix as a string.
 */
export function matrix_to_string(mat) {
    let string = empty_string;
    const delim = ", ";
    for (let i = 0; i < mat.length; i++) {
        string += `[${mat[i]}]${delim}`;
    }
    string = string.slice(0, string.length - delim.length);
    return `[${string}]`;
}

/**
 * The maximum profit to be made when we are restricted to at most one
 * transaction.  The algorithm is similar to Kadane's algorithm.  However, we
 * must keep track of the minimum price as well as the maximum profit.
 * Essentially, we want to buy low and sell high, but we are restricted to one
 * transaction.  This means we are restricted by these rules:
 *
 * (1) Only one buy action.
 * (2) Only one sell action.
 * (3) Must first buy before we can sell.
 *
 * The idea is to determine two days i and j, where i < j and
 * price[i] < price[j], such that the difference price[j] - price[i] is
 * maximized.
 *
 * Refer to the following for more details:
 *
 * https://betterprogramming.pub/dynamic-programming-interview-questions-how-to-maximize-stock-profits-8ed4966c2206
 *
 * @param {array} price An array where price[i] represents the price of a stock
 *     on day i.  All prices are for the same stock.
 * @returns {number} The maximum profit we can make, assuming at most one
 *     transaction.  Return 0 if no profit can be made or the price array is
 *     empty.
 */
export function max_profit_kadane(price) {
    // Empty price array means zero profit.
    if (price.length === 0) {
        return 0;
    }

    // Must start on the second day.  On the first day, we have only one
    // price value so the minimum of one value is that value itself.
    let max_profit = 0;
    let min_price = price[0];
    for (let i = 1; i < price.length; i++) {
        // We need to keep track of the minimum price.  Let mp be the minimum
        // price so far.  If the price on day i is lower than mp, we set mp to
        // to the new minimum price.  Otherwise, we move to the price on the
        // next day.
        min_price = Math.min(min_price, price[i]);

        // Why do we need to keep track of the minimum price so far?  Let mp be
        // the minimum price up to and including day i.  Let price[i] be the
        // price on day i.  The profit pf is defined as the price on day i
        // minus the running minimum price:
        //
        // pf := price[i] - mp
        //
        // Here, the minimum price mp occurs during one of the days from the
        // first to the current day, i.e. mp is one of the price values
        //
        // price[0], price[1], ..., price[i]
        //
        // If we were to buy the stock on some day j (0 <= j <= i) at the
        // minimum price of mp, we can sell the stock on day i to make a profit
        // of pf.  The following can happen:
        //
        // (1) mp < price[i].  We make a profit pf.  Let mpf be the maximum
        //     profit we can make on day i.  We compare the profit pf on day i
        //     to the maximum profit mpf we can make on day i.  If mpf < pf,
        //     then we adjust our maximum profit so far to the value of pf.
        //     Otherwise, we keep the value of mpf as is.  The maximum profit
        //     we can make so far is the maximum of mpf and pf.
        // (2) mp = price[i].  We break even.  No loss, no profit.
        // (3) mp > price[i].  We make a loss because we are selling our stock
        //     at a price lower than when we bought the stock.  Our minimum
        //     price should be adjusted to the price on day i.  The minimum
        //     price so far is the minimum of mp and price[i].
        const profit = price[i] - min_price;
        max_profit = Math.max(max_profit, profit);
    }
    return max_profit;
}

/**
 * The positions (or indices) where the parity bits are placed in a bit string
 * that has been encoded using Hamming code.  These parity bits are also known
 * as redundant bits to distinguish them from the overall parity bit placed at
 * index 0 in the encoded bit string.
 *
 * @param {number} p The number of parity bits.
 * @returns {array} An array, where each element represents the position or
 *     index of a parity bit.  These parity bits are also called redundant bits.
 *     This array does not include the position of the overall parity
 *     bit, which is assumed to be at index 0 in the encoded message.
 */
export function parity_position(p) {
    assert(p > 0);
    const array = [];
    for (let i = 0; i < p; i++) {
        array.push(2 ** i);
    }
    return array;
}

/**
 * Print to the terminal an error message about which Coding Contract (CCT) we
 * did not solve correctly.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host The hostname of the server where the CCT was found.
 * @param {string} cct The file name of the CCT.
 */
export function print_error(ns, host, cct) {
    const msg = `${host}: ${cct}: FAILURE`;
    log(ns, msg, colour.RED);
}

/**
 * Print to the terminal a message about the reward from successfully solving
 * a Coding Contract (CCT).
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host The hostname of the server where the CCT was found.
 * @param {string} cct The file name of the CCT.
 * @param {string} reward The reward from solving the CCT.
 */
export function print_success(ns, host, cct, reward) {
    const msg = `${host}: ${cct}: ${reward}`;
    log(ns, msg);
}

/**
 * The maximum profit that can be made when we are restricted to at most two
 * transactions.  Transactions must occur one after the other.  Suppose we buy
 * one share of a stock on day i and sell the share on day j, where i < j.  We
 * cannot buy another share of the same stock on any day between i and j.
 * However, we are allowed to buy another share of the stock from day j+1
 * onward.
 *
 * The above description hints at a simple solution.  We partition the price
 * array into two non-overlapping parts:
 *
 * (1) The left part starts from day 0 and ends at day k, inclusive.  Run
 *     Kadane's algorithm on the left subarray to get mpl as our maximum profit
 *     for the left subarray.
 * (2) The right part starts from day k+1 and ends at the last day in the price
 *     array.  Run Kadane's algorithm on the right subarray to get mpr as our
 *     maximum profit for the right subarray.
 *
 * The maximum profit is mpl + mpr.  This maximum profit is for one particular
 * partition of the price array.  There are many other partitions, one for each
 * value of k.  Calculate the maximum profit for each partition.  The true
 * maximum profit is the maximum of the results of all partitions.
 *
 * @param {array} price An array of prices, where price[i] is the price of one
 *     share of a stock on day i.  All prices relate to the same stock.
 * @returns {number} The maximum profit to be made, assuming we can perform at
 *     most two transactions.  Return 0 if no profit can be made.
 */
export function stock_traderIII(price) {
    assert(price.length > 0);
    // Obtain all possible partitions of the price array.  Each partition
    // divides the array into two parts: the left subarray and the right
    // subarray.
    let max_profit = 0;
    for (let k = 0; k < price.length; k++) {
        // The left and right subarrays in the partition.
        const left = price.slice(0, k + 1);
        const right = price.slice(k + 1, price.length);

        // The maximum profit of each subarray in the partition.
        const mpl = max_profit_kadane(left);
        const mpr = max_profit_kadane(right);

        // The running maximum profit.
        max_profit = Math.max(max_profit, mpl + mpr);
    }
    return max_profit;
}
