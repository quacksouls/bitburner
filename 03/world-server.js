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
 * @param server An array of server names.
 * @return An array of servers, but minus the purchased servers.
 */
function filter_pserv(server) {
    // All purchased servers.
    const pserv = [
        "pserv",
        "pserv-0",
        "pserv-1",
        "pserv-2",
        "pserv-3",
        "pserv-4",
        "pserv-5",
        "pserv-6",
        "pserv-7",
        "pserv-8",
        "pserv-9",
        "pserv-10",
        "pserv-11",
        "pserv-12",
        "pserv-13",
        "pserv-14",
        "pserv-15",
        "pserv-16",
        "pserv-17",
        "pserv-18",
        "pserv-19",
        "pserv-20",
        "pserv-21",
        "pserv-22",
        "pserv-23",
    ];
    // Filter out the purchased servers.
    let serv = Array.from(server);
    for (const p of pserv) {
        serv = serv.filter((s) => s != p);
    }
    return serv;
}

/**
 * Whether we have the necessary programs on our home server to allow us to
 * gain root access on other servers.
 *
 * @param ns The Netscript API.
 * @return true if we have the necessary programs; false otherwise.
 */
function have_programs(ns) {
    const home = "home";
    const program = ["BruteSSH.exe", "FTPCrack.exe", "NUKE.exe"];
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
 * Ensure our Hack stat is high enough to allow us to hack all servers
 * currently available to us.
 *
 * @param ns The Netscript API.
 * @return true if we meet the minimum Hack level; false otherwise.
 */
function have_min_hack_level(ns) {
    // The server omega-net requires a minimum Hack level of 213.  The server
    // is also at most 3 hops from our home server.  We assume that currently
    // we can only access servers that are at most 3 hops away from home.
    const min_hack_lvl = 213;
    const hack_lvl = ns.getHackingLevel();
    if (hack_lvl < min_hack_lvl) {
        ns.tprint("Hack level too low: " + hack_lvl);
        return false;
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
    // The depth of the tree starting from the root.  Currently we are limited
    // to a depth of 3.  We can scan for servers that are at most 3 hops away
    // from the root.
    const depth = 3;
    // All servers that are directly connected to the root node.
    let server = filter_pserv(ns.scan(root));
    for (let i = 1; i < depth; i++) {
        // Scan the immediate neighbours of a server at depth i.
        let neighbour = new Array();
        for (const s of server) {
            const neigh = ns.scan(s);
            neighbour = neighbour.concat(neigh);
        }
        server = server.concat(filter_pserv(neighbour));
    }
    // Remove duplicate server names.
    server = [...new Set(server)];
    // Remove the root node from our array.  We want all servers that are
    // connected either directly or indirectly to the root node.
    return server.filter((s) => root != s);
}

/**
 * Use servers in the game world to hack a target.  We exclude purchased
 * servers.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Ensure we have the prerequisite programs to gain root access on other
    // servers.
    if (!have_programs(ns)) {
        ns.exit();
    }
    // Ensure our Hack stat is high enough.
    if (!have_min_hack_level(ns)) {
        ns.exit();
    }
    // Gain root access on all servers that we can see on the network.  Copy
    // our hack script to each server and use the server to hack joesguns.
    // Note: use joesguns to hack joesguns.
    const server = network(ns);
    const script = "hack.js";
    const source = "home";
    const target = "joesguns";
    const script_ram = ns.getScriptRam(script, source);
    for (const s of server) {
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
