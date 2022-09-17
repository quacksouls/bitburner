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

import { utility_program } from "/lib/constant/exe.js";
import { Money } from "/lib/money.js";
import { Player } from "/lib/player.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Choose one of the cheapest programs available via the dark web.  The program
 * cannot be any of the port openers, i.e. BruteSSH.exe, FTPCrack.exe,
 * HTTPWorm.exe, relaySMTP.exe, SQLInject.exe.
 *
 * @param ns The Netscript API.
 * @return A string representing the name of one of the cheapest programs.
 *     Cannot be a port opener.
 */
function cheapest_program(ns) {
    const player = new Player(ns);
    let min_cost = Infinity;
    let prog = "";
    // Consider the utility programs, not the port opener programs.
    for (const p of utility_program) {
        // Must delete program first if we have it, otherwise the reported
        // cost would be zero.
        if (player.has_program(p)) {
            assert(ns.rm(p, player.home()));
        }
        const cost = ns.singularity.getDarkwebProgramCost(p);
        if (min_cost > cost) {
            min_cost = cost;
            prog = p;
        }
    }
    assert("" != prog);
    assert(min_cost > 0);
    return prog;
}

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
    const p = cheapest_program(ns);
    ns.rm(p, player.home());
    const t = new Time();
    while (true) {
        if (player.money() < min_money) {
            await ns.sleep(2 * t.minute());
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
        100 * m.trillion(),
        10 * m.trillion(),
        m.trillion(),
        500 * m.billion(),
        100 * m.billion(),
        m.billion(),
        100 * m.million(),
        10 * m.million()
    ];
    // How many programs to buy.
    const howmany = [
        100,
        50,
        25,
        12,
        6,
        3,
        1,
        1
    ];
    // The sleep intervals.
    const t = new Time();
    const time = [
        t.millisecond(),
        t.millisecond(),
        t.millisecond(),
        t.second(),
        10 * t.second(),
        30 * t.second(),
        t.minute(),
        2 * t.minute()
    ];
    const player = new Player(ns);
    const funds = player.money();
    for (let i = 0; i < money.length; i++) {
        if (funds >= money[i]) {
            return [howmany[i], time[i]];
        }
    }
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
    // Suppress various log messages.
    ns.disableLog("getServerMoneyAvailable");

    const player = new Player(ns);
    const t = new Time();
    while (!player.has_tor()) {
        ns.singularity.purchaseTor();
        await ns.sleep(t.second());
    }
    await farm_intelligence(ns);
}
