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
 * The Stock Market updates approximately every 6 seconds.
 */
export const stock_tick = 6000;

/**
 * A file name.  If the trade bot detects the existence of this file on the
 * home server, it would stop purchasing shares of stocks.  The behaviour is
 * subject to certain conditions.  See the trade-bot.js script for more details.
 */
export const trade_bot_stop = "trade_bot_stop_buy.txt";