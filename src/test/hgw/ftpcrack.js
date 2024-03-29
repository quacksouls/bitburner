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

import { home } from "/quack/lib/constant/server.js";
import { darkweb } from "/quack/lib/constant/tor.js";
import { assemble_botnet, hgw_hack, prep_mwg } from "/quack/lib/hgw.js";
import { log } from "/quack/lib/io.js";
import { assert, to_second } from "/quack/lib/util.js";

/**
 * Continuously hack a server.  Steal a certain percentage of the server's
 * money, then weaken/grow the server until it is at minimum security level and
 * maximum money.  Rinse and repeat.
 *
 * @param ns The Netscript API.
 * @param host Hack this server.
 * @param frac The fraction of money to steal.
 */
async function hack(ns, host, frac) {
    const threshold = darkweb.program.ftpcrack.COST + darkweb.tor.COST;
    const enough_money = () => ns.getServerMoneyAvailable(home) >= threshold;
    while (!enough_money()) {
        await prep_mwg(ns, host);
        const botnet = assemble_botnet(ns, host, frac);
        await hgw_hack(ns, host, botnet);
        await ns.sleep(0);
    }
}

/**
 * Use a proto-batcher to determine how long it takes to raise enough money to
 * purchase both the TOR router as well as the FTPCrack.exe program.
 *
 * Each of the hack, grow, and weaken functions is separated into its own
 * script.  When we need a particular HGW action, we launch the appropriate
 * script against a target server.  We pool the resources of all world servers,
 * excluding our home server and purchased servers.  This script accepts two
 * command line arguments:
 *
 * (1) targetServer := Hostname of server to target.
 * (2) moneyFraction := The fraction of money to steal from the given target
 *     server.
 *
 * Usage: run quack/test/hgw/ftpcrack.js [targetServer] [moneyFraction]
 * Example: run quack/test/hgw/ftpcrack.js n00dles 0.2
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const [target, frac] = ns.args;
    assert(ns.getServerMaxMoney(target) > 0);
    const pfrac = () => parseFloat(frac);
    assert(pfrac() > 0 && pfrac() <= 1);
    // Data prior to hacking.
    let time = Date.now();
    let hack_xp = ns.getPlayer().exp.hacking;
    let hack_stat = ns.getPlayer().skills.hacking;
    // HGW actions.
    await hack(ns, target, pfrac());
    // Data after hacking.
    time = to_second(Date.now() - time);
    const time_fmt = ns.nFormat(time, "00:00:00");
    hack_xp = ns.getPlayer().exp.hacking - hack_xp;
    const hack_rate = hack_xp / time;
    hack_stat = ns.getPlayer().skills.hacking - hack_stat;
    log(ns, `${target}: ${time_fmt}, ${hack_stat}, ${hack_xp}, ${hack_rate}`);
}
