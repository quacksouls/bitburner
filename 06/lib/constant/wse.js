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

// A bunch of constant values related to the World Stock Exchange.

/**
 * Various thresholds related to the market forecast.
 */
export const forecast = {
    // The buying threshold for the market forecast.  We skip buying shares if
    // the forecast is below this threshold.
    "BUY": 0.575,
    // A selling threshold for the market forecast.  We sell all shares of a
    // stock if the forecast is below this threshold.
    "SELL": 0.5,
    // The threshold for the market volatility.  We do not buy shares if the
    // volatility is above this threshold.
    "VOLATILITY": 0.05
};

/**
 * A multiplier for the amount of money we should have in reserve.  When
 * trading on the Stock Market, we should not spend all our money on shares.
 * Instead we should have a fixed amount of money in reserve.  The multiplier
 * is used to calculate how much money we should have before we buy any shares.
 * Let our funds threshold be the reserve multiplier times the amount of money
 * to be held in reserve.  If our current amount of money is greater than the
 * resulting product, then we have sufficient funds.  Increase the value of
 * this constant to hold more money in reserve.
 */
export const reserve_mult = 1.1;

/**
 * The minimum amount of money we are willing to spend to purchase shares of a
 * stock.  This is our spending threshold.  If our money is less than the
 * spending threshold, then do not purchase any shares.
 */
export const spend_tau = 5 * 1e6;

/**
 * The Stock Market updates approximately every 6 seconds.
 */
export const stock_tick = 6000;

/**
 * A file name.  If the trade bot detects the existence of this file on the
 * home server, it would stop purchasing shares of stocks.  The behaviour is
 * subject to certain conditions.  See the trade-bot.js script for more details.
 */
export const trade_bot_stop = "trade_bot_stop_buy.txt";
