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

import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";
import { exec } from "/quack/lib/util.js";

/**
 * Ensure our money is not over $250m.
 *
 * @param {NS} ns The Netscript API.
 */
async function calibrate_money(ns) {
    const max_money = 250e6;
    const ram = 2; // 2GB RAM
    const host = "pserv";
    while (money(ns) > max_money) {
        ns.purchaseServer(host, ram);
        ns.deleteServer(host);
        await ns.sleep(wait_t.MILLISECOND);
    }
}

/**
 * The player's current amount of money.
 *
 * @param {NS} ns The Netscript API.
 * @returns {number} Our current money.
 */
function money(ns) {
    return ns.getServerMoneyAvailable(home);
}

/**
 * Use a Stock Market script where we have purchased all data and API access.
 * See how much money the script can generate within 24 hours.
 *
 * Usage: run quack/test/stock/go4s.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    // Data prior to running the trade bot.
    await calibrate_money(ns);
    const seed_money = money(ns);
    const nhour = 24;
    const max_time = nhour * wait_t.HOUR;
    const end_time = Date.now() + max_time;

    // Gather data.
    const pid = exec(ns, "/quack/test/stock/trade4s.js");
    while (Date.now() < end_time) {
        await ns.sleep(wait_t.DEFAULT);
    }
    ns.kill(pid);

    // Data after the given interval.
    const profit = money(ns) - seed_money;
    const seed_msg = `with seed money ${seed_money}`;
    const profit_msg = `trade bot made ${profit} in profit`;
    log(ns, `After ${nhour} hours, ${seed_msg}, ${profit_msg}`);
}
