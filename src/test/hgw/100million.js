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

import { hgw } from "/quack/lib/constant/hgw.js";
import { home, server } from "/quack/lib/constant/server.js";
import {
    assemble_botnet,
    hgw_action,
    prep_gw,
    prep_wg,
} from "/quack/lib/hgw.js";
import { log } from "/quack/lib/io.js";
import { assert, to_second } from "/quack/lib/util.js";

/**
 * Continuously hack a server.  Steal a certain percentage of the server's
 * money, then weaken/grow the server until it is at minimum security level and
 * maximum money.  Rinse and repeat.
 *
 * @param ns The Netscript API.
 * @param host Hack money from this server.
 * @param frac The fraction of money to steal.
 */
async function hack(ns, host, frac) {
    const max = 100e6;
    const money_init = ns.getServerMoneyAvailable(home);
    const money_raised = () => ns.getServerMoneyAvailable(home) - money_init;
    const has_enough_money = () => money_raised() >= max;
    while (!has_enough_money()) {
        await prep_server(ns, host);
        const botnet = assemble_botnet(ns, host, frac);
        await hgw_action(ns, host, botnet, hgw.action.HACK);
        await ns.sleep(0);
    }
}

/**
 * Prep a target server.
 *
 * @param ns The Netscript API.
 * @param host Hostname of the server to prep.
 */
async function prep_server(ns, host) {
    switch (host) {
        case server.FOOD:
            await prep_gw(ns, host);
            break;
        case server.JOES:
            await prep_gw(ns, host);
            break;
        case server.NOODLES:
            await prep_gw(ns, host);
            break;
        case server.PHANTASY:
            await prep_wg(ns, host);
            break;
        case server.SIGMA:
            await prep_gw(ns, host);
            break;
        default:
            // Should never reach here.
            assert(false);
    }
}

/**
 * Use a sequential batcher to determine how long it takes to raise $100m.  The
 * batcher pools the resources of world servers to hack a common target. This
 * script accepts the following command line arguments:
 *
 * (1) serverName := Hostname of server to hack.
 * (2) fraction := The fraction of money to steal from the target server.
 *
 * Usage: run quack/test/hgw/100million.js [serverName] [fraction]
 * Example: run quack/test/hgw/100million.js joesguns 0.2
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const [target, fr] = ns.args;
    const frac = parseFloat(fr);
    assert(ns.getServerMaxMoney(target) > 0);
    assert(frac > 0 && frac <= 1);

    // Data prior to hacking.
    let time = Date.now();
    let hack_xp = ns.getPlayer().exp.hacking;
    let hack_stat = ns.getPlayer().skills.hacking;

    // HGW actions.
    await hack(ns, target, frac);

    // Data after hacking.
    time = to_second(Date.now() - time);
    const time_fmt = ns.nFormat(time, "00:00:00");
    hack_xp = ns.getPlayer().exp.hacking - hack_xp;
    const hack_rate = hack_xp / time;
    hack_stat = ns.getPlayer().skills.hacking - hack_stat;
    log(ns, `${target}: ${time_fmt}, ${hack_stat}, ${hack_xp}, ${hack_rate}`);
}
