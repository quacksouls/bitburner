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

/**
 * Buy servers, each having as high an amount of RAM as we can afford.
 *
 * @param ns The Netscript API.
 */
async function buy_servers(ns) {
    // We want to purchase the default minimum number of servers.  We wait until
    // we have enough money to purchase each of the remaining servers.
    const pserv = pserv_object();
    let ram = pserv_ram(ns);
    if (ram <= pserv.DEFAULT_RAM) {
        // Try to purchase servers, each with the default amount of RAM.
        await stage_one(ns);
        return;
    }
    // Here we assume we already have purchased servers, each with the default
    // amount of RAM.  Now try to purchase servers, each with a higher amount
    // of RAM than the default amount.  We wait to accumulate enough money to
    // purchase the maximum number of servers.
    ram = pserv_ram(ns);
    if (ram <= pserv.DEFAULT_RAM) {
        return;
    }
    await next_stage(ns, ram);
}

/**
 * Determine the best server to hack.  The "best" server is the one that
 * requires the highest hacking skill.
 *
 * @param ns The Netscript API.
 * @return The best server to hack.  Empty string if no target available.
 */
function choose_best_server(ns) {
    const candidate = compromised_servers(ns);
    if (candidate.length < 1) {
        return "";
    }
    const hack_skill = (s) => ns.getServer(s).requiredHackingSkill;
    const best_server = (s, t) => (hack_skill(s) < hack_skill(t) ? t : s);
    return candidate.reduce(best_server);
}

/**
 * All servers in the game world that have been compromised.  Exclude all
 * purchased servers, bankrupt servers, and servers that require more Hack than
 * we have.
 *
 * @param ns The Netscript API.
 * @return An array of hostnames, each representing a compromised server.
 */
function compromised_servers(ns, root = "home", visit = new Set()) {
    // Scan all servers in the game world.  Use a recursive version of
    // depth-first search.
    const is_bankrupt = (s) => ns.getServer(s).moneyMax === 0;
    const required_lvl = (s) => ns.getServer(s).requiredHackingSkill;
    const can_hack = (s) => ns.getHackingLevel() >= required_lvl(s);
    ns.scan(root)
        .filter((s) => ns.getServer(s).hasAdminRights)
        .filter((s) => !ns.getServer(s).purchasedByPlayer)
        .filter((s) => !is_bankrupt(s))
        .filter((s) => can_hack(s))
        .filter((s) => !visit.has(s))
        .forEach((s) => {
            visit.add(s);
            compromised_servers(ns, s, visit);
        });
    return [...visit];
}

/**
 * Delete all purchased servers.  This would also kill all scripts running on
 * each purchased server.
 *
 * @param ns The Netscript API.
 */
function delete_all_pserv(ns) {
    ns.getPurchasedServers().forEach((s) => {
        ns.killall(s);
        ns.deleteServer(s);
    });
}

/**
 * Deploy our hack script to a purchased server.
 *
 * @param ns The Netscript API.
 * @param script Our hacking script.  Assumed to be located on home server.
 * @param host Hostname of a purchased server.  We will run our hack script on
 *     this server.
 * @param target Use our hack script to hack this target server.
 */
function deploy(ns, script, host, target) {
    const home = "home";
    const nthread = num_threads(ns, script, host);
    if (!ns.fileExists(script, home) || nthread < 1) {
        return;
    }
    ns.scp(script, host, home);
    ns.exec(script, host, nthread, target);
}

/**
 * Whether we have enough money to cover the cost of buying something.
 *
 * @param ns The Netscript API.
 * @param cost The cost to purchase or upgrade something.
 * @return True if we have sufficient funds to cover the given cost;
 *     false otherwise.
 */
const has_funds = (ns, cost) => ns.getServerMoneyAvailable("home") > cost;

/**
 * Whether we have the maximum number of purchased servers.
 *
 * @param ns The Netscript API.
 * @return True if we already have the maximum number of purchased servers;
 *     false otherwise.
 */
function has_max_pserv(ns) {
    return ns.getPurchasedServers().length === ns.getPurchasedServerLimit();
}

/**
 * Whether we have zero purchased servers.
 *
 * @param ns The Netscript API.
 * @return True if we have no purchased servers; false otherwise.
 */
const has_no_pserv = (ns) => ns.getPurchasedServers().length < 1;

/**
 * Purchase servers that have more than the default amount of RAM.  Call this
 * function multiple times with different arguments to upgrade our purchased
 * servers to higher RAM.
 *
 * @param ns The Netscript API.
 * @param ram The amount of RAM for each purchased server.
 */
async function next_stage(ns, ram) {
    // If we have zero purchased servers, then buy servers with the given
    // amount of RAM.
    if (has_no_pserv(ns)) {
        await update(ns, ram);
        return;
    }
    // Assume we have at least 1 purchased server.
    const pserv = pserv_object();
    if (ns.getServer(pserv.PREFIX).maxRam < ram) {
        // If each purchased server has less than the given amount of RAM, then
        // delete the servers and purchase servers with the given amount of RAM.
        delete_all_pserv(ns);
        await update(ns, ram);
    } else if (ns.getServer(pserv.PREFIX).maxRam === ram) {
        // The current purchased servers have the same amount of RAM as our
        // target RAM.  Continue purchasing more servers with the current
        // amount of RAM.
        await update(ns, ram);
    }
}

/**
 * The maximum number of threads that can be used to run our script on a given
 * server.
 *
 * @param ns The Netscript API.
 * @param script Our hacking script.  Assumed to be located on home server.
 * @param host Hostname of a purchased server.
 * @return The maximum number of threads to run our script on the given server.
 */
function num_threads(ns, script, host) {
    const home = "home";
    const script_ram = ns.getScriptRam(script, home);
    const { maxRam, ramUsed } = ns.getServer(host);
    const server_ram = maxRam - ramUsed;
    if (server_ram < 1) {
        return 0;
    }
    return Math.floor(server_ram / script_ram);
}

/**
 * An object that represents various properties of our purchased servers.
 */
function pserv_object() {
    return {
        /**
         * The default amount of RAM (in GB) for each purchased server.
         */
        DEFAULT_RAM: 32,
        /**
         * The minimum number of servers to buy.
         */
        MIN_SERVER: 8,
        /**
         * The prefix for the hostname of each purchased server.
         */
        PREFIX: "pserv",
        /**
         * The script to use for hacking a target server.  Assumed to be located
         * on our home server.
         */
        SCRIPT: "hack.js",
        /**
         * The default update interval.  Must wait this amount of time (in
         * milliseconds) before performing the next update.  Time is 1 minute.
         */
        TICK: 60 * 1e3,
        /**
         * An array of valid RAM for a purchased server.  Each RAM amount is a
         * power of 2.
         */
        valid_ram: [
            32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536,
            131072, 262144, 524288, 1048576,
        ],
    };
}

/**
 * The possible amount of RAM for each purchased server.
 *
 * @param ns The Netscript API.
 * @return The amount of RAM for each purchased server.  Return 0 if we cannot
 *     afford the minimum number of purchased servers.
 */
function pserv_ram(ns) {
    // The possible amount of RAM for a purchased server.  We want the lowest
    // value to be the default amount of RAM.  Sort the array of RAM in
    // descending order.
    const pserv = pserv_object();
    let ram = Array.from(pserv.valid_ram)
        .filter((r) => r >= pserv.DEFAULT_RAM)
        .sort((a, b) => b - a);
    // Let's see whether we can purchase servers, each having the given amount
    // of RAM.  Start with the highest amount of RAM.  See if we can buy at
    // least the minimum number of servers, each with the given amount of RAM.
    // If not, then decrease the amount of RAM and repeat the above process.
    const cost = (r) => pserv.MIN_SERVER * ns.getPurchasedServerCost(r);
    const can_afford = (r) => has_funds(ns, cost(r));
    ram = ram.filter(can_afford);
    return ram.length > 0 ? ram[0] : 0;
}

/**
 * Silence various log messages.
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
 * have just installed a bunch of Augmentations.  Each purchased server should
 * have a small amount of RAM, enough to run our hacking script using at least
 * 2 threads.
 *
 * @param ns The Netscript API.
 */
async function stage_one(ns) {
    if (has_max_pserv(ns)) {
        return;
    }
    // If we have zero purchased servers, then start with purchased servers
    // that have the default amount of RAM.
    const pserv = pserv_object();
    if (has_no_pserv(ns)) {
        await update(ns, pserv.DEFAULT_RAM);
        return;
    }
    // Assume we have at least 1 purchased server.  Skip the stage if a current
    // purchased server has more than the default amount of RAM.
    if (pserv.DEFAULT_RAM < ns.getServer(pserv.PREFIX).maxRam) {
        return;
    }
    await update(ns, pserv.DEFAULT_RAM);
}

/**
 * Purchase the maximum number of servers and run our hack script on those
 * servers.  We direct our purchased servers to hack a common target.
 *
 * @param ns The Netscript API.
 * @param ram The amount of RAM for each purchased server.  Must be a positive
 *     integer and a power of 2.
 */
async function update(ns, ram) {
    // Choose a target against which all purchased servers would attack.
    let target = "";
    const pserv = pserv_object();
    while (target === "") {
        target = choose_best_server(ns);
        await ns.sleep(pserv.TICK);
    }
    // Continuously try to purchase a new server until we have reached the
    // maximum number of servers we can buy.
    let i = ns.getPurchasedServers().length;
    while (i < ns.getPurchasedServerLimit()) {
        const cost = ns.getPurchasedServerCost(ram);
        if (has_funds(ns, cost)) {
            const hostname = ns.purchaseServer(pserv.PREFIX, ram);
            deploy(ns, pserv.SCRIPT, hostname, target);
            i++;
        }
        await ns.sleep(pserv.TICK);
    }
}

/**
 * Continuously try to purchase servers and use those to hack world servers.
 * If our funds are sufficient, try to upgrade to servers with higher amounts
 * of RAM.
 *
 * Usage: run pserv.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    // Continuously try to purchase more powerful servers.
    for (;;) {
        await buy_servers(ns);
        await ns.sleep(pserv_object().TICK);
    }
}
