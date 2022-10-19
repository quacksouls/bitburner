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

import { cheapest_program } from "/lib/constant/exe.js";
import { wait_t } from "/lib/constant/time.js";
import { Money } from "/lib/money.js";
import { Player } from "/lib/player.js";
import { has_ai_api } from "/lib/source.js";
import { assert } from "/lib/util.js";

/**
 * Passively farm Intelligence XP.
 *
 * @param ns The Netscript API.
 */
async function farm_intelligence(ns) {
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
 * @param ns The Netscript API.
 * @return An array [k, t] as follows:
 *
 *     (1) k := How many programs to purchase.  We buy this many programs in
 *         one go, then sleep.
 *     (2) t := The interval in milliseconds between successive purchases.
 *         We buy a bunch of programs, then sleep for this interval.
 */
function purchase_schedule(ns) {
    // The money threshold.
    const m = new Money();
    const money = [
        m.quadrillion(),
        900 * m.trillion(),
        800 * m.trillion(),
        700 * m.trillion(),
        600 * m.trillion(),
        500 * m.trillion(),
        400 * m.trillion(),
        300 * m.trillion(),
        200 * m.trillion(),
        100 * m.trillion(),
        10 * m.trillion(),
        m.trillion(),
        500 * m.billion(),
        100 * m.billion(),
        m.billion(),
        100 * m.million(),
        10 * m.million(),
    ];
    // How many programs to buy.
    const howmany = [
        1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50, 25, 12, 6, 3, 1,
        1,
    ];
    // The sleep intervals.
    const time = [
        wait_t.MILLISECOND,
        wait_t.MILLISECOND,
        wait_t.MILLISECOND,
        wait_t.MILLISECOND,
        wait_t.MILLISECOND,
        wait_t.MILLISECOND,
        wait_t.MILLISECOND,
        wait_t.MILLISECOND,
        wait_t.MILLISECOND,
        wait_t.MILLISECOND,
        wait_t.MILLISECOND,
        wait_t.MILLISECOND,
        wait_t.SECOND,
        10 * wait_t.SECOND,
        30 * wait_t.SECOND,
        wait_t.MINUTE,
        2 * wait_t.MINUTE,
    ];
    const player = new Player(ns);
    const funds = player.money();
    for (let i = 0; i < money.length; i++) {
        if (funds >= money[i]) {
            return [howmany[i], time[i]];
        }
    }
    // Should never reach here.
    assert(false);
}

/**
 * Passively farm Intelligence XP.  This script should be run in the background
 * if our home RAM is high enough.  Every once in a while, it does an action
 * that adds to our Intelligence XP.  The action should not require us to
 * focus.  At the moment, the action we want to perform periodically is
 * purchase one of the cheapest programs via the dark web.
 *
 * Usage: run singularity/int-farm.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    if (!has_ai_api(ns)) {
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
