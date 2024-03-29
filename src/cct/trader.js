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

import {
    log_cct_failure,
    max_profit_kadane,
    print_error,
    print_success,
} from "/quack/lib/cct.js";
import { is_empty_string } from "/quack/lib/util.js";

/**
 * Algorithmic Stock Trader I: You are given an array of numbers representing
 * stock prices, where the i-th element represents the stock price on day i.
 * Determine the maximum possible profit you can earn using at most one
 * transaction (i.e. you can buy and sell the stock once).  If no profit can
 * be made, then the answer should be 0.  Note that you must buy the stock
 * before you can sell it.
 *
 * This is similar, but not identical, to the problem
 * "Subarray with Maximum Sum".
 *
 * Usage: run quack/cct/trader.js [cct] [hostname]
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const [cct, host] = ns.args;

    // Solve the Coding Contract.
    const array = ns.codingcontract.getData(cct, host);
    const profit = max_profit_kadane(array);
    const result = ns.codingcontract.attempt(profit, cct, host);

    // Log the result in case of failure.
    if (is_empty_string(result)) {
        const log = "/quack/cct/trader.txt";
        const data = `[${array.join(",")}]`;
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
