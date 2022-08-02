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

import { home } from "/lib/constant.js";
import { network } from "/lib/network.js";

/**
 * Find coding contracts on world servers.  This script essentially searches
 * the network of world servers to find coding contracts.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const server = network(ns);
    server.push(home);
    for (const host of server) {
        const file = ns.ls(host, ".cct");
        if (file.length < 1) {
            continue;
        }
        // Print the name of the coding contract, together with its type.
        for (const cct of file) {
            const type = ns.codingcontract.getContractType(cct, host);
            ns.tprint(host + ": " + cct + ", " + type);
        }
    }
}
