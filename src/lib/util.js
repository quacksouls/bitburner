/**
 * Copyright (C) 2022--2023 Duck McSouls
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

import { all_programs, program } from "/quack/lib/constant/exe.js";
import { factions } from "/quack/lib/constant/faction.js";
import { hnet_t } from "/quack/lib/constant/hacknet.js";
import { cities } from "/quack/lib/constant/location.js";
import { darkweb, empty_string, hgw } from "/quack/lib/constant/misc.js";
import { home, server } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { wse } from "/quack/lib/constant/wse.js";

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
 * Whether we can run a script on a given server.
 *
 * @param ns The Netscript API.
 * @param s A script to run.  Assumed to exist on our home server as well
 *     as the target host.
 * @param host The target host.
 * @return True if the given target server can run the script; false otherwise.
 */
export function can_run_script(ns, s, host) {
    return num_threads(ns, s, host) > 0;
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
    const hack_skill = (s) => ns.getServer(s).requiredHackingSkill;
    const better_server = (s, t) => (hack_skill(s) < hack_skill(t) ? t : s);
    return candidate.reduce(better_server);
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
    const required_hack = (s) => ns.getServer(s).requiredHackingSkill;
    const can_nuke = (s) => nport >= ns.getServer(s).numOpenPortsRequired;
    return candidate
        .filter((s) => ns.getHackingLevel() >= required_hack(s))
        .filter((t) => can_nuke(t));
}

/**
 * Remove any files created by other scripts.
 *
 * @param ns The Netscript API.
 */
export function cleanup(ns) {
    const junk = [
        hnet_t.LIQUIDATE,
        server.HRAM,
        server.SHARE,
        wse.LIQUIDATE,
        wse.STOP_BUY,
    ];
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
 * Farm Hack XP until we reach a given threshold.
 *
 * @param {NS} ns The Netscript API.
 */
export async function farm_hack_xp(ns) {
    const pid = exec(ns, "/quack/hgw/xp.js");
    while (ns.getHackingLevel() < hgw.MIN_HACK) {
        await ns.sleep(wait_t.DEFAULT);
    }
    ns.kill(pid);
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
    const is_home = (s) => s === home;
    const not_purchased = (s) => !ns.getServer(s).purchasedByPlayer;
    const not_pserv = (s) => is_home(s) || not_purchased(s);
    return serv.filter(not_pserv);
}

/**
 * The amount of available RAM on a server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of the server to query.
 * @returns The amount of free RAM on the given server.
 */
export function free_ram(ns, host) {
    return ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
}

/**
 * Attempt to gain root access to a given server.
 *
 * @param ns The Netscript API.
 * @param host Hostname of a world server.
 * @return True if we have root access to the given server; false otherwise.
 */
export function gain_root_access(ns, host) {
    if (has_root_access(ns, host)) {
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
 * Whether we have all port opener programs.
 *
 * @param ns The Netscript API.
 * @return True if we have all port opener programs; false otherwise.
 */
export function has_all_popen(ns) {
    return (
        has_program(ns, darkweb.program.brutessh.NAME)
        && has_program(ns, darkweb.program.ftpcrack.NAME)
        && has_program(ns, darkweb.program.relaysmtp.NAME)
        && has_program(ns, darkweb.program.httpworm.NAME)
        && has_program(ns, darkweb.program.sqlinject.NAME)
    );
}

/**
 * Whether we have the program Formulas.exe.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we have the program Formulas.exe; false otherwise.
 */
export function has_formulas(ns) {
    return has_program(ns, darkweb.program.formulas);
}

/**
 * Whether we have a particular program.
 *
 * @param ns The Netscript API.
 * @param prog Do we have this program?
 * @return True if we have the given program; false otherwise.
 */
export function has_program(ns, prog) {
    return ns.fileExists(prog, home);
}

/**
 * Whether we have the minimum Hack stat required by a server.
 *
 * @param ns The Netscript API.
 * @param host Hostname of a world server.
 * @return True if our Hack stat meets the required hacking level of the given
 *     server; false otherwise.
 */
export function has_required_hack(ns, host) {
    return ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(host);
}

/**
 * Whether we have root access to a server.
 *
 * @param ns The Netscript API.
 * @param host Hostname of a world server.
 * @return True if we have have root access to the given server;
 *     false otherwise.
 */
export function has_root_access(ns, host) {
    return ns.getServer(host).hasAdminRights;
}

/**
 * Let our sleeves commit crimes to raise money.
 *
 * @param ns The Netscript API.
 */
export async function init_sleeves(ns) {
    const pid = exec(ns, "/quack/sleeve/money.js");
    while (ns.isRunning(pid)) {
        await ns.sleep(wait_t.DEFAULT);
    }
}

/**
 * Whether a server is bankrupt.  A server is bankrupt if the maximum amount
 * of money it can hold is zero.
 *
 * @param ns The Netscript API.
 * @param s Test this server for bankruptcy.
 * @return True if the server is bankrupt; false otherwise.
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
 * Whether a string is empty.
 *
 * @param {string} str Test this string.
 * @returns {boolean} True if the given string is empty; false otherwise.
 */
export function is_empty_string(str) {
    return typeof str === "string" && str === empty_string && str.length === 0;
}

/**
 * Whether a given string represents a valid city in the game world.
 *
 * @param c A city name, represented as a string.  Cannot be an empty string.
 * @return True if the given string represents a city in the game world;
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
 * @return True if the given name represents a valid faction;
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
 * @return True if the given name refers to a valid program;
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
 * The maximum number of threads that can be used to run our script on a given
 * server.
 *
 * @param ns The Netscript API.
 * @param s A script.  Assumed to be located on home server.
 * @param host Hostname of a world server.
 * @return The maximum number of threads to run our script on the given server.
 */
export function num_threads(ns, s, host) {
    const script_ram = ns.getScriptRam(s, home);
    const { maxRam, ramUsed } = ns.getServer(host);
    const server_ram = maxRam - ramUsed;
    if (server_ram < 1) {
        return 0;
    }
    return Math.floor(server_ram / script_ram);
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
 * A hackish way to implement shell scripting in Bitburner.  Emulate terminal
 * input.
 *
 * @param cmd Run this command from the terminal.
 */
export function shell(cmd) {
    // Template code from the official documentation of Bitburner:
    //
    // https://bitburner.readthedocs.io/en/latest/netscript/advancedfunctions/inject_html.html
    const input = globalThis["document"].getElementById("terminal-input"); // eslint-disable-line
    input.value = cmd;
    const handler = Object.keys(input)[1];
    input[handler].onChange({
        target: input,
    });
    input[handler].onKeyDown({
        key: "Enter",
        preventDefault: () => null,
    });
}

/**
 * Convert a time amount from milliseconds to the format hh:mm:ss.
 *
 * @param t An amount of time in milliseconds.
 * @return The same but a string in the format hh:mm:ss.
 */
export function time_hms(t) {
    const date = new Date(0);
    date.setSeconds(to_second(t));
    const start_idx = 11;
    const end_idx = 19;
    return date.toISOString().substring(start_idx, end_idx);
}

/**
 * Convert a given amount of time in milliseconds to minutes.
 *
 * @param t An amount of time in milliseconds.
 * @return The same amount of time but given in minutes.
 */
export function to_minute(t) {
    assert(t >= 0);
    return t / wait_t.MINUTE;
}

/**
 * Convert a given amount of time in milliseconds to seconds.
 *
 * @param t An amount of time in milliseconds.
 * @return The same amount of time but given in seconds.
 */
export function to_second(t) {
    assert(t >= 0);
    return t / wait_t.SECOND;
}

/**
 * The weight, or hack desirability, of a server.  Higher weight is better.
 *
 * @param ns The Netscript API.
 * @param host The hostname of a server.
 * @return A non-negative number representing the hack desirability of the given
 *     server.
 */
export function weight(ns, host) {
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
