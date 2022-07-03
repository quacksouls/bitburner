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

import { assert, Money, Player, Time } from "/libbnr.js";

/**
 * Purchase shares of a stock.
 *
 * @param ns The Netscript API.
 * @param stk We want to purchase shares of this stock.
 */
function buy_stock(ns, stk) {
    // Do we skip buying shares of this stock?
    if (skip_stock(ns, stk)) {
        return;
    }
    // Try a given number of times to buy shares of a stock.  Each time we
    // fail to purchase shares of a stock, we reduce by 10% the number of
    // stocks we want to buy and purchase only 90% of the previous number.
    let nshare = num_shares(ns, stk);
    assert(nshare > 0);
    const ntry = 10;
    const reduction_rate = 0.9;
    for (let i = 0; i < ntry; i++) {
        const result = ns.stock.buy(stk, nshare);
        // We have successfully bought some shares of a stock.
        if (result > 0) {
            break;
        }
        // Can't buy the given number of shares of a stock.  Reduce
        // the number of shares by 10% and try again.
        nshare = Math.floor(nshare * reduction_rate);
    }
}

/**
 * Whether we have sufficient funds for puchasing stocks.  This function
 * takes into account the minimum amount of money that should be held in
 * reserve whenever we trade on the Stock Market.
 *
 * @param ns The Netscript API.
 * @return true if we have enough money to buy stocks; false otherwise.
 */
function has_funds(ns) {
    const player = new Player(ns);
    const multiplier = 10;
    if (player.money() <= multiplier * money_reserve()) {
        return false;
    }
    return true;
}

/**
 * Whether it is profitable to sell all shares of a given stock.
 *
 * @param ns The Netscript API.
 * @param stk Is there any profit in selling all shares of this stock?
 * @return true if we can make a profit by selling all our shares of this
 *     stock; false otherwise.
 */
function is_profitable(ns, stk) {
    const position = ns.stock.getPosition(stk);
    const long = position[0];
    // Assume we have at least 1 share of the stock.
    assert(long > 0);
    if (ns.stock.getSaleGain(stk, long, "Long") > 0) {
        return true;
    }
    return false;
}

/**
 * Whether we meet the money threshold.  Must have at least a certain amount
 * of money before we start dabbling on the Stock Market.
 *
 * @param ns The Netscript API.
 * @return true if our funds is at least the money threshold; false otherwise.
 */
function meet_money_threshold(ns) {
    const player = new Player(ns);
    if (player.money() < money_reserve()) {
        return false;
    }
    return true;
}

/**
 * The minimum amount of money we should always have in reserve.  Whenever we
 * trade on the Stock Market, we don't want to spend all our money on buying
 * stocks.  Have at least some money lying around for various purposes, e.g.
 * purchase/upgrade servers and purchase/upgrade Hacknet nodes.
 *
 * @return The minimum amount of money to be held in reserve.
 */
function money_reserve() {
    const money = new Money();
    return 100 * money.billion()
}

/**
 * How many shares of a stock we can purchase.
 *
 * @param ns The Netscript API.
 * @param stk We want to buy shares of this stock.
 * @return The number of shares of this stock that we can buy.  Must be at
 *     least zero.  If 0, then we can't buy any shares of the given stock.
 */
function num_shares(ns, stk) {
    // We don't have enough money to buy stocks.
    if (!has_funds(ns)) {
        return 0;
    }
    // The amount of money we are willing to spend to purchase shares of a
    // stock.  If the amount is less than the spending threshold, then do not
    // purchase any shares.
    const player = new Player(ns);
    const money = new Money();
    const spend_ratio = 0.01;
    const spend_threshold = 10 * money.billion();
    const funds = (player.money() - money_reserve()) * spend_ratio;
    if (funds < spend_threshold) {
        return 0;
    }
    // Calculate how many shares of the stock we can buy.
    const price = ns.stock.getAskPrice(stk);
    const nshare = Math.floor(funds / price);
    const max_shares = ns.stock.getMaxShares(stk);
    return Math.min(nshare, max_shares);
}

/**
 * Purchase access to market data and APIs.
 *
 * @param ns The Netscript API.
 */
function purchase_api_access(ns) {
    assert(meet_money_threshold(ns));
    assert(ns.stock.purchaseWseAccount());
    assert(ns.stock.purchaseTixApi());
    assert(ns.stock.purchase4SMarketData());
    assert(ns.stock.purchase4SMarketDataTixApi());
}

/**
 * Sell shares of a stock.
 *
 * @param ns The Netscript API.
 * @param stk We want to sell shares of this stock.
 */
function sell_stock(ns, stk) {
    const position = ns.stock.getPosition(stk);
    const long = position[0];
    // Skip the stock if we don't have any shares of the stock.
    if (long < 1) {
        return;
    }
    // Sell all shares of the stock if the forecast is below the threshold.
    const threshold = 0.5;
    const forecast = ns.stock.getForecast(stk);
    if (forecast < threshold) {
        if (is_profitable(ns, stk)) {
            ns.stock.sell(stk, long);
        }
    }
}

/**
 * Whether to skip buying shares of a stock.
 *
 * @param ns The Netscript API.
 * @param stk Do we want to skip over this stock?
 * @return true if we are to skip this stock; false otherwise.
 */
function skip_stock(ns, stk) {
    const SKIP = true;
    const NO_SKIP = !SKIP;
    const forecast_threshold = 0.575;
    const volatility_threshold = 0.05;
    // Skip if there is a low chance of increase in the next tick.
    if (ns.stock.getForecast(stk) < forecast_threshold) {
        return SKIP;
    }
    // Skip if the stock is too volatile.
    if (ns.stock.getVolatility(stk) > volatility_threshold) {
        return SKIP;
    }
    // Skip if we cannot afford to purchase any shares of the stock.
    const nshare = num_shares(ns, stk);
    if (nshare < 1) {
        return SKIP;
    }
    return NO_SKIP;
}

/**
 * Automate our trading on the World Stock Exchange.  This is our trade bot.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    ns.disableLog("sleep");
    ns.disableLog("getServerMoneyAvailable");
    // Wait until we have enough money before purchasing the various APIs
    // and data access.
    // Wait for 6 seconds because the Stock Market updates approximately
    // every 6 seconds.
    const time = new Time();
    const t = 6 * time.second();
    while (!meet_money_threshold(ns)) {
        await ns.sleep(t);
    }
    purchase_api_access(ns);
    // Wait until we have a large amount of money before trading on the Stock
    // Market.  Gambling on the Stock Market requires huge wealth.
    while (!meet_money_threshold(ns)) {
        await ns.sleep(t);
    }
    // Continuously trade on the Stock Market.
    while (true) {
        // Iterate over each stock.  Decide whether to buy or sell.
        for (const stk of ns.stock.getSymbols()) {
            sell_stock(ns, stk);
            buy_stock(ns, stk);
        }
        await ns.sleep(t);
    }
}
