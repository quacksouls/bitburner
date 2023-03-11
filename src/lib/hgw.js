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

import { bool } from "/quack/lib/constant/bool.js";
import { hgw } from "/quack/lib/constant/misc.js";
import { home, home_t } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { network } from "/quack/lib/network.js";
import {
    assert,
    can_run_script,
    free_ram,
    gain_root_access,
    num_threads,
} from "/quack/lib/util.js";

// Utility functions in the model of hack/grow/weaken or HGW.

/**
 * Choose the servers from our botnet to use for hacking or otherwise.  The
 * servers are chosen such that the total number of threads they offer allow us
 * to steal a certain percentage of a target's money.  Essentially, the problem
 * is this.  We know we need n threads to steal a fraction of a target's money.
 * Choose servers from among our botnet that would allow us to hack using n
 * threads or thereabout.
 *
 * @param ns The Netscript API.
 * @param host Hack this server.
 * @param frac The fraction of money to steal.  Must be between 0 and 1.
 * @param is_prep Are we prepping a world server?  If is_prep is true, the
 *     function will ignore the parameters host and frac.
 * @return An array of objects {host, thread} as follows:
 *
 *     (1) host := Hostname of a server where we are to run our hack script.
 *     (2) thread := The number of threads to use on the given server.
 *
 *     If is_prep is true, then return an array of hostnames of world servers.
 */
export function assemble_botnet(ns, host, frac, is_prep) {
    if (is_prep) {
        return nuke_servers(ns);
    }
    const s = hgw.script.HACK;
    const nthread = (serv) => num_threads(ns, s, serv);
    const descending = (a, b) => nthread(b) - nthread(a);
    const has_ram_to_run_script = (serv) => can_run_script(ns, s, serv);
    const money = target_money(ns, host, frac);
    const max_threads = Math.floor(ns.hackAnalyzeThreads(host, money));
    const botnet = [];
    let n = 0;
    nuke_servers(ns)
        .filter(has_ram_to_run_script)
        .sort(descending)
        .forEach((serv) => {
            if (n >= max_threads) {
                return;
            }
            const k = threads_to_use(ns, serv, n, max_threads);
            botnet.push({ host: serv, thread: k });
            n += k;
            assert(n <= max_threads);
        });
    assert(botnet.length > 0);
    return botnet;
}

/**
 * Attempt to gain root access to a given server.  After gaining root access, we
 * copy our HGW scripts over to the server.
 *
 * @param ns The Netscript API.
 * @param host Hostname of a world server.
 * @return True if we have root access to the given server; false otherwise.
 */
function gain_admin_access(ns, host) {
    if (gain_root_access(ns, host)) {
        const file = [hgw.script.GROW, hgw.script.HACK, hgw.script.WEAKEN];
        ns.scp(file, host, home);
        return bool.HAS;
    }
    return bool.NOT;
}

/**
 * Whether a server's money is at its maximum.
 *
 * @param ns The Netscript API.
 * @param host The hostname of a server.
 * @return True if the amount of money on the given server is at its maximum;
 *     false otherwise.
 */
export function has_max_money(ns, host) {
    const { moneyAvailable, moneyMax } = ns.getServer(host);
    return moneyAvailable >= moneyMax;
}

/**
 * Whether a server's security level is at its minimum.
 *
 * @param ns The Netscript API.
 * @param host The hostname of a server.
 * @return True if the security level of the given server is at its minimum;
 *     false otherwise.
 */
export function has_min_security(ns, host) {
    const { hackDifficulty, minDifficulty } = ns.getServer(host);
    return hackDifficulty <= minDifficulty;
}

/**
 * Perform an HGW action against a target server.
 *
 * @param ns The Netscript API.
 * @param host Perform an HGW action against this server.  Cannot be our home
 *     server.
 * @param botnet An array of world servers to which we have root access.  Use
 *     these servers to perform an HGW action against the given target.  Cannot
 *     be empty array.
 * @param action The action we want to perform against the given target server.
 *     Supported actions are:
 *     (1) "grow" := Grow money on the target server.
 *     (2) "hack" := Hack money from the target server.
 *     (3) "weaken" := Weaken the security level of the target server.
 */
export async function hgw_action(ns, host, botnet, action) {
    assert(host !== "");
    assert(host !== home);
    assert(botnet.length > 0);

    const time = hgw_wait_time(ns, host, action);
    const s = hgw_script(action);
    let has_ram_to_run_script = (serv) => can_run_script(ns, s, serv);
    const nthread = (serv) => num_threads(ns, s, serv);
    let run_script = (serv) => ns.exec(s, serv, nthread(serv), host);
    if (action === hgw.action.HACK) {
        has_ram_to_run_script = (obj) => can_run_script(ns, s, obj.host);
        run_script = (obj) => ns.exec(s, obj.host, obj.thread, host);
    }
    const pid = botnet.filter(has_ram_to_run_script).map(run_script);
    if (pid.length === 0) {
        return;
    }
    await ns.sleep(time);
    while (!is_action_done(ns, pid)) {
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * The HGW script to use for a given HGW action.
 *
 * @param action The action we want to perform against a target server.
 *     Supported actions are:
 *     (1) "grow" := Grow money on the target server.
 *     (2) "hack" := Steal money from the target server.
 *     (3) "weaken" := Weaken the security level of the target server.
 * @return The HGW script corresponding to the given action.
 */
export function hgw_script(action) {
    switch (action) {
        case hgw.action.GROW:
            return hgw.script.GROW;
        case hgw.action.HACK:
            return hgw.script.HACK;
        case hgw.action.WEAKEN:
            return hgw.script.WEAKEN;
        default:
            // Should never reach here.
            assert(false);
    }
}

/**
 * The amount of time in milliseconds we must wait for an HGW action to
 * complete.
 *
 * @param ns The Netscript API.
 * @param host Perform an HGW action against this server.
 * @param action The action we want to perform against the given target server.
 *     Supported actions are:
 *     (1) "grow" := Grow money on the target server.
 *     (2) "hack" := Steal money from the target server.
 *     (3) "weaken" := Weaken the security level of the target server.
 * @return The amount of time required for the given action to complete on the
 *     target server.
 */
export function hgw_wait_time(ns, host, action) {
    switch (action) {
        case hgw.action.GROW:
            return ns.getGrowTime(host);
        case hgw.action.HACK:
            return ns.getHackTime(host);
        case hgw.action.WEAKEN:
            return ns.getWeakenTime(host);
        default:
            // Should never reach here.
            assert(false);
    }
}

/**
 * Whether an HGW action is completed.
 *
 * @param ns The Netscript API.
 * @param pid An array of PIDs.
 * @return True if all processes having the given PIDs are done;
 *     false otherwise.
 */
export function is_action_done(ns, pid) {
    assert(pid.length > 0);
    const is_done = (i) => !ns.isRunning(i);
    return pid.every(is_done);
}

/**
 * Whether a server is prepped.  A server is said to be prepped if its security
 * level is at minimum and its money is at maximum.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of the server to check.
 * @returns {boolean} True if the target server is prepped; false otherwise.
 */
export function is_prepped(ns, host) {
    return has_min_security(ns, host) && has_max_money(ns, host);
}

/**
 * Gain root access to as many world servers as we can.
 *
 * @param ns The Netscript API.
 * @return An array of hostnames of servers.  We have root access to each
 *     server.
 */
export function nuke_servers(ns) {
    return network(ns).filter((host) => gain_admin_access(ns, host));
}

/**
 * Perform an HGW action against a target server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Run our HGW script on this server.
 * @param {string} target Perform an HGW action against this server.
 * @param {string} action The action we want to perform against the given target
 *     server.  Supported actions are:
 *     (1) "grow" := Grow money on the target server.
 *     (2) "weaken" := Weaken the security level of the target server.
 */
export async function pbatch_action(ns, host, target, action) {
    // Sanity checks.
    assert(host !== "");
    assert(target !== "" && target !== home);
    const s = hgw_script(action);
    assert(can_run_script(ns, s, host));

    const nthread = pbatch_nthread(ns, s, host);
    const pid = ns.exec(s, host, nthread, target);
    const time = hgw_wait_time(ns, target, action);
    await ns.sleep(time);
    const is_done = () => !ns.isRunning(pid);
    while (!is_done()) {
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * The maximum number of threads that can be used to run our script on a given
 * server.  If the host is our home server, we take into account the amount of
 * RAM that should be reserved, taking care not to use all available RAM on our
 * home server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} s A script.  Assumed to be located on home server.
 * @param {string} host Hostname of a world server.
 * @returns {number} The maximum number of threads to run our script on the
 *     given server.
 */
export function pbatch_nthread(ns, s, host) {
    const script_ram = ns.getScriptRam(s, home);
    const { maxRam, ramUsed } = ns.getServer(host);
    const reserved_ram = host === home ? home_t.reserve.MID : 0;
    const server_ram = maxRam - ramUsed - reserved_ram;
    if (server_ram < 1) {
        return 0;
    }
    return Math.floor(server_ram / script_ram);
}

/**
 * The number of hack threads to use in one batch of a proto batcher.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of the server where our batch will run.
 * @param {string} target Hostname of the server our batch will target.
 * @returns {number} The number of hack threads to use in one batch.
 */
export function pbatch_num_hthreads(ns, host, target) {
    // The percentage of money we want to hack from the target server.  Maximum
    // is (MAX_FRACTION * 100)% and the minimum is 1%.
    const max_percent = Math.floor(hgw.money.MAX_FRACTION * 100);
    const percent = [...Array(max_percent + 1).keys()];
    percent.shift();
    percent.reverse();

    // The maximum percentage of money we can hack while using only the
    // RAM available on the host server.
    const reserved_ram = host === home ? home_t.reserve.MID : 0;
    const available_ram = free_ram(ns, host) - reserved_ram;
    for (const pc of percent) {
        const money = (pc / 100) * ns.getServerMaxMoney(target);
        const max_threads = Math.floor(ns.hackAnalyzeThreads(target, money));
        const param = pbatch_parameters(ns, target, max_threads);
        const thread = [
            param.hack.thread,
            param.grow.thread,
            param.weaken.thread,
        ];
        const invalid_thread = (t) => t < 1;
        if (thread.some(invalid_thread)) {
            continue;
        }
        const total_ram = param.hack.ram + param.grow.ram + param.weaken.ram;
        const exceed_ram = total_ram > available_ram;
        if (!exceed_ram) {
            return param.hack.thread;
        }
    }
    return hgw.pbatch.INVALID_NUM_THREAD;
}

/**
 * The thread and RAM parameters for one batch of a proto batcher.
 *
 * WARNING: Must have access to the Formulas API.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of the server our batch will target.
 * @param {number} thread The number of threads to run the ns.hack() function.
 * @returns {object} An object containing the batch parameters.  The object is
 *     structured as follows:
 *     {
 *         hack: {
 *             ram: number, // RAM required for the number of hack threads.
 *             thread: number, // The number of threads to run ns.hack().
 *             time: number, // Time required for ns.hack() to finish.
 *         },
 *         grow: {
 *             ram: number, // RAM required for the number of grow threads.
 *             thread: number, // The number of threads to run ns.grow().
 *             time: number, // Time required for ns.grow() to finish.
 *         },
 *         weaken: {
 *             ram: number, // RAM required for the number of weaken threads.
 *             thread: number, // The number of threads to run ns.weaken().
 *             time: number, // Time required for ns.weaken() to finish.
 *         }
 *     }
 */
export function pbatch_parameters(ns, host, thread) {
    // The number of hack threads required, the hack time, and the effect of
    // hacking.
    const hthread = Math.floor(thread);
    const serv = ns.getServer(host);
    const htime = ns.getHackTime(host);
    const money_fraction = ns.hackAnalyze(host);
    const money_hacked = hthread * money_fraction * ns.getServerMaxMoney(host);
    serv.hackDifficulty += hthread * hgw.security.HACK;
    serv.moneyAvailable = serv.moneyMax - money_hacked;

    // The number of grow threads required, the grow time, and the effect of
    // growing.
    const gthread = ns.formulas.hacking.growThreads(
        serv,
        ns.getPlayer(),
        serv.moneyMax
    );
    const gtime = ns.getGrowTime(host);

    // The number of weaken threads required and the weaken time.
    const hack_sec_increase = hthread * hgw.security.HACK;
    const grow_sec_increase = gthread * hgw.security.GROW;
    const total_security_increase = hack_sec_increase + grow_sec_increase;
    const wthread = Math.ceil(total_security_increase / hgw.security.WEAKEN);
    const wtime = ns.getWeakenTime(host);

    const required_ram = (scrpt, nthrd) => nthrd * ns.getScriptRam(scrpt, home);
    return {
        hack: {
            ram: required_ram(hgw.script.HACK, hthread),
            thread: hthread,
            time: htime,
        },
        grow: {
            ram: required_ram(hgw.script.GROW, gthread),
            thread: gthread,
            time: gtime,
        },
        weaken: {
            ram: required_ram(hgw.script.WEAKEN, wthread),
            thread: wthread,
            time: wtime,
        },
    };
}

/**
 * Prepare a world server for hacking.  We use the following strategy.
 *
 * (1) Weaken
 * (2) Grow
 *
 * Apply the above strategy in a loop.  Repeat until the target server has
 * minimum security level and maximum money.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Run HGW script(s) on this server.
 * @param {string} target Prep this world server.
 */
export async function pbatch_prep(ns, host, target) {
    for (;;) {
        if (!has_min_security(ns, target)) {
            await pbatch_action(ns, host, target, hgw.action.WEAKEN);
        }
        if (!has_max_money(ns, target)) {
            await pbatch_action(ns, host, target, hgw.action.GROW);
        }
        if (has_min_security(ns, target) && has_max_money(ns, target)) {
            return;
        }
        await ns.sleep(0);
    }
}

/**
 * Prepare a server for hacking.  We use the following strategy.
 *
 * (1) Grow
 * (2) Weaken
 *
 * Apply the above strategy in a loop.  Repeat until the target server has
 * minimum security level and maximum money.
 *
 * @param ns The Netscript API.
 * @param host Prep this server.
 */
export async function prep_gw(ns, host) {
    for (;;) {
        const botnet = assemble_botnet(ns, host, 0, bool.IS_PREP);
        if (!has_max_money(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.GROW);
        }
        if (!has_min_security(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.WEAKEN);
        }
        if (is_prepped(ns, host)) {
            return;
        }
        await ns.sleep(0);
    }
}

/**
 * Prepare a server for hacking.  Grow a server to maximum money, then weaken
 * the server to minimum security level.
 *
 * @param ns The Netscript API.
 * @param host Prep this server.
 */
export async function prep_mgw(ns, host) {
    while (!has_max_money(ns, host)) {
        const botnet = assemble_botnet(ns, host, 0, bool.IS_PREP);
        await hgw_action(ns, host, botnet, hgw.action.GROW);
        await ns.sleep(0);
    }
    while (!has_min_security(ns, host)) {
        const botnet = assemble_botnet(ns, host, 0, bool.IS_PREP);
        await hgw_action(ns, host, botnet, hgw.action.WEAKEN);
        await ns.sleep(0);
    }
}

/**
 * Prepare a server for hacking.  Weaken a server to its minimum security level,
 * then apply the strategy gw.
 *
 * @param ns The Netscript API.
 * @param host Prep this server.
 */
export async function prep_mwg(ns, host) {
    while (!has_min_security(ns, host)) {
        const botnet = assemble_botnet(ns, host, 0, bool.IS_PREP);
        await hgw_action(ns, host, botnet, hgw.action.WEAKEN);
        await ns.sleep(0);
    }
    await prep_gw(ns, host);
}

/**
 * Prepare a server for hacking.  We use the following strategy.
 *
 * (1) Weaken
 * (2) Grow
 *
 * Apply the above strategy in a loop.  Repeat until the target server has
 * minimum security and maximum money.
 *
 * @param ns The Netscript API.
 * @param host Prep this server.
 */
export async function prep_wg(ns, host) {
    for (;;) {
        const botnet = assemble_botnet(ns, host, 0, bool.IS_PREP);
        if (!has_min_security(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.WEAKEN);
        }
        if (!has_max_money(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.GROW);
        }
        if (is_prepped(ns, host)) {
            return;
        }
        await ns.sleep(0);
    }
}

/**
 * The amount of money to steal from a server.  We should refrain from emptying
 * a server of all of its money.  Instead, our objective should be to steal a
 * fraction of a server's money.
 *
 * @param ns The Netscript API.
 * @param host Steal money from this server.
 * @param frac The fraction of money to steal.
 * @return The amount of money to steal from the given server.
 */
export function target_money(ns, host, frac) {
    return Math.floor(frac * ns.getServer(host).moneyMax);
}

/**
 * The number of threads to use on a given server.
 *
 * @param ns The Netscript API.
 * @param host Hostname of a server.
 * @param current The current total number of threads.
 * @param max The overall maximum number of threads we should use.
 * @return The number of threads to use on the given server to run our hack
 *     script.
 */
function threads_to_use(ns, host, current, max) {
    assert(current >= 0);
    assert(max > 0);
    const k = num_threads(ns, hgw.script.HACK, host);
    if (current + k <= max) {
        return k;
    }
    assert(current + k > max);
    const j = max - current;
    assert(j > 0 && j < k);
    assert(current + j <= max);
    return j;
}
