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
import { PurchasedServer } from "/quack/lib/pserv.js";
import {
    assert,
    has_formulas,
} from "/quack/lib/util.js";

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
 * Upgrade the RAM of an existing purchased server.
 *
 * @param {NS} ns The Netscript API.
 */
function upgrade_server(ns) {
    const psv = new PurchasedServer(ns);
    const farm = psv.farm()
    const smallestCurrRam = farm.reduce((min, server) => {
        return Math.min(min, ns.getServerMaxRam(server));
    }, Infinity);
    farm.forEach((server) => {
      if (ns.getServerMaxRam(server) > smallestCurrRam) return
      psv.upgrade(server, 2 * smallestCurrRam)
    });
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
        upgrade_server(ns);
        await ns.sleep(300e3);
    }
}
