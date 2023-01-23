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

import { bool } from "/lib/constant/bool.js";
import { hgw } from "/lib/constant/misc.js";
import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { network } from "/lib/network.js";
import {
    assert,
    can_run_script,
    gain_root_access,
    num_threads,
} from "/lib/util.js";

// Utility functions in the model of hack/grow/weaken or HGW.

/**
 * Choose the servers from our botnet to use for hacking.  The servers are
 * chosen such that the total number of threads they offer allow us to steal a
 * certain percentage of a target's money.  Essentially, the problem is this.
 * We know we need n threads to steal a fraction of a target's money.  Choose
 * servers from among our botnet that would allow us to hack using n threads or
 * thereabout.
 *
 * @param ns The Netscript API.
 * @param host Hack this server.
 * @param frac The fraction of money to steal.  Must be between 0 and 1.
 * @return An array of objects {host, thread} as follows:
 *     (1) host := Hostname of a server where we are to run our hack script.
 *     (2) thread := The number of threads to use on the given server.
 */
export function assemble_botnet(ns, host, frac) {
    const s = hgw.script.HACK;
    const nthread = (serv) => num_threads(ns, s, serv);
    const descending = (a, b) => nthread(b) - nthread(a);
    const has_ram_to_run_script = (serv) => can_run_script(ns, s, serv);
    const money = target_money(ns, host, frac);
    const max_threads = ns.hackAnalyzeThreads(host, money);
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
 *     (2) "weaken" := Weaken the security level of the target server.
 */
export async function hgw_action(ns, host, botnet, action) {
    assert(host !== "");
    assert(host !== home);
    assert(botnet.length > 0);
    const time = hgw_wait_time(ns, host, action);
    const s = hgw_script(action);
    const has_ram_to_run_script = (serv) => can_run_script(ns, s, serv);
    const nthread = (serv) => num_threads(ns, s, serv);
    const run_script = (serv) => ns.exec(s, serv, nthread(serv), host);
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
 * Perform the hack HGW action against a target server.
 *
 * @param ns The Netscript API.
 * @param host Perform the hack HGW action against this server.  Cannot be our
 *     home server.
 * @param botnet An array of objects {host: hostname, thread: num_threads} of
 *     world servers to which we have root access.  Use these servers to hack
 *     the given target.  Cannot be empty array.
 */
export async function hgw_hack(ns, host, botnet) {
    assert(host !== "");
    assert(host !== home);
    assert(botnet.length > 0);
    const time = hgw_wait_time(ns, host, hgw.action.HACK);
    const s = hgw_script(hgw.action.HACK);
    const has_ram_to_run_script = (obj) => can_run_script(ns, s, obj.host);
    const run_script = (obj) => ns.exec(s, obj.host, obj.thread, host);
    const pid = botnet.filter(has_ram_to_run_script).map(run_script);
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
function is_action_done(ns, pid) {
    assert(pid.length > 0);
    const is_done = (i) => !ns.isRunning(i);
    return pid.every(is_done);
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
        const botnet = nuke_servers(ns);
        if (!has_max_money(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.GROW);
        }
        if (!has_min_security(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.WEAKEN);
        }
        if (has_min_security(ns, host) && has_max_money(ns, host)) {
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
        const botnet = nuke_servers(ns);
        await hgw_action(ns, host, botnet, hgw.action.GROW);
        await ns.sleep(0);
    }
    while (!has_min_security(ns, host)) {
        const botnet = nuke_servers(ns);
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
        const botnet = nuke_servers(ns);
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
        const botnet = nuke_servers(ns);
        if (!has_min_security(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.WEAKEN);
        }
        if (!has_max_money(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.GROW);
        }
        if (has_min_security(ns, host) && has_max_money(ns, host)) {
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
