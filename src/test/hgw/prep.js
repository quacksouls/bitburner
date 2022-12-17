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
import { log } from "/lib/io.js";
import { network } from "/lib/network.js";
import {
    assert,
    gain_root_access,
    has_max_money,
    has_min_security,
    hgw_action,
    is_bankrupt,
    to_second,
} from "/lib/util.js";

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
        const file = [hgw.script.GROW, hgw.script.WEAKEN];
        ns.scp(file, host, home);
        return bool.HAS;
    }
    return bool.NOT;
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
 * Prepare a server for hacking.  Our objective is to get a server to maximum
 * money and minimum security.  The target server should not be bankrupt, i.e.
 * must be able to hold some positive amount of money.
 *
 * @param ns The Netscript API.
 * @param strategy Use this strategy to prepare the server.  Supported
 *     strategies are:
 *     (1) "wg" := Weaken first, followed by grow.  Perform this in a loop.  The
 *         loop is repeated until the target
 *         server is at minimum security and maximum money.
 *     (2) "gw" := Same as the pervious strategy, but we grow first followed by
 *         weaken.
 *     (3) "mwg" := Weaken a server to minimum security first.  Then apply
 *         strategy (2).
 *     (4) "mgw" := Grow a server to maximum money first.  Then repeatedly
 *         weaken the server.
 * @param host Prepare this server for hacking.
 */
async function prep(ns, strategy, host) {
    switch (strategy) {
        case hgw.strategy.WG:
            return prep_wg(ns, host);
        default:
            // Should never reach here.
            assert(false);
    }
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
 * @return The amount of time (in seconds) required for the target server to be
 *     prepped.
 */
async function prep_wg(ns, host) {
    const before = Date.now();
    for (;;) {
        const botnet = nuke_servers(ns);
        if (!has_min_security(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.WEAKEN);
        }
        if (!has_max_money(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.GROW);
        }
        if (has_min_security(ns, host) && has_max_money(ns, host)) {
            break;
        }
        await ns.sleep(0);
    }
    return to_second(Date.now() - before);
}

/**
 * Testing strategies for preparing a server for minimum security and maximum
 * money.  Below is a description of each strategy:
 *
 * (1) "wg" := Weaken first, followed by grow.  Perform this in a loop.  The
 *     loop is repeated until the target server is at minimum security and
 *     maximum money.
 * (2) "gw" := Same as the pervious strategy, but we grow first followed by
 *     weaken.
 * (3) "mwg" := Weaken a server to minimum security first.  Then apply strategy
 *     (2).
 * (4) "mgw" := Grow a server to maximum money first.  Then repeatedly weaken
 *     the server.
 *
 * Pass one of the above strings as an argument to this script.  The script also
 * accepts the hostname of the server to target.
 *
 * Usage: run test/hgw/prep.js [strategy] [targetServer]
 * Example: run test/hgw/prep.js wg n00dles
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const [strategy, target] = ns.args;
    assert(!is_bankrupt(ns, target));
    const time = await prep(ns, strategy, target);
    log(ns, `${target}: ${strategy}: ${time}`);
}
