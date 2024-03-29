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

import { bool } from "/quack/lib/constant/bool.js";
import { home } from "/quack/lib/constant/server.js";
import { wse } from "/quack/lib/constant/wse.js";
import { log } from "/quack/lib/io.js";
import { Money } from "/quack/lib/money.js";
import { MyNumber } from "/quack/lib/number.js";
import { assert } from "/quack/lib/util.js";
import {
    can_short,
    initial_portfolio,
    num_long,
    num_short,
    transaction,
} from "/quack/lib/wse.js";

/**
 * Whether to sell all shares of all stocks we own.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we are to liquidate all stocks; false otherwise.
 */
function is_liquidate(ns) {
    return ns.fileExists(wse.LIQUIDATE, home);
}

/**
 * Sell all shares of all stocks we own.
 *
 * @param {NS} ns The Netscript API.
 */
function liquidate_all(ns) {
    const has_long = (sym) => num_long(ns, sym) > 0;
    const has_short = (sym) => num_short(ns, sym) > 0;
    const sell_all = (sym, pos) => {
        let nshare = 0;
        let price_per_share = 0;
        if (pos === "Long") {
            nshare = num_long(ns, sym);
            price_per_share = ns.stock.sellStock(sym, nshare);
        } else {
            nshare = num_short(ns, sym);
            price_per_share = ns.stock.sellShort(sym, nshare);
        }
        assert(price_per_share > 0);
        const revenue = price_per_share * nshare;
        const nshare_fmt = MyNumber.format(nshare);
        const prefix = `Sold ${nshare_fmt} share(s) of ${sym} (${pos})`;
        const suffix = `for ${Money.format(revenue)} in revenue`;
        log(ns, `${prefix} ${suffix}`);
    };
    const sell_long = (sym) => sell_all(sym, "Long");
    const sell_short = (sym) => sell_all(sym, "Short");
    ns.stock.getSymbols().filter(has_long).forEach(sell_long);
    ns.stock.getSymbols().filter(has_short).forEach(sell_short);
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
}

/**
 * WARNING: Requires access to all Stock Market APIs and data.
 *
 * Automate our trading on the World Stock Exchange.  This is our trade bot.
 *
 * Usage: run quack/stock/trade.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);

    // Continuously trade on the Stock Market.
    const allow_short = can_short(ns);
    log(ns, "Trading on the Stock Market");
    let portfolio = await initial_portfolio(ns, bool.HAS_4S);
    for (;;) {
        if (is_liquidate(ns)) {
            liquidate_all(ns);
            return;
        }
        portfolio = await transaction(ns, portfolio, bool.HAS_4S, allow_short);
        await ns.sleep(wse.TICK);
    }
}
