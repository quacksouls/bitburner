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

import { MyArray } from "/quack/lib/array.js";
import { hgw } from "/quack/lib/constant/hgw.js";
import { empty_string } from "/quack/lib/constant/misc.js";
import { wse } from "/quack/lib/constant/wse.js";
import { hgw_action, nuke_servers } from "/quack/lib/hgw.js";
import { log } from "/quack/lib/io.js";
import { assert, is_empty_string, is_undefined } from "/quack/lib/util.js";
import { num_long, num_short } from "/quack/lib/wse.js";

/**
 * Determine the best stock to manipulate based on the maximum profit obtained
 * when sold in a given position.  Exclude the stock of Watchdog Security
 * because it does not have a server for us to hack/grow.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} position The position we want.  Either "Long" or "Short".
 * @returns {array} An array [sym, profit] as follows:
 *     (1) sym := The best stock in the given position.  Empty string if we do
 *         not own shares of any stock in the given position.
 *     (2) profit := The profit from selling all shares of the stock in the
 *         given position.  Zero if sym is empty string.
 */
function choose_best_stock(ns, position) {
    const nshare = (sym) => {
        if (position === wse.position.LONG) {
            return num_long(ns, sym);
        }
        return num_short(ns, sym);
    };
    const has_shares = (sym) => nshare(sym) > 0;
    const profit = (sym) => ns.stock.getSaleGain(sym, nshare(sym), position);
    const best_stock = (acc, curr) => (profit(acc) < profit(curr) ? curr : acc);
    const not_watchdog = (sym) => sym !== wse.stock.WDS.name;
    const stock = ns.stock.getSymbols().filter(not_watchdog).filter(has_shares);
    const empty = [empty_string, 0];
    if (MyArray.is_empty(stock)) {
        return empty;
    }
    const sym = stock.reduce(best_stock);
    return is_empty_string(sym) ? empty : [sym, profit(sym)];
}

/**
 * Determine which stock to manipulate.
 *
 * @param {NS} ns The Netscript API.
 * @returns {string} The symbol of the stock to manipulate.  Empty string if we
 *     do not own shares of any stock.
 */
function choose_stock(ns) {
    const [sym_L, profit_L] = choose_best_stock(ns, wse.position.LONG);
    const [sym_S, profit_S] = choose_best_stock(ns, wse.position.SHORT);
    if (is_empty_string(sym_L) && is_empty_string(sym_S)) {
        return empty_string;
    }
    if (!is_empty_string(sym_L) && !is_empty_string(sym_S)) {
        return profit_L < profit_S ? sym_S : sym_L;
    }
    if (is_empty_string(sym_L)) {
        assert(!is_empty_string(sym_S));
        return sym_S;
    }
    if (is_empty_string(sym_S)) {
        assert(!is_empty_string(sym_L));
        return sym_L;
    }
}

/**
 * The server to hack/grow in order to manipulate the price of a stock.
 *
 * @param {string} sym The server corresponding to this stock symbol.
 * @returns {string} Hostname of a server.  Empty string if we do not own shares
 *     of any stock.
 */
function get_server(sym) {
    return is_empty_string(sym) ? empty_string : wse.stock[sym].server;
}

/**
 * Manipulate the price of a stock.
 *
 * @param {NS} ns The Netscript API.
 */
async function manipulate(ns) {
    const sym = choose_stock(ns);
    if (is_empty_string(sym) || is_undefined(sym)) {
        return;
    }

    const host = get_server(sym);
    const forecast = Number(JSON.parse(ns.read(wse.FORECAST))[sym]);
    if (forecast < wse.HACK_TAU) {
        await hgw_action(ns, host, nuke_servers(ns), hgw.action.HACK);
    } else if (forecast > wse.GROW_TAU) {
        await hgw_action(ns, host, nuke_servers(ns), hgw.action.GROW);
    }
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("sleep");
}

/**
 * Pool the resources of world servers to manipulate the price of a stock.
 * Exclude our home server and purchased servers.
 *
 * Usage: run quack/stock/tinker.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    log(ns, "Attempt to manipulate prices of stocks");
    for (;;) {
        await manipulate(ns);
        await ns.sleep(wse.TICK);
    }
}
