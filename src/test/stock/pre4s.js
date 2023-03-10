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

import { wait_t } from "/quack/lib/constant/time.js";
import { forecast, wse } from "/quack/lib/constant/wse.js";
import { log } from "/quack/lib/io.js";
import { Money, money } from "/quack/lib/money.js";
import { assert } from "/quack/lib/util.js";

/**
 * Purchase shares of the stock most likely to increase in value during the next
 * tick.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} sym We want to buy shares of this stock.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {object} The updated portfolio.
 */
function buy_stock(ns, sym, portfolio) {
    if (!can_buy(ns, sym, portfolio)) {
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
 * Whether we can buy shares of a stock.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} sym We want to buy shares of this stock.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {boolean} True if we can buy some shares of this stock;
 *     false otherwise.
 */
function can_buy(ns, sym, portfolio) {
    const has_no_shares = (symb) => num_long(ns, symb) <= 0;
    const has_funds = () => expenditure(ns, portfolio) >= wse.SPEND_TAU;
    // eslint-disable-next-line
    const will_increase = (symb) => portfolio[symb].forecast === forecast.INCREASE;
    return has_no_shares(sym) && has_funds() && will_increase(sym);
}

/**
 * Whether we can sell all shares of a stock.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} sym We want to sell all shares of this stock.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {boolean} True if we can sell all shares of this stock;
 *     false otherwise.
 */
function can_sell(ns, sym, portfolio) {
    const has_shares = (symb) => num_long(ns, symb) > 0;
    const can_profit = (symb) => sell_profit(ns, symb, portfolio) > 0;
    // eslint-disable-next-line
    const will_decrease = (symb) => portfolio[symb].forecast === forecast.DECREASE;
    return has_shares(sym) && can_profit(sym) && will_decrease(sym);
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
    return money(ns) - portfolio.reserve - wse.COMMISSION;
}

/**
 * Forecast whether the price of a stock is expected to increase, decrease, or
 * remain unchanged in the next tick.  The forecast technique is due to Reddit
 * user u/peter_lang, from the post archived at
 *
 * https://web.archive.org/web/20230310033159/https://www.reddit.com/r/Bitburner/comments/rsqffz/bitnode_8_stockmarket_algo_trader_script_without/
 *
 * @param {object} portfolio Our portfolio of stocks.
 * @param {string} sym We want to forecast this stock.
 * @returns {number} A number indicating whether the given stock is expected to
 *    increase, decrease, or remain neutral.
 */
function get_forecast(portfolio, sym) {
    const sum = (array, k) => {
        const subarray = array.slice(0, k + 1);
        const add = (accumulator, elem) => accumulator + elem;
        return subarray.reduce(add, 0);
    };
    const binary = portfolio[sym].history.map(to_binary);
    for (let i = forecast.MIN_HISTORY; i < binary.length; i++) {
        const s = sum(binary, i);
        if (s >= i + 1) {
            return forecast.INCREASE;
        }
        if (s === 0) {
            return forecast.DECREASE;
        }
    }
    return forecast.NEUTRAL;
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
 * @returns {Promise<object>} An object representing the initial portfolio of
 *     stocks.  The object is structured as follows:
 *     {
 *         prev_price: number, // The previous price of the canary stock.
 *         reserve: number, // The amount of money to be held in reserve.
 *         symbol1: {
 *             cost: number, // Total cost of purchasing all shares we own.
 *             commission: number, // Total commission paid for all purchases.
 *             forecast: number, // The forecast of the price of the stock.
 *             history: array<number>, // History of price changes.  Latest
 *                                     // value at front of array.
 *             prev_price: number, // The previous price of the stock.
 *         },
 *         ...
 *     }
 */
async function initial_portfolio(ns) {
    const portfolio = {
        /**
         * The previous price of the canary stock.  The canary stock helps us to
         * figure out whether prices in the Stock Market have changed.
         */
        prev_price: 0,
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
            forecast: 0,
            history: [],
            prev_price: 0,
        };
    });
    return populate_history(ns, portfolio);
}

/**
 * Whether the price of each stock has changed.  We use the change in price to
 * help us figure out whether the Stock Market has updated.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {boolean} True if the prices of stocks have changed;
 *     false otherwise.
 */
function is_price_changed(ns, portfolio) {
    return portfolio.prev_price !== ns.stock.getPrice(wse.CANARY);
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

    // How many shares of the stock we can buy.
    const funds = expenditure(ns, portfolio);
    const nshare = Math.floor(funds / ns.stock.getAskPrice(sym));
    const max_share = ns.stock.getMaxShares(sym);
    return Math.min(nshare, wse.NUM_SHARES, max_share);
}

/**
 * The initial price history of each stock.  We need a sample of the recent
 * price changes of each stock.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {Promise<object>} The same portfolio, but with a sample of the
 *     recent price changes of each stock.
 */
async function populate_history(ns, portfolio) {
    // The initial price of each stock.
    let new_portfolio = { ...portfolio };
    ns.stock.getSymbols().forEach((sym) => {
        new_portfolio[sym].prev_price = ns.stock.getPrice(sym);
    });
    new_portfolio = update_canary_price(ns, new_portfolio);

    // A sample of the price changes.
    let i = 0;
    while (i < wse.SAMPLE_LENGTH) {
        if (is_price_changed(ns, new_portfolio)) {
            new_portfolio = update_history(ns, new_portfolio);
            new_portfolio = update_canary_price(ns, new_portfolio);
            i++;
        }
        await ns.sleep(wse.TICK_PRE4S);
    }
    return new_portfolio;
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
        const funds = new_money - new_resrve - wse.COMMISSION;
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
 * @param {string} sym We want to sell all shares of this stock.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {Promise<object>} The updated portfolio.
 */
async function sell_stock(ns, sym, portfolio) {
    if (!can_sell(ns, sym, portfolio)) {
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
 * Rate a stock based on its history of price changes.  The weighting technique
 * is due to Reddit user u/peter_lang, from the post archived at
 *
 * https://web.archive.org/web/20230310033159/https://www.reddit.com/r/Bitburner/comments/rsqffz/bitnode_8_stockmarket_algo_trader_script_without/
 *
 * @param {string} sym We want to calculate the weight of this stock.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {number} The weight of the given stock.
 */
function stock_weight(sym, portfolio) {
    const binary = portfolio[sym].history.map(to_binary);
    const num_one = binary.reduce((cumsum, elem) => cumsum + elem, 0);
    return Math.abs(binary.length - 2 * num_one);
}

/**
 * Convert the ratio of a price change to binary representation.
 *
 * @param {number} ratio The ratio of price change.
 * @returns {number} The binary representation of the given ratio.
 */
function to_binary(ratio) {
    return ratio > 1 ? 1 : 0;
}

/**
 * Sell or buy shares of stocks.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {Promise<object>} The updated portfolio.
 */
async function transaction(ns, portfolio) {
    // Sort the stocks in descending order of weight.  The stock of highest
    // priority is first, followed by the second highest priority, etc.
    const weight = (sym) => stock_weight(sym, portfolio);
    const descending = (syma, symb) => weight(symb) - weight(syma);
    const stock = ns.stock.getSymbols();
    stock.sort(descending);

    let new_portfolio = { ...portfolio };
    for (const sym of stock) {
        new_portfolio = await sell_stock(ns, sym, new_portfolio);
        new_portfolio = buy_stock(ns, sym, new_portfolio);
    }
    return new_portfolio;
}

/**
 * Update the price of the canary stock.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {object} The same portfolio, but the price of the canary stock is
 *     updated.
 */
function update_canary_price(ns, portfolio) {
    const new_portfolio = { ...portfolio };
    new_portfolio.prev_price = ns.stock.getPrice(wse.CANARY);
    return new_portfolio;
}

/**
 * Update the history of price changes of stocks.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {object} The same portfolio, but with the latest change in price.
 */
function update_history(ns, portfolio) {
    const new_portfolio = { ...portfolio };
    for (const sym of ns.stock.getSymbols()) {
        const current_price = ns.stock.getPrice(sym);
        const ratio = current_price / new_portfolio[sym].prev_price;
        // The latest ratio is always at the front of the array.  The
        // previous ratio is now at index 1 of the array, etc.  The
        // oldest ratio is at the end of the array.
        new_portfolio[sym].history.unshift(ratio);
        if (new_portfolio[sym].history.length > wse.SAMPLE_LENGTH) {
            new_portfolio[sym].history.pop();
        }
        new_portfolio[sym].prev_price = current_price;
    }
    return new_portfolio;
}

/**
 * Forecast whether the price of each stock is expected to increase, decrease,
 * or remain unchanged in the next tick.
 *
 * @param {NS} ns The Netscript API.
 * @param {object} portfolio Our portfolio of stocks.
 * @returns {object} The same portfolio, but with a forecast for each stock.
 */
function update_forecast(ns, portfolio) {
    const new_portfolio = { ...portfolio };
    ns.stock.getSymbols().forEach((sym) => {
        new_portfolio[sym].forecast = get_forecast(new_portfolio, sym);
    });
    return new_portfolio;
}

/**
 * A Stock Market script that does not have access to 4S data and API.  We have
 * an account at the World Stock Exchange and access to the Trade Information
 * eXchange (TIX) API.
 *
 * Usage: run quack/test/stock/pre4s.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    // Continuously trade on the Stock Market.
    log(ns, "Trading on the Stock Market, pre-4S");
    let portfolio = await initial_portfolio(ns);
    for (;;) {
        if (is_price_changed(ns, portfolio)) {
            portfolio = update_history(ns, portfolio);
            portfolio = update_forecast(ns, portfolio);
            portfolio = await transaction(ns, portfolio);
        }
        await ns.sleep(wse.TICK_PRE4S);
    }
}
