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

import { home } from "/quack/lib/constant/server.js";
import { forecast, wse } from "/quack/lib/constant/wse.js";
import { log } from "/quack/lib/io.js";

/**
 * Purchase shares of the stock most likely to increase in value during the next
 * tick.
 *
 * @param {NS} ns The Netscript API.
 */
function buy_stock(ns) {
    if (pause_buy(ns)) {
        return;
    }
    const sym = most_favourable(ns);
    if (sym === "") {
        return;
    }
    const nshare = num_shares(ns, sym);
    if (nshare < 1) {
        return;
    }
    ns.stock.buyStock(sym, nshare);
}

/**
 * Whether we have enough money to be held in reserve.  Must have at least a
 * certain amount of money before we start dabbling on the Stock Market.
 *
 * @param {NS} ns The Netscript API.
 * @return {boolean} True if we have sufficient money to be held in reserve;
 *     false otherwise.
 */
function has_money_reserve(ns) {
    return ns.getServerMoneyAvailable(home) > wse.reserve.MONEY;
}

/**
 * Whether the forecast is favourable for the Long position of a stock.  If the
 * forecast for a stock exceeds a given threshold, then the value of the stock
 * is expected to increase in the next tick (or cycle) of the Stock Market.  In
 * this case, we say that the forecast is favourable for the Long position.
 * However, if the forecast for the stock is at most the threshold, then the
 * value of the stock is expected to decrease in the next tick.  Hence the
 * forecast is unfavourable for the Long position.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} sym The symbol of a stock.
 * @returns {boolean} True if the forecast is favourable for the given stock in
 *     the Long position; false otherwise.
 */
function is_favourable_long(ns, sym) {
    return ns.stock.getForecast(sym) > forecast.SELL_TAU;
}

/**
 * The stock most likely to decrease in value during the next tick.  Only
 * consider the Long position.
 *
 * @param {NS} ns The Netscript API.
 * @returns {string} The symbol of a stock that is forecasted to have the least
 *     chance of increase in the next tick.  Empty string if we are unable to
 *     sell shares.
 */
function least_favourable(ns) {
    const has_long = (sym) => num_long(ns, sym) > 0;
    const not_favourable = (sym) => !is_favourable_long(ns, sym);
    const to_int = (n) => Math.floor(1e6 * n);
    const projection = (sym) => to_int(ns.stock.getForecast(sym));
    const ascending = (syma, symb) => projection(syma) - projection(symb);
    const stock = ns.stock.getSymbols().filter(has_long).filter(not_favourable);
    stock.sort(ascending);
    return stock.length === 0 ? "" : stock[0];
}

/**
 * The stock most likely to increase in value during the next tick.
 *
 * @param {NS} ns The Netscript API.
 * @returns {string} The symbol of a stock that is forecasted to have the best
 *     chance of increase in the next tick.  Empty string if no stocks are
 *     forecasted to increase in value.
 */
function most_favourable(ns) {
    const is_favourable = (sym) => ns.stock.getForecast(sym) > forecast.BUY_TAU;
    const to_int = (n) => Math.floor(1e6 * n);
    const projection = (sym) => to_int(ns.stock.getForecast(sym));
    const descending = (syma, symb) => projection(symb) - projection(syma);
    let stock = ns.stock.getSymbols().filter(is_favourable);
    stock.sort(descending);
    const nshare = (sym) => ns.stock.getMaxShares(sym) - num_long(ns, sym);
    const can_buy = (sym) => nshare(sym) > 0;
    stock = stock.filter(can_buy);
    return stock.length === 0 ? "" : stock[0];
}

/**
 * The number of shares we own in the Long position.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} sym A stock symbol.
 * @returns {number} How many shares we have of the given stock in the Long
 *     position.
 */
function num_long(ns, sym) {
    return ns.stock.getPosition(sym)[wse.LONG_INDEX];
}

/**
 * How many shares of a stock we can purchase.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} sym We want to buy shares of this stock.
 * @return {number} The number of shares of this stock that we can buy.  Must be
 *     at least zero.  If 0, then we cannot buy any shares of the given stock.
 */
function num_shares(ns, sym) {
    // Sanity checks.
    if (!has_money_reserve(ns)) {
        return 0;
    }
    const excess_money = ns.getServerMoneyAvailable(home) - wse.reserve.MONEY;
    const funds = wse.reserve.MULT * excess_money;
    if (funds < wse.SPEND_TAU) {
        return 0;
    }

    // The maximum number of shares of the stock we can buy.  This takes into
    // account the number of shares we already own.
    const max_share = ns.stock.getMaxShares(sym) - num_long(ns, sym);
    if (max_share < 1) {
        return 0;
    }
    // How many more shares of the stock we can buy.
    const nshare = Math.floor(funds / ns.stock.getAskPrice(sym));
    return Math.min(nshare, max_share);
}

/**
 * Whether to skip the purchase of shares.  There are various reasons why we
 * might want to skip the buying of shares, even though we have sufficient
 * funds.  One reason is that we want to sell our shares to raise a huge amount
 * of money for various purposes.
 *
 * @param {NS} ns The Netscript API.
 * @return {boolean} True if we should skip buying shares during this tick;
 *     false otherwise.
 */
function pause_buy(ns) {
    return ns.fileExists(wse.STOP_BUY, home);
}

/**
 * Sell shares of a stock that is most likely to decrease in value during the
 * next tick.
 *
 * @param {NS} ns The Netscript API.
 */
function sell_stock(ns) {
    const sym = least_favourable(ns);
    if (sym === "") {
        return;
    }
    ns.stock.sellStock(sym, num_long(ns, sym));
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("sleep");
    ns.disableLog("getServerMoneyAvailable");
}

/**
 * Sell or buy shares of stocks.
 *
 * @param {NS} ns The Netscript API.
 */
function transaction(ns) {
    sell_stock(ns);
    buy_stock(ns);
}

/**
 * Automate our trading on the World Stock Exchange.  This is our trade bot.
 *
 * Usage: run quack/stock/trade.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    // Continuously trade on the Stock Market.
    log(ns, "Trading on the Stock Market");
    for (;;) {
        transaction(ns);
        await ns.sleep(wse.TICK);
    }
}
