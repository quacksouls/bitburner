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
 * Tell the trade bot to resume its transactions.  It can now buy and sell
 * shares of stocks.
 *
 * @param ns The Netscript API.
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
 * @param ns The Netscript API.
 */
export async function trade_bot_stop_buy(ns) {
    const fname = wse.STOP_BUY;
    const data = "Trade bot stop buy.";
    await ns.write(fname, data, io.WRITE);
}
