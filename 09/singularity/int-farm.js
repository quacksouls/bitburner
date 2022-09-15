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

import { utility_program } from "/lib/constant.exe.js";
import { Money } from "/lib/money.js";
import { Player } from "/lib/player.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Choose one of the cheapest programs that are available via the dark web.
 * The program cannot be one of the port openers, i.e. BruteSSH.exe,
 * FTPCrack.exe, HTTPWorm.exe, relaySMTP.exe, SQLInject.exe.
 *
 * @param ns The Netscript API.
 * @return A string representing the name of one of the cheapest programs.
 *     Cannot be a port opener program.
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
    // Must delete the program if we have it.  After purchasing the program,
    // delete it again.
    const player = new Player(ns);
    const p = cheapest_program(ns);
    ns.rm(p, player.home());
    while (true) {
        if (player.money() < min_money) {
            await ns.sleep(purchase_interval(ns));
            continue;
        }
        assert(ns.singularity.purchaseProgram(p));
        assert(ns.rm(p, player.home()));
        await ns.sleep(purchase_interval(ns));
    }
}

/**
 * The amount of time that must pass before we attempt another purchase.  The
 * purchase interval varies, depending on the amount of money we have.  The
 * higher is our money, the lower is the purchase interval.
 *
 * @param ns The Netscript API.
 * @return The interval in milliseconds between successive purchases.
 */
function purchase_interval(ns) {
    const m = new Money();
    const low = 100 * m.million();
    const high = m.billion();
    const rich = 100 * m.billion();
    const filthy_rich = 500 * m.billion();
    const the_mint = m.trillion();
    const t = new Time();
    const player = new Player(ns);
    const money = player.money();
    if (money < low) {
        return 2 * t.minute();
    }
    if ((low <= money) && (money < high)) {
        return t.minute();
    }
    if ((high <= money) && (money < rich)) {
        return 30 * t.second();
    }
    if ((rich <= money) && (money < filthy_rich)) {
        return 10 * t.second();
    }
    if ((filthy_rich <= money) && (money < the_mint)) {
        return t.second();
    }
    assert(money >= the_mint);
    return t.millisecond();
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
