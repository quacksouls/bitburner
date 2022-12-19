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
import { hgw_action, nuke_servers, prep_mwg } from "/lib/hgw.js";
import { assert, can_run_script, num_threads } from "/lib/util.js";

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
 * @return An array of hostnames.  The servers provide at most the required
 *     number of threads needed to hack a fraction of a server's money.
 */
function assemble_botnet(ns, host) {
    const s = hgw.script.HACK;
    const nthread = (serv) => num_threads(ns, s, serv);
    const descending = (a, b) => nthread(b) - nthread(a);
    const money = target_money(ns, host);
    const threads = ns.hackAnalyzeThreads(host, money);
    const botnet = [];
    let n = 0;
    nuke_servers(ns)
        .filter((serv) => can_run_script(ns, s, serv))
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
 */
async function hack(ns, host) {
    for (;;) {
        await prep_mwg(ns, host);
        const botnet = assemble_botnet(ns, host);
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
 * @return The amount of money to steal from the given server.
 */
function target_money(ns, host) {
    return Math.floor(hgw.MONEY_PERCENT * ns.getServer(host).moneyMax);
}

/**
 * A proto-batcher.  Each of the hack, grow, and weaken functions is separated
 * into its own script.  When we need a particular HGW action, we launch the
 * appropriate script against a target server.  We pool the resources of all
 * world servers, excluding our home server and purchased servers.
 *
 * Usage: run hgw/go.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const target = "n00dles";
    assert(ns.getServerMaxMoney(target) > 0);
    await hack(ns, target);
}
