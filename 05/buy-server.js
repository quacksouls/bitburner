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

import {
    assert,
    choose_best_server,
    choose_targets,
    copy_and_run,
    filter_bankrupt_servers,
    minutes_to_milliseconds,
    network,
    Player,
    PurchasedServer,
    seconds_to_milliseconds,
    Server,
} from "./libbnr.js";

/**
 * Whether we have the maximum number of purchased servers.
 *
 * @param ns The Netscript API.
 * @return true if we already have the maximum number of purchased servers;
 *     false otherwise.
 */
function has_max_pserv(ns) {
    const player = new Player(ns);
    const pserv = new PurchasedServer(ns);
    if (player.pserv().length < pserv.limit()) {
        return false;
    }
    return true;
}

/**
 * Obtain a new batch of target servers to hack.
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
 * Whether to skip a stage.
 *
 * @param ns The Netscript API.
 * @param ram The RAM threshold.
 * @param money The money threshold.
 * @return true if a particular stage should be skipped; false otherwise.
 */
function skip_stage(ns, ram, money) {
    const SKIP = true; // Skip a stage.
    const NO_SKIP = !SKIP; // Do not skip a stage.
    assert(ram > 0);
    assert(money > 0);

    // Skip the stage if our money is at least the threshold.
    const player = new Player(ns);
    if (player.money_available() >= money) {
        return SKIP;
    }

    // Do not skip the stage if we have zero purchased servers.
    const current_pserv = player.pserv();
    if (current_pserv.length < 1) {
        return NO_SKIP;
    }

    // Skip the stage if each purchased server has more than the
    // given amount of RAM.
    assert(current_pserv.length > 0);
    const server = new Server(ns, current_pserv[0]);
    if (server.ram_max() > ram) {
        return SKIP;
    }

    // Skip the stage if we have the maximum number of purchased servers
    // and each server has the given amount of RAM.
    if (has_max_pserv(ns) && server.ram_max() == ram) {
        return SKIP;
    }

    return NO_SKIP;
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
    // Do we skip this stage?
    const million = 10 ** 6;
    const ten_million = 10 * million;
    const pserv = new PurchasedServer(ns);
    if (skip_stage(ns, pserv.default_ram(), ten_million)) {
        return;
    }
    if (has_max_pserv(ns)) {
        return;
    }

    // If we have zero purchased servers, then start with purchased servers
    // that have the default amount of RAM.
    const player = new Player(ns);
    const current_pserv = player.pserv();
    if (current_pserv.length < 1) {
        await update(ns, pserv.default_ram());
        return;
    }

    // Assume we have at least 1 purchased server.  Furthermore, each purchased
    // server has the default amount of RAM.
    assert(current_pserv.length > 0);
    assert(current_pserv.length < pserv.limit());
    const server = new Server(ns, current_pserv[0]);
    assert(server.ram_max() == pserv.default_ram());
    await update(ns, pserv.default_ram());
}

/**
 * Here we purchase servers that have more than the default amount of RAM.
 * Call this function multiple times with different arguments to upgrade our
 * purchased servers to higher RAM.
 *
 * @param ns The Netscript API.
 * @param ram The threshold for RAM.
 * @param money The threshold for money.
 */
async function next_stage(ns, ram, money) {
    const pserv = new PurchasedServer(ns);
    assert(pserv.is_valid_ram(ram));
    assert(money > 0);

    // Do we skip this stage?
    const threshold = 10 * money;
    if (skip_stage(ns, ram, threshold)) {
        return;
    }

    // Wait until we have at least the given amount of money.
    const player = new Player(ns);
    const time = seconds_to_milliseconds(10);
    while (player.money_available() < money) {
        await ns.sleep(time);
    }
    // If we have zero purchased servers, then buy servers with
    // the given amount of RAM.
    const current_pserv = player.pserv();
    if (current_pserv.length < 1) {
        await update(ns, ram);
        return;
    }
    // Assume we have at least 1 purchased server.  If each purchased
    // server has less than the given amount of RAM, then delete the
    // servers and purchase servers with the given amount of RAM.
    assert(current_pserv.length > 0);
    const server = new Server(ns, current_pserv[0]);
    if (server.ram_max() < ram) {
        pserv.kill_all();
    }
    await update(ns, ram);
}

/**
 * Purchase the maximum number of servers and run our hack script on those
 * servers.  The function chooses the "best" targets to hack.
 *
 * @param ns The Netscript API.
 * @param ram The amount of RAM for each purchased server.  Must be a power
 *     of 2.
 */
async function update(ns, ram) {
    // The amount of RAM must be a power of 2.  RAM is assumed to be in GB.
    const pserv = new PurchasedServer(ns);
    const server_ram = Math.floor(ram);
    assert(pserv.is_valid_ram(server_ram));

    // Continuously try to purchase a new server until we've reached the
    // maximum number of servers we can buy.
    const player = new Player(ns);
    let i = player.pserv().length;
    let target = new Array();
    const time = seconds_to_milliseconds(10);
    while (i < pserv.limit()) {
        // Do we have enough money to buy a new server?
        if (player.money_available() > pserv.cost(server_ram)) {
            // Purchase a new server.
            const hostname = pserv.purchase("pserv", server_ram);
            // Choose the best target server.
            target = renew_targets(ns, target);
            const server = new Server(ns, choose_best_server(ns, target));
            target = target.filter((s) => s != server.hostname());
            // Run our hack script on the purchased server.
            assert(await server.gain_root_access());
            assert(await copy_and_run(ns, hostname, server.hostname()));
            i++;
        }
        // Sleep for a while.
        await ns.sleep(time);
    }
}

/**
 * Continuously try to purchase servers and use those to hack world servers.
 * If our funds are sufficient, try to upgrade to servers with higher
 * amounts of RAM.
 *
 * Usage: run buy-server.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const million = 10 ** 6;
    const billion = 1000 * million;
    const trillion = 1000 * billion;
    const money_threshold = [
        10 * million,
        100 * million,
        100 * billion,
        trillion,
    ];
    const ram = [128, 1024, 16384, 32768]; // Power of 2.
    const time = minutes_to_milliseconds(10);

    // Do we reboot our farm of purchased servers?
    await stage_one(ns);
    // Upgrade to purchased servers that have more RAM.
    let i = 0;
    for (const money of money_threshold) {
        await next_stage(ns, ram[i], money);
        i++;
        await ns.sleep(time);
    }
    // Wait until we have all programs to open every port on any world server
    // and all network programs.
    const player = new Player(ns);
    while (!player.has_all_programs()) {
        await ns.sleep(time);
    }
    // Upgrade to servers, each having over 50TB RAM.
    const high_threshold = [2 * trillion, 50 * trillion, 100 * trillion];
    const ram_threshold = [65536, 131072, 262144]; // Power of 2.
    i = 0;
    for (const money of high_threshold) {
        await next_stage(ns, ram_threshold[i], money);
        i++;
        await ns.sleep(time);
    }
}
