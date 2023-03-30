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
import { hgw } from "/quack/lib/constant/hgw.js";
import { empty_string } from "/quack/lib/constant/misc.js";
import { pserv } from "/quack/lib/constant/pserv.js";
import { home, home_t } from "/quack/lib/constant/server.js";
import { find_candidates } from "/quack/lib/hgw.js";
import { money } from "/quack/lib/money.js";
import { PurchasedServer } from "/quack/lib/pserv.js";
import {
    assert,
    can_run_script,
    has_formulas,
    is_empty_string,
} from "/quack/lib/util.js";

/**
 * Purchase a server.
 *
 * @param {NS} ns The Netscript API.
 */
function buy_server(ns) {
    // Sanity checks.
    const script = pserv.PROTO_BATCH;
    if (!can_run_script(ns, script, home)) {
        return;
    }
    const psv = new PurchasedServer(ns);
    if (psv.has_max()) {
        return;
    }
    const cost = psv.cost(pserv.DEFAULT_RAM_HGW);
    if (money(ns) < cost) {
        return;
    }

    // Purchase a server and launch a proto batcher on it.
    const target = find_target(ns);
    if (is_empty_string(target)) {
        return;
    }
    const host = psv.purchase(pserv.PREFIX, pserv.DEFAULT_RAM_HGW);
    const nthread = 1;
    ns.exec(script, home, nthread, host, target);
}

/**
 * Choose a world server to target.
 *
 * @param {NS} ns The Netscript API.
 * @returns {string} Hostname of a world server to target.  Empty string if no
 *     suitable target can be found.
 */
function find_target(ns) {
    let candidate = find_candidates(ns);

    // All servers being targeted right now.
    const script = pserv.PROTO_BATCH;
    const current_target = (phost) => {
        for (const target of candidate) {
            if (ns.isRunning(script, home, phost, target)) {
                return target;
            }
        }
    };
    const targets = ns.getPurchasedServers().map(current_target);

    // Exclude the servers being targeted.
    const not_target = (host) => !targets.includes(host);
    candidate = candidate.filter(not_target);
    return MyArray.is_empty(candidate) ? empty_string : candidate[0];
}

/**
 * Purchase and update our farm of servers.
 *
 * @param {NS} ns The Netscript API.
 */
function update(ns) {
    buy_server(ns);
    upgrade_server(ns);
}

/**
 * Upgrade the RAM of an existing purchased server.
 *
 * @param {NS} ns The Netscript API.
 */
function upgrade_server(ns) {
    const psv = new PurchasedServer(ns);
    const can_upgrade = (host) => psv.max_ram(host) < hgw.PSERV_MAX_RAM;
    const upgrade_ram = (host) => psv.upgrade(host, 2 * psv.max_ram(host));
    psv.farm().filter(can_upgrade).forEach(upgrade_ram);
}

/**
 * WARNING: Requires the program Formulas.exe.
 *
 * Manage a farm of purchased servers, each running a proto batcher.  Like AWS
 * cloud computing.
 *
 * Usage: run quack/hgw/batcher/cloud.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    assert(has_formulas(ns));
    for (;;) {
        update(ns);
        if (
            ns.getServer(home).maxRam < home_t.RAM_HIGH
            && ns.getPurchasedServers().length >= pserv.SMALL_FARM
        ) {
            return;
        }
        await ns.sleep(pserv.TICK);
    }
}
