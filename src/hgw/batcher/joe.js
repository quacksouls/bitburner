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

import { bool } from "/quack/lib/constant/bool.js";
import { hgw } from "/quack/lib/constant/hgw.js";
import { home, server } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import {
    pbatch_num_hthreads,
    pbatch_parameters,
    pbatch_prep,
} from "/quack/lib/hgw.js";
import { log } from "/quack/lib/io.js";

/**
 * Continuously hack a server.  Steal a certain percentage of the server's
 * money, then weaken/grow the server until it is at minimum security level and
 * maximum money.  Rinse and repeat.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} target Hostname of the world server to target.
 */
async function hack(ns, target) {
    await pbatch_prep(ns, home, target);
    for (;;) {
        const success = await launch_batch(ns, target);
        if (!success) {
            await pbatch_prep(ns, home, target);
        }
        await ns.sleep(wait_t.MILLISECOND);
    }
}

/**
 * Launch a batch against a target server.  Use the model of proto batcher.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} target Hostname of the server our proto batcher will
 *     target.
 * @returns {Promise<boolean>} True if the batch was successfully launched;
 *     false otherwise.
 */
async function launch_batch(ns, target) {
    const hthread = pbatch_num_hthreads(ns, home, target);
    if (hthread === hgw.pbatch.INVALID_NUM_THREAD) {
        return bool.FAILURE;
    }

    const param = pbatch_parameters(ns, target, hthread);
    const exec = (script, nthread) => {
        const option = { preventDuplicates: true, threads: nthread };
        return ns.exec(script, home, option, target);
    };
    const sleep = (time) => ns.sleep(time);
    const pidw = exec(hgw.script.WEAKEN, param.weaken.thread);
    await sleep(param.weaken.time - hgw.pbatch.DELAY - param.grow.time);
    const pidg = exec(hgw.script.GROW, param.grow.thread);
    await sleep(param.grow.time - hgw.pbatch.DELAY - param.hack.time);
    const pidh = exec(hgw.script.HACK, param.hack.thread);
    const not_running = (pid) => !ns.isRunning(pid);
    const pids = [pidh, pidg, pidw];
    const is_done = () => pids.every(not_running);
    for (;;) {
        if (is_done()) {
            return bool.SUCCESS;
        }
        await sleep(hgw.pbatch.SLEEP);
    }
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
 * WARNING: Requires the program Formulas.exe.
 *
 * Use a proto batcher against joesguns.  The batcher uses the RAM of our
 * home server.
 *
 * Usage: run quack/hgw/batcher/joe.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const target = server.JOES;
    shush(ns);
    log(ns, `Launch proto batcher against ${target}`);
    await hack(ns, target);
}
