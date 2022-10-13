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

import { MyArray } from "/lib/array.js";
import { pserv } from "/lib/constant/pserv.js";
import { wait_t } from "/lib/constant/time.js";
import { network } from "/lib/network.js";
import { Player } from "/lib/player.js";
import { PurchasedServer } from "/lib/pserv.js";
import { Server } from "/lib/server.js";
import {
    assert,
    choose_best_server,
    choose_targets,
    filter_bankrupt_servers,
    is_bankrupt,
} from "/lib/util.js";

/**
 * Buy servers, each having as high an amount of RAM as we can afford.
 *
 * @param ns The Netscript API.
 */
async function buy_servers(ns) {
    // The amount of RAM for each purchased server.  If 0, we try to purchase
    // servers where the amount of RAM allows us to run our hack script using
    // 2 threads.
    const psv = new PurchasedServer(ns);
    const default_ram = psv.default_ram();
    // By default, we want to purchase min_pserv servers.  As for the remaining
    // servers that make up the number to reach the maximum number of purchased
    // servers, we wait until we have enough money to purchase each of them.
    // The constant min_pserv should be a small number so we can bootstrap a
    // source of passive income and Hack XP.
    let ram = pserv_ram(ns, pserv.MIN);
    if (ram <= default_ram) {
        // Try to purchase servers, each with the default amount of ram.
        await stage_one(ns);
        return;
    }
    // Here we assume we already have purchased servers, each with the default
    // amount of RAM.  Now try to purchase servers, each with a higher amount
    // of RAM than the default amount.  We wait to accumulate enough money to
    // purchase the maximum number of servers.
    ram = pserv_ram(ns, psv.limit());
    if (ram <= default_ram) {
        return;
    }
    assert(ram > default_ram);
    await next_stage(ns, ram);
}

/**
 * Whether we have the maximum number of purchased servers.
 *
 * @param ns The Netscript API.
 * @return true if we already have the maximum number of purchased servers;
 *     false otherwise.
 */
function has_max_pserv(ns) {
    const player = new Player(ns);
    const psv = new PurchasedServer(ns);
    return player.pserv().length == psv.limit();
}

/**
 * Purchase servers that have more than the default amount of RAM.  Call this
 * function multiple times with different arguments to upgrade our purchased
 * servers to higher RAM.
 *
 * @param ns The Netscript API.
 * @param ram The amount of RAM for each purchased server.
 */
async function next_stage(ns, ram) {
    const psv = new PurchasedServer(ns);
    assert(psv.is_valid_ram(ram));
    // If we have zero purchased servers, then buy servers with the given
    // amount of RAM.
    const player = new Player(ns);
    const current_pserv = player.pserv();
    const msg = `Buy servers with RAM: ${ram}`;
    if (current_pserv.length < 1) {
        ns.print(msg);
        await update(ns, ram);
        return;
    }
    // Assume we have at least 1 purchased server.
    assert(current_pserv.length > 0);
    const server = new Server(ns, current_pserv[0]);
    if (server.ram_max() < ram) {
        // If each purchased server has less than the given amount of RAM, then
        // delete the servers and purchase servers with the given amount of RAM.
        ns.print(msg);
        psv.kill_all();
        await update(ns, ram);
    } else if (server.ram_max() == ram) {
        // The current purchased servers have the same amount of RAM as our
        // target RAM.  Continue purchasing more servers with the current
        // amount of RAM.
        ns.print(msg);
        await update(ns, ram);
    } else {
        // Each current purchased server has more RAM than the given amount of
        // RAM.
        assert(ram < server.ram_max());
        return;
    }
}

/**
 * The possible amount of RAM for each purchased server.
 *
 * @param ns The Netscript API.
 * @param minserv The minimum number of servers to buy.  Must be a positive
 *     integer.
 * @return The amount of RAM for each purchased server.  Return 0 if we cannot
 *     afford the given number of purchased servers.
 */
function pserv_ram(ns, minserv) {
    assert(minserv > 0);
    // The possible amount of RAM for a purchased server.  We want the lowest
    // value to be the default amount of RAM.
    const psv = new PurchasedServer(ns);
    const default_ram = psv.default_ram();
    let ram = [default_ram];
    for (const r of psv.valid_ram()) {
        if (r > default_ram) {
            ram.push(r);
        }
    }
    // Sort the array of RAM in descending order.
    const array = new MyArray();
    ram = array.sort_descending(ram);
    // Let's see whether we can purchase servers, each having the given amount
    // of RAM.  Start with the highest amount of RAM.  See if we can buy at
    // least minserv servers, each with the given amount of RAM.  If not, then
    // decrease the amount of RAM and repeat the above process.
    const player = new Player(ns);
    let psram = 0;
    for (const r of ram) {
        const cost = minserv * psv.cost(r);
        if (cost > player.money()) {
            continue;
        }
        psram = r;
        break;
    }
    return psram;
}

/**
 * Obtain a new batch of target servers to hack.  Exclude bankrupt servers.
 *
 * @param ns The Netscript API.
 * @param target An array of current targets.
 * @return A possibly new array of more targets to hack.
 */
function renew_targets(ns, target) {
    if (target.length < 1) {
        target = filter_bankrupt_servers(ns, choose_targets(ns, network(ns)));
        assert(target.length > 0);
    }
    return target;
}

/**
 * This is the early stage, where it is assumed we are starting the game or
 * have just installed a bunch of Augmentations.  Each purchased server should
 * have a small amount of RAM, enough to run our hacking script using at least
 * 2 threads.
 *
 * @param ns The Netscript API.
 */
async function stage_one(ns) {
    // Do we already have the maximum number of purchased servers?
    const psv = new PurchasedServer(ns);
    const default_ram = psv.default_ram();
    if (has_max_pserv(ns)) {
        const msg = `RAM: ${default_ram}.  Already has max pserv.`;
        ns.print(msg);
        return;
    }
    // If we have zero purchased servers, then start with purchased servers
    // that have the default amount of RAM.
    const player = new Player(ns);
    const current_pserv = player.pserv();
    const msg = `Buy servers with default RAM: ${default_ram}`;
    if (current_pserv.length < 1) {
        ns.print(msg);
        await update(ns, default_ram);
        return;
    }
    // Assume we have at least 1 purchased server.
    assert(current_pserv.length > 0);
    assert(current_pserv.length < psv.limit());
    const server = new Server(ns, current_pserv[0]);
    // Skip the stage if a current purchased server has more than the default
    // amount of RAM.
    if (default_ram < server.ram_max()) {
        return;
    }
    assert(server.ram_max() == default_ram);
    ns.print(msg);
    await update(ns, default_ram);
}

/**
 * Purchase the maximum number of servers and run our hack script on those
 * servers.  The function chooses the "best" targets to hack.
 *
 * @param ns The Netscript API.
 * @param ram The amount of RAM for each purchased server.  Must be a positive
 *     integer and a power of 2.
 */
async function update(ns, ram) {
    // The amount of RAM must be a power of 2.  RAM is assumed to be in GB.
    const psv = new PurchasedServer(ns);
    const server_ram = Math.floor(ram);
    assert(psv.is_valid_ram(server_ram));
    // Continuously try to purchase a new server until we have reached the
    // maximum number of servers we can buy.
    const player = new Player(ns);
    let i = player.pserv().length;
    let target = new Array();
    while (i < psv.limit()) {
        // Do we have enough money to buy a new server?
        if (player.money() > psv.cost(server_ram)) {
            // Purchase a new server.
            const hostname = psv.purchase(pserv.PREFIX, server_ram);
            const server = new Server(ns, hostname);
            // Choose the best target server.
            target = renew_targets(ns, target);
            const s = choose_best_server(ns, target);
            assert(!is_bankrupt(ns, s));
            const target_server = new Server(ns, s);
            target = target.filter((s) => s != target_server.hostname());
            // Run our hack script on the purchased server.
            assert(await target_server.gain_root_access());
            assert(await server.deploy(target_server.hostname()));
            i++;
        }
        await ns.sleep(wait_t.DEFAULT);
    }
}

/**
 * Continuously try to purchase servers and use those to hack world servers.
 * If our funds are sufficient, try to upgrade to servers with higher amounts
 * of RAM.
 *
 * Usage: run buy-server.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("scan");
    ns.disableLog("sleep");
    // Continuously try to purchase servers.
    while (true) {
        await buy_servers(ns);
        await ns.sleep(wait_t.MINUTE);
    }
}
