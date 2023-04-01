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
import { PservHGW } from "/quack/lib/pbatch.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * Use a proto batcher to continuously hack a server.  Steal a certain
 * percentage of the server's money, then weaken/grow the server until it is at
 * minimum security level and maximum money.  Rinse and repeat.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of a purchased server.
 * @param {string} target Hostname of the world server to target.
 */
async function hack(ns, host, target) {
    const batcher = new PservHGW(ns, host);
    batcher.scp_scripts();
    await batcher.prep_wg(target);
    for (;;) {
        const success = await batcher.launch_pbatch(target);
        if (!success) {
            await batcher.prep_wg(target);
        }
        await ns.sleep(wait_t.MILLISECOND);
    }
}

/**
 * Various sanity checks.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of a purchased server.
 * @param {string} target Hostname of the server to hack.
 */
function sanity_checks(ns, host, target) {
    assert(!is_empty_string(host) && host !== home);
    assert(!is_empty_string(target) && target !== home);
    assert(ns.getServerMaxMoney(target) > 0);
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
 * Use a proto batcher together with a purchased server to hack a target.  This
 * script accepts the command line arguments:
 *
 * (1) host := Hostname of the purhased server where we will run our batcher.
 * (2) target := Hostnmame of the server to hack.
 *
 * Usage: run quack/hgw/batcher/pserv.js [host] [target]
 * Example: run quack/hgw/batcher/pserv.js pserv phantasy
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const [host, target] = ns.args;
    sanity_checks(ns, host, target);
    shush(ns);
    log(ns, `Launch proto batcher against ${target}`);
    await hack(ns, host, target);
}
