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

import { bool } from "/lib/constant/bool.js";
import { money_reserve } from "/lib/constant/misc.js";
import { pserv } from "/lib/constant/pserv.js";
import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { forecast, wse } from "/lib/constant/wse.js";
import { Player } from "/lib/player.js";
import { assert } from "/lib/util.js";

/**
 * Wait until we have all prerequisites before we do anything related to the
 * dark web.  For now, we wait until the following conditions are met:
 *
 * (1) We have all port opener programs.
 * (2) Have at least a certain amount of money.
 *
 * @param ns The Netscript API.
 */
async function await_prerequisites(ns) {
    // Must acquire all port opener programs.
    const player = new Player(ns);
    while (!player.has_all_port_openers()) {
        await ns.sleep(wait_t.DEFAULT);
    }
    // Our farm of purchased servers must meet certain minimum requirements.
    while (!has_minimum_pserv(ns)) {
        await ns.sleep(wait_t.DEFAULT);
    }
    // Wait until we have a large amount of money before trading on the Stock
    // Market.  Gambling on the Stock Market requires huge wealth.
    while (!meet_money_threshold(ns)) {
        await ns.sleep(wait_t.DEFAULT);
    }
}

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
    // Purchase shares of a stock.
    const nshare = num_shares(ns, stk);
    assert(nshare > 0);
    ns.stock.buyStock(stk, nshare);
}

/**
 * Whether we have access to Stock Market data and APIs.
 *
 * @param ns The Netscript API.
 * @return true if we have access to all Stock Market data and APIs;
 *     false otherwise.
 */
function has_api_access(ns) {
    if (!ns.stock.purchaseWseAccount()) {
        return bool.NOT;
    }
    if (!ns.stock.purchaseTixApi()) {
        return bool.NOT;
    }
    if (!ns.stock.purchase4SMarketData()) {
        return bool.NOT;
    }
    if (!ns.stock.purchase4SMarketDataTixApi()) {
        return bool.NOT;
    }
    return bool.HAS;
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
    return player.money() > wse.RESERVE_MULT * money_reserve;
}

/**
 * Whether we have a minimum running farm of purchased servers.  To meet this
 * condition, our farm must satisfy the following:
 *
 * (1) Each purchased server in the farm must have at least 16,384GB RAM.
 * (2) Our farm must have the maximum number of purchased server.
 *
 * @param ns The Netscript API.
 * @return true if we have a minimum running purchased server farm;
 *     false otherwise.
 */
function has_minimum_pserv(ns) {
    // Do we have the maximum number of purchased servers?
    const player = new Player(ns);
    const pserv_limit = ns.getPurchasedServerLimit();
    if (player.pserv().length < pserv_limit) {
        return bool.NOT;
    }
    // Does each purchased server have at least the given amount of RAM?
    const server = ns.getServer(pserv.PREFIX);
    assert(server.purchasedByPlayer);
    if (server.maxRam < pserv.HIGH_RAM) {
        return bool.NOT;
    }
    return bool.HAS;
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
    const nlong = position[0];
    // Assume we have at least 1 share of the stock.
    assert(nlong > 0);
    return ns.stock.getSaleGain(stk, nlong, "Long") > 0;
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
    return player.money() >= money_reserve;
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
    //
    const player = new Player(ns);
    const funds = player.money() - money_reserve;
    if (funds < wse.SPEND_T) {
        return 0;
    }
    // The maximum number of shares of the stock we can buy.  This takes into
    // account the number of shares we already own.
    const position = ns.stock.getPosition(stk);
    const nlong = position[0];
    const max_share = ns.stock.getMaxShares(stk) - nlong;
    if (max_share < 1) {
        return 0;
    }
    // Calculate how many shares of the stock we can buy.
    const price = ns.stock.getAskPrice(stk);
    const nshare = Math.floor(funds / price);
    return Math.min(nshare, max_share);
}

/**
 * Purchase access to Stock Market data and APIs.
 *
 * @param ns The Netscript API.
 */
async function purchase_api_access(ns) {
    while (!has_api_access(ns)) {
        await ns.sleep(wait_t.DEFAULT);
    }
}

/**
 * Sell shares of a stock.
 *
 * @param ns The Netscript API.
 * @param stk We want to sell shares of this stock.
 */
function sell_stock(ns, stk) {
    const position = ns.stock.getPosition(stk);
    const nlong = position[0];
    // Skip the stock if we don't have any shares of the stock.
    if (nlong < 1) {
        return;
    }
    // Sell all shares of the stock if the forecast is below the threshold.
    if (ns.stock.getForecast(stk) < forecast.SELL) {
        if (is_profitable(ns, stk)) {
            ns.stock.sellStock(stk, nlong);
        }
    }
}

/**
 * Whether to skip the purchase of shares.  There are various reasons why we
 * might want to skip the buying of shares, even though we have sufficient
 * funds.  One reason is that we want to sell our shares to raise a huge amount
 * of money for various purposes.
 *
 * @param ns The Netscript API.
 * @return true if the trade bot should skip buying shares during this tick;
 *     false otherwise.
 */
function skip_buy(ns) {
    return ns.fileExists(wse.STOP_BUY, home);
}

/**
 * Whether to skip buying shares of a stock.
 *
 * @param ns The Netscript API.
 * @param stk Do we want to skip over this stock?
 * @return true if we are to skip this stock; false otherwise.
 */
function skip_stock(ns, stk) {
    // Skip if there is a low chance of increase in the next tick.
    if (ns.stock.getForecast(stk) < forecast.BUY) {
        return bool.SKIP;
    }
    // Skip if the stock is too volatile.
    if (ns.stock.getVolatility(stk) > forecast.VOLATILITY) {
        return bool.SKIP;
    }
    // Skip if we cannot afford to purchase any shares of the stock.
    const nshare = num_shares(ns, stk);
    if (nshare < 1) {
        return bool.SKIP;
    }
    return bool.NO_SKIP;
}

/**
 * Automate our trading on the World Stock Exchange.  This is our trade bot.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("sleep");
    ns.disableLog("getServerMoneyAvailable");
    // Prepare to trade.
    await await_prerequisites(ns);
    await purchase_api_access(ns);
    // Continuously trade on the Stock Market.
    for (;;) {
        // Iterate over each stock.  Decide whether to buy or sell.
        for (const stk of ns.stock.getSymbols()) {
            sell_stock(ns, stk);
            if (!has_minimum_pserv(ns)) {
                continue;
            }
            if (skip_buy(ns)) {
                continue;
            }
            buy_stock(ns, stk);
        }
        await ns.sleep(wse.TICK);
    }
}
