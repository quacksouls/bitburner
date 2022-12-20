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

import { darkweb, hgw } from "/lib/constant/misc.js";
import { home } from "/lib/constant/server.js";
import { hgw_action, nuke_servers, prep_mwg } from "/lib/hgw.js";
import { log } from "/lib/io.js";
import {
    assert, can_run_script, num_threads, to_second,
} from "/lib/util.js";

/**
 * Choose the servers from our botnet to use for hacking.  The servers are
 * chosen such that the total number of threads they offer allow us to steal a
 * certain percentage of a target's money.  Essentially, the problem is this.
 * We know we need n threads to steal a fraction of a target's money.  Choose
 * servers from among our botnet that would allow us to hack using n threads or
 * thereabout.  This is an instance of the money changing problem.  Use a greedy
 * approach by considering the server on which we can run a script using the
 * most number of threads.  Work our way down to the server on which we can run
 * using the least number of threads.
 *
 * @param ns The Netscript API.
 * @param host Hack this server.
 * @param percent The percentage of money to steal.
 * @return An array of hostnames.  The servers provide at most the required
 *     number of threads needed to hack a fraction of a server's money.
 */
function assemble_botnet(ns, host, percent) {
    const s = hgw.script.HACK;
    const nthread = (serv) => num_threads(ns, s, serv);
    const descending = (a, b) => nthread(b) - nthread(a);
    const has_ram_to_run_script = (serv) => can_run_script(ns, s, serv);
    const money = target_money(ns, host, percent);
    const threads = ns.hackAnalyzeThreads(host, money);
    const botnet = [];
    let n = 0;
    nuke_servers(ns)
        .filter(has_ram_to_run_script)
        .sort(descending)
        .forEach((serv) => {
            const k = nthread(serv);
            if (n + k <= threads) {
                botnet.push(serv);
                n += k;
            }
        });
    assert(botnet.length > 0);
    return botnet;
}

/**
 * Continuously hack a server.  Steal a certain percentage of the server's
 * money, then weaken/grow the server until it is at minimum security level and
 * maximum money.  Rinse and repeat.
 *
 * @param ns The Netscript API.
 * @param host Hack this server.
 * @param percent The percentage of money to steal.
 */
async function hack(ns, host, percent) {
    const threshold = darkweb.program.brutessh.COST + darkweb.tor.COST;
    const enough_money = () => ns.getServerMoneyAvailable(home) >= threshold;
    while (!enough_money()) {
        await prep_mwg(ns, host);
        const botnet = assemble_botnet(ns, host, percent);
        await hgw_action(ns, host, botnet, hgw.action.HACK);
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
 * @param percent The percentage of money to steal.
 * @return The amount of money to steal from the given server.
 */
function target_money(ns, host, percent) {
    return Math.floor(percent * ns.getServer(host).moneyMax);
}

/**
 * Use a proto-batcher to determine how long it takes to raise enough money to
 * purchase both the TOR router as well as the BruteSSH.exe program.
 *
 * Each of the hack, grow, and weaken functions is separated into its own
 * script.  When we need a particular HGW action, we launch the appropriate
 * script against a target server.  We pool the resources of all world servers,
 * excluding our home server and purchased servers.  This script accepts a
 * command line argument, i.e. the percentage of money to steal from a server.
 *
 * Usage: run test/hgw/brutessh.js [moneyPercent]
 * Example: run test/hgw/brutessh.js 0.2
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const target = "n00dles";
    assert(ns.getServerMaxMoney(target) > 0);
    const percent = parseFloat(ns.args[0]);
    // Data prior to hacking.
    let time = Date.now();
    let hack_xp = ns.getPlayer().exp.hacking;
    let hack_stat = ns.getPlayer().skills.hacking;
    // HGW actions.
    await hack(ns, target, percent);
    // Data after hacking.
    time = to_second(Date.now() - time);
    const time_fmt = ns.nFormat(time, "00:00:00");
    hack_xp = ns.getPlayer().exp.hacking - hack_xp;
    const hack_rate = hack_xp / time;
    hack_stat = ns.getPlayer().skills.hacking - hack_stat;
    log(ns, `${target}: ${time_fmt}, ${hack_stat}, ${hack_xp}, ${hack_rate}`);
}
