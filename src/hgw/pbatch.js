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

import { pserv } from "/quack/lib/constant/pserv.js";
import { PservHGW } from "/quack/lib/pbatch.js";
import { assert } from "/quack/lib/util.js";

/**
 * Continuously hack a target server.  Steal a certain percentage of the
 * server's money, then weaken/grow the server until it is at minimum security
 * level and maximum money.  Rinse and repeat.
 *
 * @param ns The Netscript API.
 * @param host Hostname of the purchased server to use.
 * @param target Hack this world server.
 * @param frac The fraction of money to steal.  Must be positive and at
 *     most 1.
 */
async function hack(ns, host, target, frac) {
    const batcher = new PservHGW(ns, host);
    batcher.scp_scripts();
    for (;;) {
        await batcher.prep_gw(target);
        await batcher.hgw_hack(target, frac);
        await ns.sleep(0);
    }
}

/**
 * Various sanity checks.
 *
 * @param host Hostname of the server to target.
 * @param frac The fraction of money to steal.  Must be positive and at
 *     most 1.
 */
function sanity_checks(host, frac) {
    assert(host !== "");
    const exclude_list = new Set(pserv.exclude);
    assert(!exclude_list.has(host));
    assert(frac > 0 && frac <= 1);
}

/**
 * A sequential batcher for purchased servers.  Each of the hack, grow, and
 * weaken functions is separated into its own script.  When we need a particular
 * HGW action, we launch the appropriate script against a target server.  The
 * script accepts the following command line arguments.
 *
 * (1) host := Hostname of the purchased server to use.
 * (2) target := Hostname of the server to target.
 * (3) frac := The fraction of money to steal.
 *
 * Usage: run quack/hgw/pbatch.js [host] [target] [frac]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const [host, target, frac] = ns.args;
    const fr = parseFloat(frac);
    sanity_checks(target, fr);
    await hack(ns, host, target, fr);
}
