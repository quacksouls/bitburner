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

import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { has_gang_api } from "/quack/lib/source.js";
import { exec, has_all_popen } from "/quack/lib/util.js";
import { has_wse_api } from "/quack/lib/wse.js";

/**
 * Let sleeves commit homicide to lower karma as necessary so we can create a
 * gang.  If we already have a gang, commit larceny to farm Intelligence XP.
 *
 * @param {NS} ns The Netscript API.
 * @param {array} pid An array of PIDs.  Use this to keep track of PIDs of
 *     scripts of interest.
 * @returns {Promise<array>} The same as pid, but with added elements as
 *     necessary.
 */
async function commit_crime(ns, pid) {
    const new_pid = Array.from(pid);
    if (has_gang_api(ns)) {
        if (ns.gang.inGang()) {
            exec(ns, "/quack/sleeve/larceny.js");
        } else {
            const pidh = exec(ns, "/quack/sleeve/homicide.js");
            new_pid.push(pidh);
        }
    }
    await ns.sleep(wait_t.DEFAULT);
    return new_pid;
}

/**
 * Create port opener programs.
 *
 * @param {NS} ns The Netscript API.
 * @param {array} pid An array of PIDs.  Use this to keep track of PIDs of
 *     scripts of interest.
 * @returns {Promise<array>} The same as pid, but with added elements as
 *     necessary.
 */
async function create_popen(ns, pid) {
    const new_pid = Array.from(pid);
    const pidp = exec(ns, "/quack/singularity/popen.js");
    new_pid.push(pidp);

    // Wait until we have all port opener programs.
    while (!has_all_popen(ns)) {
        await ns.sleep(wait_t.DEFAULT);
    }
    return new_pid;
}

/**
 * Kill various scripts.
 *
 * @param {NS} ns The Netscript API.
 * @param {array} pid An array of PIDs.
 */
function kill_scripts(ns, pid) {
    pid.forEach((p) => ns.kill(p));
    const nthread = 1;
    ns.exec("/quack/kill-script.js", home, nthread, "world");
}

/**
 * Launch our trade bot.
 *
 * @param {NS} ns The Netscript API.
 */
function launch_trade_bot(ns) {
    if (has_wse_api(ns)) {
        exec(ns, "/quack/stock/trade.js");
        return;
    }
    exec(ns, "/quack/stock/pre4s.js");
}

/**
 * Launch our gang manager.
 *
 * @param {NS} ns The Netscript API.
 */
async function manage_gang(ns) {
    if (has_gang_api(ns) && !ns.gang.inGang()) {
        exec(ns, "/quack/sleeve/larceny.js");
    }
    await ns.sleep(wait_t.DEFAULT);
    exec(ns, "/quack/gang/snek.js");
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
}

/**
 * Manage the gameplay in "BitNode-8: Ghost of Wall Street".
 *
 * Usage: run quack/chain/ghost.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    launch_trade_bot(ns);

    // Launch various scripts, let them run for a while, then kill.
    let pid = [];
    pid.push(exec(ns, "/quack/hgw/xp.js"));
    pid = await commit_crime(ns, pid);
    pid = await create_popen(ns, pid);
    kill_scripts(ns, pid);

    // Launch other scripts.
    await manage_gang(ns);
    exec(ns, "/quack/faction/go.js");
}
