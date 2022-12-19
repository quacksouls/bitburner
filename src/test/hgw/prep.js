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

import { hgw } from "/lib/constant/misc.js";
import {
    prep_gw, prep_mgw, prep_mwg, prep_wg,
} from "/lib/hgw.js";
import { log } from "/lib/io.js";
import { assert, is_bankrupt, to_second } from "/lib/util.js";

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
 * @return An object as follows:
 *     (1) time := The amount of time (in milliseconds) required for the target
 *         server to be prepped.
 *     (2) hack := The amount of Hack XP we gained from the prepping.
 */
async function prep(ns, strategy, host) {
    switch (strategy) {
        case hgw.strategy.GW:
            return prep_grow_weaken(ns, host);
        case hgw.strategy.MGW:
            return prep_max_grow_weaken(ns, host);
        case hgw.strategy.MWG:
            return prep_min_weaken_grow(ns, host);
        case hgw.strategy.WG:
            return prep_weaken_grow(ns, host);
        default:
            // Should never reach here.
            assert(false);
    }
}

/**
 * Prepare a server for hacking.  We use the following strategy.
 *
 * (1) Grow
 * (2) Weaken
 *
 * Apply the above strategy in a loop.  Repeat until the target server has
 * minimum security and maximum money.
 *
 * @param ns The Netscript API.
 * @param host Prep this server.
 * @return An object as follows:
 *     (1) time := The amount of time (in milliseconds) required for the target
 *         server to be prepped.
 *     (2) hack_xp := The amount of Hack XP we gained from the prepping.
 *     (3) hack_stat := Our current Hack stat.
 */
async function prep_grow_weaken(ns, host) {
    const time_before = Date.now();
    const hack_before = ns.getPlayer().exp.hacking;
    await prep_gw(ns, host);
    return {
        time: Date.now() - time_before,
        hack_xp: ns.getPlayer().exp.hacking - hack_before,
        hack_stat: ns.getPlayer().skills.hacking,
    };
}

/**
 * Prepare a server for hacking.  Grow a server to maximum money, then weaken
 * the server to minimum security level.
 *
 * @param ns The Netscript API.
 * @param host Prep this server.
 * @return An object as follows:
 *     (1) time := The amount of time (in milliseconds) required for the target
 *         server to be prepped.
 *     (2) hack_xp := The amount of Hack XP we gained from the prepping.
 *     (3) hack_stat := Our current Hack stat.
 */
async function prep_max_grow_weaken(ns, host) {
    const time_before = Date.now();
    const hack_before = ns.getPlayer().exp.hacking;
    await prep_mgw(ns, host);
    return {
        time: Date.now() - time_before,
        hack_xp: ns.getPlayer().exp.hacking - hack_before,
        hack_stat: ns.getPlayer().skills.hacking,
    };
}

/**
 * Prepare a server for hacking.  Weaken a server to its minimum security level,
 * then apply the strategy gw.
 *
 * @param ns The Netscript API.
 * @param host Prep this server.
 * @return An object as follows:
 *     (1) time := The amount of time (in milliseconds) required for the target
 *         server to be prepped.
 *     (2) hack_xp := The amount of Hack XP we gained from the prepping.
 *     (3) hack_stat := Our current Hack stat.
 */
async function prep_min_weaken_grow(ns, host) {
    const time_before = Date.now();
    const hack_before = ns.getPlayer().exp.hacking;
    await prep_mwg(ns, host);
    return {
        time: Date.now() - time_before,
        hack_xp: ns.getPlayer().exp.hacking - hack_before,
        hack_stat: ns.getPlayer().skills.hacking,
    };
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
 * @return An object as follows:
 *     (1) time := The amount of time (in milliseconds) required for the target
 *         server to be prepped.
 *     (2) hack_xp := The amount of Hack XP we gained from the prepping.
 *     (3) hack_stat := Our current Hack stat.
 */
async function prep_weaken_grow(ns, host) {
    const time_before = Date.now();
    const hack_before = ns.getPlayer().exp.hacking;
    await prep_wg(ns, host);
    return {
        time: Date.now() - time_before,
        hack_xp: ns.getPlayer().exp.hacking - hack_before,
        hack_stat: ns.getPlayer().skills.hacking,
    };
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
    let { time, hack_xp, hack_stat } = await prep(ns, strategy, target);
    const second = to_second(time);
    let rate = hack_xp / second;
    const duration = ns.nFormat(second, "00:00:00");
    time = `time = ${duration}`;
    hack_stat = `Hack stat = ${hack_stat}`;
    hack_xp = `Hack XP = ${hack_xp}`;
    rate = `XP/s = ${rate}`;
    const data = `${time}, ${hack_stat}, ${hack_xp}, ${rate}`;
    log(ns, `${target}: ${strategy}: ${data}`);
}
