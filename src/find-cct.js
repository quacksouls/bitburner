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

import { cct } from "/quack/lib/constant/cct.js";
import { home } from "/quack/lib/constant/server.js";
import { log } from "/quack/lib/io.js";
import { network } from "/quack/lib/network.js";

/**
 * Find Coding Contracts on world servers.  This script essentially searches
 * the network of world servers to find Coding Contracts.
 *
 * Usage: run quack/find-cct.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    network(ns)
        .concat([home])
        .filter((s) => ns.ls(s, cct.SUFFIX).length > 0)
        .forEach((host) => {
            // Print the name of the coding contract, together with its type.
            ns.ls(host, cct.SUFFIX).forEach((f) => {
                const type = ns.codingcontract.getContractType(f, host);
                log(ns, `${host}: ${f}, ${type}`);
            });
        });
}
