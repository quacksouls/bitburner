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

import { wait_t } from "/quack/lib/constant/time.js";
import { wse } from "/quack/lib/constant/wse.js";
import { log } from "/quack/lib/io.js";
import { money } from "/quack/lib/money.js";
import { Player } from "/quack/lib/player.js";
import { exec } from "/quack/lib/util.js";
import { has_wse_api } from "/quack/lib/wse.js";

/**
 * Whether we meet the money threshold.  Must have at least a certain amount
 * of money before we start dabbling on the Stock Market.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if our funds is at least the money threshold;
 *     false otherwise.
 */
function has_money_threshold(ns) {
    return money(ns) >= wse.reserve.AMOUNT;
}

/**
 * Wait until we have all prerequisites before we do anything related to the
 * Stock Market.  For now, we wait until the following conditions are met:
 *
 * (1) We have all port opener programs.
 * (2) Have at least a certain amount of money.
 *
 * @param {NS} ns The Netscript API.
 */
async function prerequisites(ns) {
    // Must acquire all port opener programs.
    const player = new Player(ns);
    while (!player.has_all_port_openers()) {
        await ns.sleep(wait_t.DEFAULT);
    }

    // Wait until we have a large amount of money before trading on the Stock
    // Market.  Gambling on the Stock Market requires huge wealth.
    while (!has_money_threshold(ns)) {
        await ns.sleep(wait_t.DEFAULT);
    }
}

/**
 * Purchase access to Stock Market data and APIs.
 *
 * @param {NS} ns The Netscript API.
 */
async function purchase_api_access(ns) {
    while (!has_wse_api(ns)) {
        await ns.sleep(wait_t.DEFAULT);
    }
    log(ns, "Purchased access to Stock Market data and APIs");
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
 * Purchase access to all Stock Market APIs and data.  We require the APIs and
 * data before we can launch our trade bot.
 *
 * Usage: run quack/stock/go.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    await prerequisites(ns);
    await purchase_api_access(ns);
    exec(ns, "/quack/stock/trade.js");
}
