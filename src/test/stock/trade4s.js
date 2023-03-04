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
import { wait_t } from "/quack/lib/constant/time.js";
import { forecast, wse } from "/quack/lib/constant/wse.js";
import { log } from "/quack/lib/io.js";
import { Money } from "/quack/lib/money.js";
import { assert } from "/quack/lib/util.js";

/**
 * Purchase shares of the stock most likely to increase in value during the next
 * tick.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {object} The updated portfolio.
 */
function buy_stock(ns, portfolio) {
    if (pause_buy(ns)) {
        return portfolio;
    }
    const sym = most_favourable(ns);
    if (sym === "") {
        return portfolio;
    }
    const nshare = num_shares(ns, sym, portfolio);
    if (nshare < 1) {
        return portfolio;
    }
    const cost_per_share = ns.stock.buyStock(sym, nshare);
    if (cost_per_share === 0) {
        return portfolio;
    }
    const new_portfolio = { ...portfolio };
    new_portfolio[sym].cost = portfolio[sym].cost + nshare * cost_per_share;
    new_portfolio[sym].commission = portfolio[sym].commission + wse.COMMISSION;
    return new_portfolio;
}

/**
 * Choose the stock to sell.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {string} The symbol of the stock to sell.  Empty string if no stocks
 *     should be sold in this tick.
 */
function choose_sell_candidate(ns, portfolio) {
    // All stocks that do not have favourable forecast.  Order them from least
    // favourable to most favourable.
    const has_long = (sym) => num_long(ns, sym) > 0;
    const not_favourable = (sym) => !is_favourable_long(ns, sym);
    const to_int = (n) => Math.floor(1e6 * n);
    const projection = (sym) => to_int(ns.stock.getForecast(sym));
    const ascending = (syma, symb) => projection(syma) - projection(symb);
    const stock = ns.stock.getSymbols().filter(has_long).filter(not_favourable);
    stock.sort(ascending);

    // Choose a stock to sell provided we can make a profit.
    const can_profit = (sym) => sell_profit(ns, sym, portfolio) > 0;
    const candidate = stock.filter(can_profit);
    return candidate.length === 0 ? "" : candidate[0];
}

/**
 * The amount of money we can use to purchase shares of a stock.  This takes
 * into account the money that should be held in reserve.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} portfolio Our stock portfolio.
 * @returns {number} The funds for buying shares.
 */
function expenditure(ns, portfolio) {
    const excess_money = money(ns) - portfolio.reserve;
    return Math.floor(wse.reserve.BUY_MULT * excess_money);
}

/**
 * Whether we have enough money to be held in reserve.  Must have at least a
 * certain amount of money before we start dabbling on the Stock Market.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} portfolio Our portfolio of stocks.
 * @return {boolean} True if we have sufficient money to be held in reserve;
 *     false otherwise.
 */
function has_money_reserve(ns, portfolio) {
    return money(ns) > portfolio.reserve;
}

/**
 * The default portfolio of stocks.
 *
 * @param {NS} ns The Netscript API.
 * @returns {object} An object representing the initial portfolio of stocks.
 *     The object is structured as follows:
 *     {
 *         reserve: number, // The amount of money to be held in reserve.
 *         symbol1: {
 *             cost: number, // Total cost of purchasing all shares we own.
 *             commission: number, // Total commission paid for all purchases.
 *         },
 *         ...
 *     }
 */
function initial_portfolio(ns) {
    const portfolio = {
        /**
         * The initial amount of money to be held in reserve.  Will increase as
         * we make a profit from selling shares of a stock.
         */
        reserve: wse.reserve.AMOUNT,
    };
    ns.stock.getSymbols().forEach((sym) => {
        portfolio[sym] = {
            cost: 0,
            commission: 0,
        };
    });
    return portfolio;
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
 * The amount of money the player has.
 *
 * @param {NS} ns The Netscript API.
 * @returns {number} Our current amount of money.
 */
function money(ns) {
    return ns.getServerMoneyAvailable(home);
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
 * @param {object} portfolio Our portfolio of stocks.
 * @return {number} The number of shares of this stock we can buy.  Must be at
 *     least zero.  If 0, then we cannot buy any shares of the given stock.
 */
function num_shares(ns, sym, portfolio) {
    // Sanity checks.
    if (!has_money_reserve(ns, portfolio)) {
        return 0;
    }
    const funds = expenditure(ns, portfolio);
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
 * The amount of profit to add to our reserve.  The rest can be used to purchase
 * shares of stocks.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} portfolio Our portfolio of stocks.
 * @param {number} profit The profit from selling shares of a stock.
 * @returns {Promise<number>} How much of the profit to keep.
 */
async function profit_to_keep(ns, portfolio, profit) {
    const new_money = money(ns) + profit;

    // Given the fraction of the profit we should keep in reserve, do we have
    // enough funds to purchase shares of a stock?
    const has_funds = (keep_amount) => {
        const new_resrve = portfolio.reserve + keep_amount;
        const excess_money = new_money - new_resrve;
        const funds = Math.floor(wse.reserve.BUY_MULT * excess_money);
        return funds >= wse.SPEND_TAU;
    };

    // Determine how much of the profit we can keep.
    let keep_mult = wse.reserve.MAX_KEEP_MULT;
    let keep = Math.floor(keep_mult * profit);
    while (!has_funds(keep)) {
        keep_mult -= wse.reserve.KEEP_DELTA;
        keep = Math.floor(keep_mult * profit);
        await ns.sleep(wait_t.MILLISECOND);
    }
    assert(keep > 0);
    return keep;
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
function sell_profit(ns, sym, portfolio) {
    const revenue = num_long(ns, sym) * ns.stock.getBidPrice(sym);
    const total_commission = wse.COMMISSION + portfolio[sym].commission;
    return revenue - total_commission - portfolio[sym].cost;
}

/**
 * Sell shares of a stock that is most likely to decrease in value during the
 * next tick.  Only sell if doing so would earn us a profit.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {object} The updated portfolio.
 */
async function sell_stock(ns, portfolio) {
    const sym = choose_sell_candidate(ns, portfolio);
    if (sym === "") {
        return portfolio;
    }
    const profit = sell_profit(ns, sym, portfolio);
    const result = ns.stock.sellStock(sym, num_long(ns, sym));
    assert(result !== 0);
    const keep = await profit_to_keep(ns, portfolio, profit);
    const new_portfolio = { ...portfolio };
    new_portfolio.reserve += keep;
    new_portfolio[sym].cost = 0;
    new_portfolio[sym].commission = 0;
    log(ns, `Sold all shares of ${sym} for ${Money.format(profit)} in profit`);
    return new_portfolio;
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
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {object} The updated portfolio.
 */
async function transaction(ns, portfolio) {
    const new_portfolio = await sell_stock(ns, portfolio);
    return buy_stock(ns, new_portfolio);
}

/**
 * Automate our trading on the World Stock Exchange.  This is our trade bot.
 *
 * Usage: run quack/test/stock/trade4s.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    // Continuously trade on the Stock Market.
    log(ns, "Trading on the Stock Market");
    let portfolio = initial_portfolio(ns);
    for (;;) {
        portfolio = await transaction(ns, portfolio);
        await ns.sleep(wse.TICK);
    }
}
