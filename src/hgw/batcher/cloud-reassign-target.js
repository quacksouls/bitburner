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

import { MyArray } from "/quack/lib/array.js";
import { empty_string } from "/quack/lib/constant/misc.js";
import { pserv } from "/quack/lib/constant/pserv.js";
import { home } from "/quack/lib/constant/server.js";
import { find_candidates } from "/quack/lib/hgw.js";
import { PurchasedServer } from "/quack/lib/pserv.js";
import {
    assert,
    has_formulas,
    is_empty_string,
} from "/quack/lib/util.js";

// All servers being targeted right now.
const current_target = (phost) => {
    // The world server that this purchased server is targeting.
    // eslint-disable-next-line max-len
    const is_running = (target) => ns.isRunning(pserv.BATCH, home, phost, target);
    return candidate.find(is_running);
};
const targets = ns.cloud.getServerNames().map(current_target);

/**
 * Choose a world server to target.
 *
 * @param {NS} ns The Netscript API.
 * @returns {string} Hostname of a world server to target.  Empty string if no
 *     suitable target can be found.
 */
function find_target(ns) {
    let candidate = find_candidates(ns);

    // Exclude the servers being targeted.
    const not_target = (host) => !targets.includes(host);
    candidate = candidate.filter(not_target);
    return MyArray.is_empty(candidate) ? empty_string : candidate[0];
}

function reassign_target(ns) {
  const psv = new PurchasedServer(ns);
  const script = pserv.BATCH;

  for (const server of psv.farm()) {
    ns.killall(server);
    const target = find_target(ns);
    if (is_empty_string(target)) {
        continue;
    }
    const option = { preventDuplicates: true, threads: 1 };
    ns.exec(script, home, option, server, target);
  }
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMaxRam");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("scan");
    ns.disableLog("sleep");
}

/**
 * WARNING: Requires the program Formulas.exe.
 *
 * Manage a farm of purchased servers, each running a parallel batcher.  Like
 * AWS cloud computing.
 *
 * Usage: run quack/hgw/batcher/cloud.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    assert(has_formulas(ns));

    for (;;) {
      reassign_target(ns);
      await ns.sleep(1800e3);
    }
}
