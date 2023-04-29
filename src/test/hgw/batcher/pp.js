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

import { PservHGW } from "/quack/lib/batch.js";
import { hgw } from "/quack/lib/constant/hgw.js";
import { base } from "/quack/lib/constant/misc.js";
import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";
import { money } from "/quack/lib/money.js";
import {
    assert,
    is_empty_string,
    time_hms,
    to_second,
} from "/quack/lib/util.js";

/**
 * Use a parallel batcher to continuously hack a server.  Steal a certain
 * percentage of the server's money, then weaken/grow the server until it is at
 * minimum security level and maximum money.  Rinse and repeat.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of a purchased server.
 * @param {string} target Hostname of the world server to target.
 * @param {number} amount Raise this amount of money.
 */
async function hack(ns, host, target, amount) {
    // Prep the target server.
    const batcher = new PservHGW(ns, host);
    batcher.scp_scripts();
    ns.printf(`Prepping target ${target}`);
    await batcher.prep_wg(target);

    // Launch parallel batches whenever we can.
    const target_money = money(ns) + amount;
    const enough_money = () => money(ns) >= target_money;
    let i = 0;
    let fail = 0;
    while (!enough_money()) {
        const success = await batcher.launch_batch(target);
        if (success) {
            i++;
            fail = 0;
            ns.printf(`Launched batch ${i}`);
        } else {
            fail++;
            ns.printf(`Failure ${fail} to launch batch`);
        }

        if (is_prep_time(i, fail)) {
            ns.printf(
                `Prep cycle, batches launched = ${i}, failures = ${fail}`
            );
            await batcher.prep_wg(target);
            i = 0;
            fail = 0;
        }
        await ns.sleep(wait_t.MILLISECOND);
    }
}

/**
 * Whether it is time to prep a server.  We prep a server provided one of the
 * following conditions holds:
 *
 * (1) We have launched a certain number of batches against the server;
 * (2) We have encountered a given number of consecutive failures in launching
 *     batches.
 *
 * In general, after several batches have completed it is possible for the
 * target server to not be in the prepped state.
 *
 * @param {number} batch How many batches have run to completion.
 * @param {number} fail How many consecutive failures we have.
 * @returns {boolean} True if it is time for a prep cycle; false otherwise.
 */
function is_prep_time(batch, fail) {
    return batch >= hgw.MAX_BATCH || fail >= hgw.MAX_FAILURE;
}

/**
 * Various sanity checks.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} psram The amount of RAM for a purchased server.
 * @param {string} target Hostname of the server to target.
 * @param {number} amount The target amount of money to steal.
 */
function sanity_checks(ns, psram, target, amount) {
    const valid_ram = [
        32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536,
        131072, 262144, 524288, 1048576,
    ];
    assert(valid_ram.includes(psram));
    assert(!is_empty_string(target) && target !== home);
    assert(ns.getServerMaxMoney(target) > 0);
    assert(amount > 0);
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getServerMaxMoney");
    ns.disableLog("getServerMaxRam");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("sleep");
}

/**
 * Use a parallel batcher together with a purchased server to hack a target.
 * Each of the hack, grow, and weaken functions is separated into its own
 * script.  When we need a particular HGW action, we launch the appropriate
 * script against a target server.  This script accepts the command line
 * arguments:
 *
 * (1) target := Hostname of server to target.
 * (2) RAM := The amount of RAM for a purchased server.  Accepted values are:
 *     32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536,
 *     131072, 262144, 524288.
 * (3) amount := The amount of money to generate.  The script finishes once it
 *     has generated this amount of money.
 *
 * Usage: run quack/test/hgw/batcher/pp.js [target] [RAM] [amount]
 * Example: run quack/test/hgw/batcher/pp.js n00dles 64 10e6
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const [target, ram, amount] = ns.args;
    const psram = parseInt(ram, base.DECIMAL);
    const target_money = parseInt(amount, base.DECIMAL);
    sanity_checks(ns, psram, target, target_money);
    shush(ns);

    // Purchase a server having the given amount of RAM.
    const cost = ns.getPurchasedServerCost(psram);
    assert(cost <= money(ns));
    const host = ns.purchaseServer("pserv", psram);

    // Data prior to hacking.
    let time = Date.now();
    let hack_xp = ns.getPlayer().exp.hacking;
    let hack_stat = ns.getPlayer().skills.hacking;

    // Gather data.
    await hack(ns, host, target, target_money);

    // Data after hacking.
    const rate = (amt, ms) => amt / to_second(ms);
    time = Date.now() - time;
    const time_fmt = time_hms(time);
    hack_xp = ns.getPlayer().exp.hacking - hack_xp;
    const xp_rate = rate(hack_xp, time);
    hack_stat = ns.getPlayer().skills.hacking - hack_stat;
    const money_rate = rate(target_money, time);
    const stat = `${hack_stat}, ${hack_xp}, ${xp_rate}, ${money_rate}`;
    log(ns, `${target}: ${time_fmt}, ${stat}`);
}
