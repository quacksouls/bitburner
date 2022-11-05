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

// Miscellaneous helper functions.

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
    const junk = [server.HRAM, server.SHARE, wse.STOP_BUY];
    junk.forEach((f) => ns.rm(f, home));
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
    assert(target !== "");
    while (ns.isRunning(script, home, target)) {
        await ns.sleep(wait_t.SECOND);
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
