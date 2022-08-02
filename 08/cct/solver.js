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

import { network } from "/lib/network.js";
import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import { Time } from "/lib/time.js";

/**
 * Do we have enough free RAM on the home server to run the given script?
 *
 * @param ns The Netscript API.
 * @param script We want to run this script on our home server.
 * @return true if enough free RAM is available to execute the script;
 *     false otherwise.
 */
function can_run_script(ns, script) {
    const player = new Player(ns);
    const server = new Server(ns, player.home());
    return server.can_run_script(script);
}

/**
 * Solve a coding contract.
 *
 * @param ns The Netscript API.
 * @param cct The file name of the coding contract.
 * @param host The host name of the server on which the coding contract is
 *     located.
 */
function solve(ns, cct, host) {
    const player = new Player(ns);
    const nthread = 1;
    const type = ns.codingcontract.getContractType(cct, host);
    // Determine the type of the coding contract and set the appropriate
    // solution script.
    let script = "";
    const prefix = "/cct/";
    switch (type) {
    case "Algorithmic Stock Trader I":
        script = prefix + "trader.js";
        break;
    case "Algorithmic Stock Trader II":
        script = prefix + "trader2.js";
        break;
    case "Algorithmic Stock Trader III":
        script = prefix + "trader3.js";
        break;
    case "Algorithmic Stock Trader IV":
        script = prefix + "trader4.js";
        break;
    case "Array Jumping Game":
        script = prefix + "jump.js";
        break;
    case "Array Jumping Game II":
        script = prefix + "jump2.js";
        break;
    case "Compression I: RLE Compression":
        script = prefix + "rle.js";
        break;
    case "Compression II: LZ Decompression":
        script = prefix + "lzd.js";
        break;
    case "Compression III: LZ Compression":
        script = prefix + "lzc.js";
        break;
    case "Find All Valid Math Expressions":
        script = prefix + "maths.js";
        break;
    case "Find Largest Prime Factor":
        script = prefix + "prime.js";
        break;
    case "Generate IP Addresses":
        script = prefix + "ip.js";
        break;
    case "HammingCodes: Encoded Binary to Integer":
        script = prefix + "hamming2.js";
        break;
    case "HammingCodes: Integer to Encoded Binary":
        script = prefix + "hamming.js";
        break;
    case "Merge Overlapping Intervals":
        script = prefix + "interval.js";
        break;
    case "Minimum Path Sum in a Triangle":
        script = prefix + "triangle.js";
        break;
    case "Proper 2-Coloring of a Graph":
        script = prefix + "bipartite.js";
        break;
    case "Sanitize Parentheses in Expression":
        script = prefix + "parenthesis.js";
        break;
    case "Shortest Path in a Grid":
        script = prefix + "grid3.js";
        break;
    case "Spiralize Matrix":
        script = prefix + "spiral.js";
        break;
    case "Subarray with Maximum Sum":
        script = prefix + "subarray.js";
        break;
    case "Total Ways to Sum":
        script = prefix + "sum.js";
        break;
    case "Total Ways to Sum II":
        script = prefix + "sum2.js";
        break;
    case "Unique Paths in a Grid I":
        script = prefix + "grid.js";
        break;
    case "Unique Paths in a Grid II":
        script = prefix + "grid2.js";
        break;
    default:
        script = "";
        break;
    }
    // No script to run, possibly because there are no coding contracts on any
    // of the world servers.
    if (script.length < 1) {
        return;
    }
    // Run the appropriate script to solve the coding contract.
    if (can_run_script(ns, script)) {
        ns.exec(script, player.home(), nthread, cct, host);
    } else {
        const err_msg = host + ": " + cct +
              ": No free RAM to run " + script + " on server " + player.home();
        ns.print(err_msg);
    }
}

/**
 * Find coding contracts on world servers.  This script essentially searches
 * the network of world servers to find coding contracts.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerUsedRam");
    ns.disableLog("scan");
    ns.disableLog("sleep");

    const time = new Time();
    const t = 5 * time.minute();
    const server = network(ns);
    server.push("home");
    // Continuously search for coding contracts.  Solve a coding contract,
    // provided we have a solution script.
    while (true) {
        for (const s of server) {
            const file = ns.ls(s, ".cct");
            // No coding contracts on this server.
            if (file.length < 1) {
                continue;
            }
            // Solve all coding contracts on this server.
            for (const cct of file) {
                solve(ns, cct, s);
            }
        }
        await ns.sleep(t);
    }
}
