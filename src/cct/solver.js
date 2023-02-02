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

import { cct } from "/lib/constant/cct.js";
import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { network } from "/lib/network.js";
import { Server } from "/lib/server.js";
import { assert } from "/lib/util.js";

/**
 * Do we have enough free RAM on the home server to run the given script?
 *
 * @param ns The Netscript API.
 * @param script We want to run this script on our home server.
 * @return true if enough free RAM is available to execute the script;
 *     false otherwise.
 */
function can_run_script(ns, script) {
    const server = new Server(ns, home);
    return server.can_run_script(script);
}

/**
 * Whether a server has Coding Contracts (CCTs).
 *
 * @param ns The Netscript API.
 * @param host Hostname of a server.
 * @return True if the given server has CCTs; false otherwise.
 */
function has_cct(ns, host) {
    return ns.ls(host, cct.SUFFIX).length > 0;
}

/**
 * Suppress various log messages.
 *
 * @param ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getServerUsedRam");
    ns.disableLog("scan");
    ns.disableLog("sleep");
}

/**
 * Solve a Coding Contract (CCT).
 *
 * @param ns The Netscript API.
 * @param fname The file name of the CCT.
 * @param host The hostname of the server on which the CCT is located.
 * @return True if we successfully launched a script to solve the given CCT;
 *     false otherwise.
 */
function solve(ns, fname, host) {
    const nthread = 1;
    const type = ns.codingcontract.getContractType(fname, host);
    // Determine the type of the CCT and set the appropriate solution script.
    let script = "";
    const prefix = "/cct/";
    switch (type) {
        case "Algorithmic Stock Trader I":
            script = `${prefix}trader.js`;
            break;
        case "Algorithmic Stock Trader II":
            script = `${prefix}trader2.js`;
            break;
        case "Algorithmic Stock Trader III":
            script = `${prefix}trader3.js`;
            break;
        case "Algorithmic Stock Trader IV":
            script = `${prefix}trader4.js`;
            break;
        case "Array Jumping Game":
            script = `${prefix}jump.js`;
            break;
        case "Array Jumping Game II":
            script = `${prefix}jump2.js`;
            break;
        case "Compression I: RLE Compression":
            script = `${prefix}rle.js`;
            break;
        case "Compression II: LZ Decompression":
            script = `${prefix}lzd.js`;
            break;
        case "Compression III: LZ Compression":
            script = `${prefix}lzc.js`;
            break;
        case "Encryption I: Caesar Cipher":
            script = `${prefix}caesar.js`;
            break;
        case "Encryption II: Vigenère Cipher":
            script = `${prefix}vigenere.js`;
            break;
        case "Find All Valid Math Expressions":
            script = `${prefix}maths.js`;
            break;
        case "Find Largest Prime Factor":
            script = `${prefix}prime.js`;
            break;
        case "Generate IP Addresses":
            script = `${prefix}ip.js`;
            break;
        case "HammingCodes: Encoded Binary to Integer":
            script = `${prefix}hamming2.js`;
            break;
        case "HammingCodes: Integer to Encoded Binary":
            script = `${prefix}hamming.js`;
            break;
        case "Merge Overlapping Intervals":
            script = `${prefix}interval.js`;
            break;
        case "Minimum Path Sum in a Triangle":
            script = `${prefix}triangle.js`;
            break;
        case "Proper 2-Coloring of a Graph":
            script = `${prefix}bipartite.js`;
            break;
        case "Sanitize Parentheses in Expression":
            script = `${prefix}parenthesis.js`;
            break;
        case "Shortest Path in a Grid":
            script = `${prefix}grid3.js`;
            break;
        case "Spiralize Matrix":
            script = `${prefix}spiral.js`;
            break;
        case "Subarray with Maximum Sum":
            script = `${prefix}subarray.js`;
            break;
        case "Total Ways to Sum":
            script = `${prefix}sum.js`;
            break;
        case "Total Ways to Sum II":
            script = `${prefix}sum2.js`;
            break;
        case "Unique Paths in a Grid I":
            script = `${prefix}grid.js`;
            break;
        case "Unique Paths in a Grid II":
            script = `${prefix}grid2.js`;
            break;
        default:
            script = "";
            break;
    }
    // No script to run, possibly because there are no CCTs on any of the world
    // servers.
    if (script.length < 1) {
        return true;
    }
    // Run the appropriate script to solve the CCT.
    if (can_run_script(ns, script)) {
        ns.exec(script, home, nthread, fname, host);
        return true;
    }
    // const pre = `${host}: ${fname}`;
    // const msg = `No free RAM to run ${script} on ${home}`;
    // log(ns, `${pre}: ${msg}`, colour.RED);
    return false;
}

/**
 * Solve all Coding Contracts (CCTs) found on a world server.
 *
 * @param ns The Netscript API.
 * @param host Hostname of a server where CCTs are found.
 * @return True if we successfully launched scripts to solve all CCTs on the
 *     given server; false otherwise.
 */
function solve_all(ns, host) {
    assert(host !== "");
    const file = ns.ls(host, cct.SUFFIX);
    const is_solved = (f) => solve(ns, f, host);
    return file.every(is_solved);
}

/**
 * Find Coding Contracts (CCTs) on world servers.  This script essentially
 * searches the network of world servers to find CCTs.
 *
 * Usage: run cct/solver.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    const server = network(ns);
    server.push(home);
    // Continuously search for CCTs.  Solve a CCT, provided we have a solution
    // script.
    const unsolved = (serv) => !solve_all(ns, serv);
    for (;;) {
        let host = server.filter((s) => has_cct(ns, s));
        while (host.length > 0) {
            host = host.filter(unsolved);
            await ns.sleep(wait_t.DEFAULT);
        }
        await ns.sleep(cct.UPDATE_TIME);
    }
}
