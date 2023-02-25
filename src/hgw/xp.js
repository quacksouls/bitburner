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

import { hgw } from "/quack/lib/constant/misc.js";
import { home, server } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { nuke_servers, prep_wg } from "/quack/lib/hgw.js";
import { log } from "/quack/lib/io.js";
import { assert, can_run_script, num_threads } from "/quack/lib/util.js";

/**
 * Prep a server, then spam grow to grind Hack XP.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Use this server to grind Hack XP.
 */
async function grind(ns, host) {
    await prep_wg(ns, host);
    for (;;) {
        grow_server(ns, host, nuke_servers(ns));
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * Perform the grow action against a server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Grow this server.  Cannot be our home server.
 * @param {array} botnet An array of world servers to which we have root access.
 *     Use these servers to grow the given target.  Cannot be empty array.
 */
function grow_server(ns, host, botnet) {
    assert(host !== "");
    assert(host !== home);
    assert(botnet.length > 0);

    const s = hgw.script.GROW;
    const can_run = (serv) => can_run_script(ns, s, serv);
    const nthread = (serv) => num_threads(ns, s, serv);
    const exec = (serv) => ns.exec(s, serv, nthread(serv), host, Date.now());
    botnet.filter(can_run).map(exec);
}

/**
 * Pool the resources of world servers to grind Hack XP.  Exclude our home
 * server and purchased servers.
 *
 * Usage: run quack/hgw/xp.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const host = server.JOES;
    log(ns, `Grind Hack XP from ${host}`);
    await grind(ns, host);
}
