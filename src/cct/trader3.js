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
    print_error,
    print_success,
    stock_traderIII,
} from "/quack/lib/cct.js";
import { is_empty_string } from "/quack/lib/util.js";

/**
 * Algorithmic Stock Trader III: You are given an array of numbers representing
 * stock prices, where the i-th element represents the stock price on day i.
 * Determine the maximum possible profit you can earn using at most two
 * transactions.  A transaction is defined as buying and then selling one share
 * of the stock.  Note that you cannot engage in multiple transactions at once.
 * In other words, you must sell the stock before you buy it again.  If no
 * profit can be made, then the answer should be 0.
 *
 * This is similar to Algorithmic Stock Trader I.  The twist is that we can now
 * make at most two transactions, where previously we were restricted to at
 * most one transaction.
 *
 * Usage: run quack/cct/trader3.js [cct] [hostname]
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const [cct, host] = ns.args;

    // Solve the coding contract.
    const array = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(stock_traderIII(array), cct, host);

    // Log the result in case of failure.
    if (is_empty_string(result)) {
        const log = "/quack/cct/trader3.txt";
        const data = `[${array.join(",")}]`;
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
