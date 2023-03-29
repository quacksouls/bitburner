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

import { buy_schedule, cheapest_program } from "/quack/lib/constant/exe.js";
import { colour } from "/quack/lib/constant/misc.js";
import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";
import { Money } from "/quack/lib/money.js";
import { Player } from "/quack/lib/player.js";
import { has_ai_api } from "/quack/lib/source.js";
import { assert } from "/quack/lib/util.js";

/**
 * Passively farm Intelligence XP.
 *
 * @param {NS} ns The Netscript API.
 */
async function farm_intelligence(ns) {
    log(ns, "Passively farm for Intelligence XP");

    // The minimum amount of money we should have in order to purchase one of
    // the cheapest programs.
    const m = new Money();
    const min_money = 10 * m.million();

    // Must delete the program if we have it.  After purchasing a program,
    // delete it again.
    const player = new Player(ns);
    const p = cheapest_program.NAME;
    ns.rm(p, player.home());
    for (;;) {
        if (player.money() < min_money) {
            await ns.sleep(2 * wait_t.MINUTE);
            continue;
        }
        const [k, time] = purchase_schedule(ns);
        for (let i = 0; i < k; i++) {
            assert(ns.singularity.purchaseProgram(p));
            assert(ns.rm(p, player.home()));
        }
        await ns.sleep(time);
    }
}

/**
 * The purchase schedule, which tells us how many programs to buy and the
 * amount of time to sleep between successive purchases.  Both the number of
 * programs to buy and the sleep interval vary, depending on the amount of
 * money we have.  The higher is our money, the lower is the sleep interval and
 * the more programs we buy.
 *
 * @param {NS} ns The Netscript API.
 * @returns {array} An array [k, t] as follows:
 *
 *     (1) k := How many programs to purchase.  We buy this many programs in
 *         one go, then sleep.
 *     (2) t := The interval in milliseconds between successive purchases.
 *         We buy a bunch of programs, then sleep for this interval.
 */
function purchase_schedule(ns) {
    // Low on funds.  Use a pre-defined purchasing schedule.
    const funds = ns.getServerMoneyAvailable(home);
    if (funds < buy_schedule.DYNAMIC_TAU) {
        for (let i = 0; i < buy_schedule.money.length; i++) {
            if (funds >= buy_schedule.money[i]) {
                return [buy_schedule.howmany[i], buy_schedule.time[i]];
            }
        }
        // Should never reach here.
        assert(false);
    }

    // We are filthy rich.  Use a dynamic purchasing schedule.  We limit the
    // batch size to prevent the script from slowing down the UI.
    let howmany = Math.floor(funds / buy_schedule.DIVISOR);
    howmany = Math.min(howmany, buy_schedule.MAX_BATCH_SIZE);
    return [howmany, wait_t.MILLISECOND];
}

/**
 * Passively farm Intelligence XP.  This script should be run in the background
 * if our home RAM is high enough.  Every once in a while, it does an action
 * that adds to our Intelligence XP.  The action should not require us to
 * focus.  At the moment, the action we want to perform periodically is
 * purchase one of the cheapest programs via the dark web.
 *
 * Usage: run quack/singularity/int-farm.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    if (!has_ai_api(ns)) {
        log(ns, "No access to Artificial Intelligence API", colour.RED);
        return;
    }
    // Suppress various log messages.
    ns.disableLog("getServerMoneyAvailable");

    const player = new Player(ns);
    while (!player.has_tor()) {
        ns.singularity.purchaseTor();
        await ns.sleep(wait_t.SECOND);
    }
    await farm_intelligence(ns);
}
