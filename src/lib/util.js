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

// NOTE: Import only constants into this file.
// Miscellaneous helper functions.

import { corp } from "/lib/constant/corp.js";
import { all_programs, program } from "/lib/constant/exe.js";
import { factions } from "/lib/constant/faction.js";
import { io } from "/lib/constant/io.js";
import { cities } from "/lib/constant/location.js";
import { script } from "/lib/constant/misc.js";
import { home, server } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { wse } from "/lib/constant/wse.js";

/**
 * A function for assertion.
 *
 * @param cond Assert that this condition is true.
 * @return Throw an assertion error if the given condition is false.
 */
export function assert(cond) {
    if (!cond) {
        throw new Error("Assertion failed.");
    }
}

/**
 * Determine the best server to hack.  The definition of "best" is subjective.
 * However, at the moment the "best" server is the one that requires the
 * highest hacking skill.
 *
 * @param ns The Netscript API.
 * @param candidate Choose from among the servers in this array.
 * @return The best server to hack.
 */
export function choose_best_server(ns, candidate) {
    assert(candidate.length > 0);
    let best = ns.getServer(candidate[0]);
    for (const s of candidate) {
        const serv = ns.getServer(s);
        if (best.requiredHackingSkill < serv.requiredHackingSkill) {
            best = serv;
        }
    }
    return best.hostname;
}

/**
 * Determine a bunch of servers in the game world to hack.  A target server is
 * chosen based on these criteria:
 *
 * (1) We meet the hacking skill requirement of the server.
 * (2) We can open all ports required to gain root access to the server.
 *
 * @param ns The Netscript API.
 * @param candidate Use this array to search for targets to hack.
 * @return An array of target servers.
 */
export function choose_targets(ns, candidate) {
    // Sanity check.
    assert(candidate.length > 0);
    // How many ports can we open?
    const port_opener = program.filter((p) => ns.fileExists(p, home));
    const nport = port_opener.length;
    // Find a bunch of target servers to hack.
    const target = [];
    for (const s of candidate) {
        const serv = ns.getServer(s);
        // Do we have the minimum hacking skill required?
        if (ns.getHackingLevel() < serv.requiredHackingSkill) {
            continue;
        }
        // Can we open all required ports?
        if (serv.numOpenPortsRequired > nport) {
            continue;
        }
        // We have found a target server.
        target.push(s);
    }
    return target;
}

/**
 * Remove any files created by other scripts.
 *
 * @param ns The Netscript API.
 */
export function cleanup(ns) {
    const junk = [corp.INVEST, server.HRAM, server.SHARE, wse.STOP_BUY];
    junk.forEach((f) => ns.rm(f, home));
}

/**
 * Determine which servers in the game world have been compromised.  We
 * exclude all purchased servers.  A server in the game world is said to be
 * compromised provided that:
 *
 * (1) We have root access to the server.
 * (2) Our hack script is currently running on the server.
 *
 * @param ns The Netscript API.
 * @param s A hack script.  We want to check whether a server is running
 *     this script.
 * @param candidate An array of world servers to check.
 * @return An array of servers that have been compromised.
 */
export function compromised_servers(ns, s, candidate) {
    assert(candidate.length > 0);
    return filter_pserv(ns, candidate)
        .filter((serv) => ns.hasRootAccess(serv))
        .filter((host) => ns.scriptRunning(s, host));
}

/**
 * Execute a script on the home server and using 1 thread.
 *
 * @param ns The Netscript API.
 * @param s A string representing the name of the script to run.
 * @return The PID of the running script.
 */
export function exec(ns, s) {
    const nthread = 1;
    return ns.exec(s, home, nthread);
}

/**
 * Remove bankrupt servers from a given array of servers.  A server is bankrupt
 * if the maximum amount of money it can hold is zero.
 *
 * @param ns The Netscript API.
 * @param candidate An array of servers to filter.
 * @return An array of servers, each of which is not bankrupt.
 */
export function filter_bankrupt_servers(ns, candidate) {
    assert(candidate.length > 0);
    return candidate.filter((s) => !is_bankrupt(ns, s));
}

/**
 * Exclude the purchased servers.
 *
 * @param ns The Netscript API.
 * @param serv An array of server names.
 * @return An array of servers, but minus the purchased servers.
 */
export function filter_pserv(ns, serv) {
    const pserv = ns.getPurchasedServers();
    return serv.filter((s) => !pserv.includes(s));
}

/**
 * Attempt to gain root access to a given server.
 *
 * @param ns The Netscript API.
 * @param host Hostname of a world server.
 * @return True if we have root access to the given server; false otherwise.
 */
function gain_root_access(ns, host) {
    if (ns.getServer(host).hasAdminRights) {
        return true;
    }
    // Try to open all required ports and nuke the server.
    try {
        ns.brutessh(host);
    } catch {}
    try {
        ns.ftpcrack(host);
    } catch {}
    try {
        ns.httpworm(host);
    } catch {}
    try {
        ns.relaysmtp(host);
    } catch {}
    try {
        ns.sqlinject(host);
    } catch {}
    try {
        ns.nuke(host);
        return true;
    } catch {
        return false;
    }
}

/**
 * Tell the script "hram.js" to resume whatever it was doing.
 *
 * @param ns The Netscript API.
 */
export function hram_resume(ns) {
    if (ns.fileExists(server.SHARE, home)) {
        ns.rm(server.SHARE, home);
    }
}

/**
 * Suspend the script "hram.js" to free up some RAM on the home server.
 *
 * @param ns The Netscript API.
 */
export async function hram_suspend(ns) {
    if (!ns.fileExists(server.SHARE, home)) {
        const data = "Share home server.";
        ns.write(server.SHARE, data, io.WRITE);
    }
    const target = ns.read(server.HRAM).trim();
    if (target === "") {
        while (ns.isRunning(script, home)) {
            await ns.sleep(wait_t.SECOND);
        }
    } else {
        while (ns.isRunning(script, home, target)) {
            await ns.sleep(wait_t.SECOND);
        }
    }
}

/**
 * Whether a server is bankrupt.  A server is bankrupt if the maximum amount
 * of money it can hold is zero.
 *
 * @param ns The Netscript API.
 * @param s Test this server for bankruptcy.
 * @return true if the server is bankrupt; false otherwise.
 */
export function is_bankrupt(ns, s) {
    return ns.getServer(s).moneyMax === 0;
}

/**
 * Whether a variable is boolean.
 *
 * @param x We want to determine whether this is a boolean.
 * @return True if the given parameter is a boolean; false otherwise.
 */
export const is_boolean = (x) => typeof x === "boolean";

/**
 * Whether a given string represents a valid city in the game world.
 *
 * @param c A city name, represented as a string.  Cannot be an empty string.
 * @return true if the given string represents a city in the game world;
 *     false otherwise.
 */
export function is_valid_city(c) {
    assert(c.length > 0);
    const city = new Set(Object.keys(cities));
    return city.has(c);
}

/**
 * Whether the given name represents a valid faction.
 *
 * @param fac A string representing the name of a faction.
 * @return true if the given name represents a valid faction;
 *     false otherwise.
 */
export function is_valid_faction(fac) {
    assert(fac.length > 0);
    const faction = new Set(factions.all);
    return faction.has(fac);
}

/**
 * Whether the given name represents a valid program.
 *
 * @param name A string representing the name of a program.
 * @return true if the given name refers to a valid program;
 *     false otherwise.
 */
export function is_valid_program(name) {
    assert(name.length > 0);
    const prog = all_programs();
    return prog.has(name);
}

/**
 * Gain root access to as many world servers as we can.
 *
 * @param ns The Netscript API.
 * @param candidate An array of server hostnames.  We want to nuke each of these
 *     servers.
 * @return An array of hostnames of servers.  We have root access to each
 *     server.
 */
export function nuke_servers(ns, candidate) {
    return Array.from(candidate).filter((host) => gain_root_access(ns, host));
}

/**
 * A server that has the greatest hack desirability score.
 *
 * @param ns The Netscript API.
 * @param candidate Choose from among this array of hostnames.
 * @return Hostname of the server to target.
 */
export function server_of_max_weight(ns, candidate) {
    const desirable_server = (s, t) => (weight(ns, s) < weight(ns, t) ? t : s);
    return nuke_servers(ns, candidate).reduce(desirable_server);
}

/**
 * Tell the trade bot to resume its transactions.  It can now buy and sell
 * shares of stocks.
 *
 * @param ns The Netscript API.
 */
export function trade_bot_resume(ns) {
    if (ns.fileExists(wse.STOP_BUY, home)) {
        ns.rm(wse.STOP_BUY, home);
    }
}

/**
 * Tell the trade bot to stop buying shares of stocks.  We do not want to spend
 * any more money on buying shares.  However, the trade bot can sell shares.
 * The idea is to cash in on the shares we have.
 *
 * @param ns The Netscript API.
 */
export async function trade_bot_stop_buy(ns) {
    const fname = wse.STOP_BUY;
    const data = "Trade bot stop buy.";
    await ns.write(fname, data, io.WRITE);
}

/**
 * The weight, or hack desirability, of a server.  Higher weight is better.
 *
 * @param ns The Netscript API.
 * @param host The hostname of a server.
 * @return A non-negative number representing the hack desirability of the given
 *     server.
 */
function weight(ns, host) {
    const serv = ns.getServer(host);
    const threshold = ns.getHackingLevel() / 2;
    if (
        host === home
        || serv.purchasedByPlayer
        || !serv.hasAdminRights
        || serv.requiredHackingSkill > threshold
    ) {
        return 0;
    }
    assert(serv.minDifficulty > 0);
    return serv.moneyMax / serv.minDifficulty;
}
