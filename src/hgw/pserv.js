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
import { pserv } from "/quack/lib/constant/pserv.js";
import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { find_candidates } from "/quack/lib/hgw.js";
import { log } from "/quack/lib/io.js";
import { network } from "/quack/lib/network.js";
import { Player } from "/quack/lib/player.js";
import { PurchasedServer } from "/quack/lib/pserv.js";
import { Server } from "/quack/lib/server.js";
import { assert, is_bankrupt } from "/quack/lib/util.js";

/**
 * Buy servers, each having as high an amount of RAM as we can afford.
 *
 * @param ns The Netscript API.
 */
async function buy_servers(ns) {
    const psv = new PurchasedServer(ns);
    const default_ram = pserv.DEFAULT_RAM_HGW;
    // By default, we want to purchase pserv.MIN_HGW servers.  As for the
    // remaining servers that make up the number to reach the maximum number of
    // purchased servers, we wait until we have enough money to purchase each of
    // them.  The constant pserv.MIN_HGW should be a small number so we can
    // bootstrap a source of passive income and Hack XP.
    let ram = pserv_ram(ns, pserv.MIN_HGW);
    if (ram <= default_ram) {
        // Try to purchase servers, each with the default amount of RAM.
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
 * Deploy a sequential batcher to a purchased server.  Use the server to hack
 * a chosen target.
 *
 * @param ns The Netscript API.
 * @param phost Run a sequential batcher on this purchased server.
 * @param host Hostname of the server to target.
 */
function deploy(ns, phost, host) {
    const script = pserv.PBATCH;
    const nthread = 1;
    const frac = pserv.DEFAULT_MONEY_FRAC;
    assert(!is_bankrupt(ns, host));
    const target = new Server(ns, host);
    assert(target.gain_root_access());
    ns.exec(script, home, nthread, phost, target.hostname(), frac);
}

/**
 * Whether we have the maximum number of purchased servers.
 *
 * @param ns The Netscript API.
 * @return True if we already have the maximum number of purchased servers;
 *     false otherwise.
 */
function has_max_pserv(ns) {
    const player = new Player(ns);
    const psv = new PurchasedServer(ns);
    return player.pserv().length === psv.limit();
}

/**
 * Kill all sequential batcher scripts.
 *
 * @param ns The Netscript API.
 */
function kill_batchers(ns) {
    // Array of hostnames of purchased servers.
    const purchased_server = ns.getPurchasedServers();
    if (purchased_server.length < 1) {
        return;
    }
    // Array of hostnames of world servers.
    let target = network(ns);
    assert(target.length > 0);
    // Fraction of money to steal from a server.
    const frac = pserv.DEFAULT_MONEY_FRAC;
    const s = pserv.PBATCH;

    // Which world server is the given purchased server targeting?
    const find_target = (phost, candidate) => {
        for (const host of candidate) {
            if (ns.isRunning(s, home, phost, host, frac)) {
                return host;
            }
        }
    };
    purchased_server.forEach((phost) => {
        const host = find_target(phost, target);
        if (host === undefined) {
            return;
        }
        ns.kill(s, home, phost, host, frac);
        target = target.filter((t) => t !== host);
    });
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
        kill_batchers(ns);
        psv.kill_all();
        await update(ns, ram);
    } else if (server.ram_max() === ram) {
        // The current purchased servers have the same amount of RAM as our
        // target RAM.  Continue purchasing more servers with the current
        // amount of RAM.
        ns.print(msg);
        await update(ns, ram);
    } else {
        // Each current purchased server has more RAM than the given amount of
        // RAM.
        assert(ram < server.ram_max());
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
    let ram = psv.valid_ram().filter((r) => r >= pserv.DEFAULT_RAM_HGW);
    ram = MyArray.sort_descending(ram);
    // Let's see whether we can purchase servers, each having the given amount
    // of RAM.  Start with the highest amount of RAM.  See if we can buy at
    // least minserv servers, each with the given amount of RAM.  If not, then
    // decrease the amount of RAM and repeat the above process.
    const player = new Player(ns);
    const can_afford = (r) => minserv * psv.cost(r) < player.money();
    ram = ram.filter(can_afford);
    return ram.length > 0 ? ram[0] : 0;
}

/**
 * Reboot our sequential batchers after (possibly) reloading the game.
 *
 * @param ns The Netscript API.
 */
function reboot(ns) {
    // We do not have any purchased servers.
    const purchased_server = ns.getPurchasedServers();
    if (purchased_server.length < 1) {
        return;
    }
    // Kill all sequential batcher scripts and all scripts on purchased servers.
    kill_batchers(ns);
    purchased_server.forEach((phost) => ns.killall(phost));
    // Launch a sequential batcher script for each purchased server.
    const candidate = find_candidates(ns);
    let k = 0;
    purchased_server.forEach((phost) => {
        const host = candidate[k];
        deploy(ns, phost, host);
        k++;
        if (k >= candidate.length) {
            k = 0;
        }
    });
}

/**
 * Suppress various log messages.
 *
 * @param ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("scan");
    ns.disableLog("sleep");
}

/**
 * This is the early stage, where it is assumed we are starting the game or
 * have just installed a bunch of Augmentations.
 *
 * @param ns The Netscript API.
 */
async function stage_one(ns) {
    // Do we already have the maximum number of purchased servers?
    const psv = new PurchasedServer(ns);
    const default_ram = pserv.DEFAULT_RAM_HGW;
    if (has_max_pserv(ns)) {
        const msg = `RAM: ${default_ram}. Already has max pserv.`;
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
    assert(server.ram_max() === default_ram);
    ns.print(msg);
    await update(ns, default_ram);
}

/**
 * Purchase the maximum number of servers and run our sequential batcher on
 * those servers.  The function chooses the "best" targets to hack.
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
    // Each purchased server targets a different world server.
    const candidate = find_candidates(ns).filter(
        (host) => !is_bankrupt(ns, host)
    );
    if (candidate.length === 0) {
        return;
    }
    let k = 0;
    const script = pserv.PBATCH;
    const has_funds = () => player.money() > psv.cost(server_ram);
    while (i < psv.limit()) {
        const serv = new Server(ns, home);
        if (has_funds() && serv.num_threads(script) > 0) {
            // Purchase a server.  Choose the best target server.
            const hostname = psv.purchase(pserv.PREFIX, server_ram);
            const host = candidate[k];
            deploy(ns, hostname, host);
            i++;
            k++;
            if (k >= candidate.length) {
                k = 0;
            }
        }
        await ns.sleep(wait_t.DEFAULT);
    }
}

/**
 * A sequential batcher that uses purchased servers.
 *
 * Continuously try to purchase servers and use those to hack world servers.
 * If our funds are sufficient, try to upgrade to servers with higher amounts
 * of RAM.  Each purchased server uses HGW algorithms to prep and hack world
 * servers.
 *
 * Usage: run quack/hgw/pserv.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    log(ns, "Sequential batcher for purchased servers");
    shush(ns);
    reboot(ns);
    // Continuously try to purchase more powerful servers.
    for (;;) {
        await buy_servers(ns);
        await ns.sleep(wait_t.MINUTE);
    }
}
