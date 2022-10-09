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

// Global variables.  Bad, I know, but it's to make the script self-contained.

/**
 * The cheapest programs available via the dark web are:
 *
 * (1) BruteSSH.exe
 * (2) ServerProfiler.exe
 * (3) DeepscanV1.exe
 *
 * Each costs the same amount of $500k.  Data taken from this page:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/DarkWeb/DarkWebItems.ts
 *
 * If we are to delete any of these cheapest programs, then we should
 * definitely keep BruteSSH.exe.  The remaining candidates for deletion are
 * ServerProfiler.exe and DeepscanV1.exe.  Decide which of these two programs
 * we do not need and delete that one.
 */
const cheapest_program = "DeepscanV1.exe";

/**
 * The player's home server.
 */
const home = "home";

/**
 * Various pre-defined periods.  Use these as our waiting times.  If we want
 * a custom period of time, we should define it using the given amount of
 * time in millisecond, second, or minute.
 */
const wait_t = {
    // The default waiting period in seconds.  Use this for most purposes, when
    // we wait for an action to complete.
    "DEFAULT": 5e3,
    // One hour expressed in milliseconds.
    "HOUR": 36e5,
    // One millisecond.
    "MILLISECOND": 1,
    // One minute expressed in milliseconds.
    "MINUTE": 6e4,
    // One second expressed in milliseconds.
    "SECOND": 1e3,
};

// Helper classes.

/**
 * A class to hold information about money.
 */
class Money {
    /**
     * The value for one million.
     */
    #million;
    /**
     * Initialize a money object.
     */
    constructor() {
        this.#million = 1e6;
    }

    /**
     * One billion, i.e. 10^9.
     */
    billion() {
        return 1000 * this.million();
    }

    /**
     * One million, i.e. 10^6.
     */
    million() {
        return this.#million;
    }

    /**
     * One quadrillion, i.e. 10^15.
     */
    quadrillion() {
        return 1000 * this.trillion();
    }

    /**
     * One trillion, i.e. 10^12.
     */
    trillion() {
        return 1000 * this.billion();
    }
}

// Helper functions.

/**
 * A function for assertion.
 *
 * @param cond Assert that this condition is true.
 * @return Throw an assertion error if the given condition is false.
 */
function assert(cond) {
    if (!cond) {
        throw new Error("Assertion failed.");
    }
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
    // One of the known cheapest programs.  Must delete the program if we have
    // it.  After purchasing the program, delete it again.
    const p = cheapest_program;
    ns.rm(p, home);
    while (true) {
        if (player_money(ns) < min_money) {
            await ns.sleep(2 * wait_t.MINUTE);
            continue;
        }
        const [k, time] = purchase_schedule(ns);
        for (let i = 0; i < k; i++) {
            assert(ns.singularity.purchaseProgram(p));
            assert(ns.rm(p, home));
        }
        await ns.sleep(time);
    }
}

/**
 * Whether we have purchased the TOR router.
 *
 * @param ns The Netscript API.
 * @return true if we have purchased the TOR router; false otherwise.
 */
function has_tor(ns) {
    return ns.getPlayer().tor;
}

/**
 * The amount of money available to the player.
 *
 * @param ns The Netscript API.
 */
function player_money(ns) {
    return ns.getServerMoneyAvailable(home);
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
        10 * m.million()
    ];
    // How many programs to buy.
    const howmany = [
        1000,
        900,
        800,
        700,
        600,
        500,
        400,
        300,
        200,
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
        2 * wait_t.MINUTE
    ];
    const funds = player_money(ns);
    for (let i = 0; i < money.length; i++) {
        if (funds >= money[i]) {
            return [howmany[i], time[i]];
        }
    }
}

/**
 * A self-contained script to passively farm Intelligence XP.
 *
 * Passively farm Intelligence XP.  This script should be run in the background
 * if our home RAM is high enough.  Every once in a while, it does an action
 * that adds to our Intelligence XP.  The action should not require us to
 * focus.  At the moment, the action we want to perform periodically is
 * purchase one of the cheapest programs via the dark web.
 *
 * Usage: run int-farm.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Suppress various log messages.
    ns.disableLog("getServerMoneyAvailable");

    while (!has_tor(ns)) {
        ns.singularity.purchaseTor();
        await ns.sleep(wait_t.SECOND);
    }
    await farm_intelligence(ns);
}
