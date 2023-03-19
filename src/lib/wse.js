/**
 * Copyright (C) 2023 Duck McSouls
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
// Miscellaneous helper functions for the Stock Market.
/// ///////////////////////////////////////////////////////////////////////

import { io } from "/quack/lib/constant/io.js";
import { home } from "/quack/lib/constant/server.js";
import { wse } from "/quack/lib/constant/wse.js";

/**
 * Whether we have enough money to be held in reserve.  Must have at least a
 * certain amount of money before we start dabbling on the Stock Market.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} portfolio Our portfolio of stocks.
 * @return {boolean} True if we have sufficient money to be held in reserve;
 *     false otherwise.
 */
export function has_money_reserve(ns, portfolio) {
    return ns.getServerMoneyAvailable(home) > portfolio.reserve;
}

/**
 * The number of shares we own in the Long position.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} sym A stock symbol.
 * @returns {number} How many shares we have of the given stock in the Long
 *     position.
 */
export function num_long(ns, sym) {
    return ns.stock.getPosition(sym)[wse.LONG_INDEX];
}

/**
 * The profit we make from selling all shares of a stock.  This takes into
 * account the total cost we have paid for shares of the stock, as well as the
 * total commission we have paid and will pay for the sell transaction.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} sym We want to sell all shares of this stock.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {number} The profit from selling all shares of the given stock.
 */
export function sell_profit(ns, sym, portfolio) {
    const revenue = num_long(ns, sym) * ns.stock.getBidPrice(sym);
    const total_commission = wse.COMMISSION + portfolio[sym].commission;
    return revenue - total_commission - portfolio[sym].cost;
}

/**
 * Sell all shares of all stocks we own.
 *
 * @param {NS} ns The Netscript API.
 */
export function trade_bot_liquidate(ns) {
    const fname = wse.LIQUIDATE;
    const data = "Trade bot liquidate.";
    ns.write(fname, data, io.WRITE);
}

/**
 * Tell the trade bot to resume its transactions.  It can now buy and sell
 * shares of stocks.
 *
 * @param {NS} ns The Netscript API.
 */
export function trade_bot_resume(ns) {
    if (ns.fileExists(wse.STOP_BUY, home)) {
        ns.rm(wse.STOP_BUY, home);
    }
}

/**
 * Tell the trade bot to stop buying shares of stocks.  We do not want to spend
 * any more money on buying shares.  However, the trade bot can sell shares.
 * The idea is to cash in on the shares we have.
 *
 * @param {NS} ns The Netscript API.
 */
export async function trade_bot_stop_buy(ns) {
    const fname = wse.STOP_BUY;
    const data = "Trade bot stop buy.";
    await ns.write(fname, data, io.WRITE);
}
