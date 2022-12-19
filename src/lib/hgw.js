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
import { network } from "/lib/network.js";
import {
    assert,
    can_run_script,
    gain_root_access,
    num_threads,
} from "/lib/util.js";

// Utility functions in the model of hack/grow/weaken or HGW.

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
 *     (2) "hack" := Steal money from the target server.
 *     (3) "weaken" := Weaken the security level of the target server.
 */
export async function hgw_action(ns, host, botnet, action) {
    assert(host !== "");
    assert(host !== home);
    assert(botnet.length > 0);
    const time = hgw_wait_time(ns, host, action);
    const s = hgw_script(action);
    botnet
        .filter((serv) => can_run_script(ns, s, serv))
        .forEach((serv) => {
            const nthread = num_threads(ns, s, serv);
            ns.exec(s, serv, nthread, host);
        });
    await ns.sleep(time);
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
function hgw_script(action) {
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
function hgw_wait_time(ns, host, action) {
    switch (action) {
        case hgw.action.GROW:
            return ns.getGrowTime(host) + hgw.BUFFER_TIME;
        case hgw.action.HACK:
            return ns.getHackTime(host) + hgw.BUFFER_TIME;
        case hgw.action.WEAKEN:
            return ns.getWeakenTime(host) + hgw.BUFFER_TIME;
        default:
            // Should never reach here.
            assert(false);
    }
}

/**
 * Gain root access to as many world servers as we can.
 *
 * @param ns The Netscript API.
 * @return An array of hostnames of servers.  We have root access to each
 *     server.
 */
function nuke_servers(ns) {
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
