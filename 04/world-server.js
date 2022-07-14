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
 * Exclude the purchased servers.
 *
 * @param ns The Netscript API.
 * @param server An array of server names.
 * @return An array of servers, but minus the purchased servers.
 */
function filter_pserv(ns, server) {
    // All purchased servers.
    const pserv = new Set(ns.getPurchasedServers());
    // Filter out the purchased servers.
    const serv = Array.from(server);
    return serv.filter(s => !pserv.has(s));
}

/**
 * Whether we have the necessary programs on our home server to allow us to
 * hack other servers.
 *
 * @param ns The Netscript API.
 * @return true if we have the necessary programs; false otherwise.
 */
function have_programs(ns) {
    const home = "home";
    const program = ["BruteSSH.exe", "FTPCrack.exe", "hack.js", "NUKE.exe"];
    // Ensure we have the prerequisite programs on our home server.
    for (const p of program) {
        if (!ns.fileExists(p, home)) {
            ns.tprint(p + " not found on server " + home);
            return false;
        }
    }
    return true;
}

/**
 * Scan the network of servers in the game world.  Each server must be
 * reachable from our home server.
 *
 * @param ns The Netscript API.
 * @return An array of servers that can be reached from home.
 */
function network(ns) {
    // We scan the world network from a node, which is assumed to be our home
    // server.  We refer to our home server as the root of the tree.
    const root = "home";
    // A set of all servers we can visit at the moment.
    let server = new Set();
    // A stack of servers to visit.  We start from our home server.
    let stack = new Array(root);
    // Use depth-first search to navigate all servers we can visit.
    while (stack.length > 0) {
        const s = stack.pop();
        // Have we visited the server s yet?
        if (!server.has(s)) {
            // The server s is now visited.
            server.add(s);
            // Add all neighbours of s to the stack.  Take care to exclude the
            // purchased servers.
            stack.push(...filter_pserv(ns, ns.scan(s)));
        }
    }
    // Convert the set of servers to an array of servers.
    server = [...server];
    // Remove the root node from our array.  We want all servers that are
    // connected either directly or indirectly to the root node.
    return server.filter(s => root != s);
}

/**
 * Use servers in the game world to hack a target.  We exclude purchased
 * servers.
 *
 * @param {NS} ns
 */
export async function main(ns) {
    // Ensure we have the prerequisite programs to gain root access on other
    // servers.
    if (!have_programs(ns)) {
        ns.exit();
    }
    // Ensure our Hack stat is high enough to hack the target server.
    const target = "neo-net";
    const time = 10000;  // 10 seconds
    while (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(target)) {
        await ns.sleep(time);
    }
    // Gain root access on as many servers as possible on the network.  Copy
    // our hack script to each server and use the server to hack the target.
    // Note: also use the target server to hack itself.
    const server = network(ns);
    const script = "hack.js";
    const source = "home";
    const script_ram = ns.getScriptRam(script, source);
    const nport = 2;  // Can open this many ports.
    for (const s of server) {
        // Skip over a server that requires 3 or more open ports.  Currently,
        // we can only open 2 ports.
        if (ns.getServerNumPortsRequired(s) > nport) {
            continue;
        }
        // Wait until we meet the minimum hacking skill requirement of a server.
        while (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(s)) {
            await ns.sleep(time);
        }
        // Ensure we have root access on the server.
        if (!ns.hasRootAccess(s)) {
            ns.brutessh(s);
            ns.ftpcrack(s);
            ns.nuke(s);
        }
        // Determine how many threads we can run on a server.  If we can't run
        // our script on the server, then we skip the server.
        const server_ram = ns.getServerMaxRam(s) - ns.getServerUsedRam(s);
        const nthread = Math.floor(server_ram / script_ram);
        if (nthread < 1) {
            continue;
        }
        // Copy our hack script over to a server.  Use the server to hack the
        // target.
        await ns.scp(script, source, s);
        ns.exec(script, s, nthread, target);
    }
}
