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

// A bunch of constant values related to the World Stock Exchange.

/**
 * Various thresholds related to the market forecast.
 */
export const forecast = {
    /**
     * A threshold to help us decide whether to buy shares of a stock.  If the
     * forecast is above this threshold, we should buy shares of the stock.
     */
    BUY_TAU: 0.525,
    /**
     * This indicates that the value of a stock has decreased.
     */
    DECREASE: 0,
    /**
     * This indicates that the value of a stock has increased.
     */
    INCREASE: 1,
    /**
     * A threshold to help us decide whether to sell shares of a stock.  If the
     * forecast of a stock exceeds this threshold, then we should hold on to
     * shares of the stock.  On the other hand, if the forecast is at most this
     * threshold, we should sell shares of the stock.
     */
    SELL_TAU: 0.5,
    /**
     * The threshold for the market volatility.  We do not buy shares if the
     * volatility is above this threshold.
     */
    VOLATILITY: 0.05,
};

/**
 * Miscellaneous constants.
 */
export const wse = {
    /**
     * The stock used to determine whether a change in price has occurred.
     */
    CANARY: "FSIG",
    /**
     * The amount of money paid in commission for each market transaction.
     */
    COMMISSION: 100e3,
    /**
     * The index in the array returned by ns.stock.getPosition() where we find
     * the number of shares we own in the Long position.
     */
    LONG_INDEX: 0,
    /**
     * Various constants related to the amount of money to be held in reserve.
     */
    reserve: {
        /**
         * The initial amount of money to be held in reserve.  Will increase as
         * we make a profit from selling shares of a stock.
         */
        AMOUNT: 0,
        /**
         * Spend this fraction of money to buy shares.  Our funds is defined as
         *
         * funds = current money - reserve money
         *
         * We want to spend (MULT * funds) to purchase shares.
         */
        BUY_MULT: 0.025,
        /**
         * Lower the keep fraction by this amount.
         */
        KEEP_DELTA: 0.01,
        /**
         * The maximum fraction of profit to add to our reserve.  If we cannot
         * add this fraction of the profit to our reserve, we lower the keep
         * fraction by KEEP_DELTA.
         */
        MAX_KEEP_MULT: 0.1,
    },
    /**
     * The number of samples of price changes in a stock.  Always keep this many
     * recent samples.
     */
    SAMPLE_LENGTH: 30,
    /**
     * The minimum amount of money we are willing to spend to purchase shares
     * of a stock.  This is our spending threshold.
     */
    SPEND_TAU: 5e6,
    /**
     * The Stock Market updates approximately every 6 seconds.
     */
    TICK: 6e3,
    /**
     * Sleep this many milliseonds if we do not have access to 4S data and API.
     */
    TICK_PRE4S: 2e3,
    /**
     * Index of the current value in the history array.
     */
    TODAY: 0,
    /**
     * Index of the previous value in the history array.
     */
    YESTERDAY: 1,
    /**
     * A file name.  If the trade bot detects the existence of this file on the
     * home server, it would stop purchasing shares of stocks.  The behaviour
     * is subject to certain conditions.  See the trade-bot.js script for more
     * details.
     */
    STOP_BUY: "/quack/trade_bot_stop_buy.txt",
};
