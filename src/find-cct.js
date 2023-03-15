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

import { MyArray } from "/quack/lib/array.js";
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
    const list_contract = (host) => ns.ls(host, cct.SUFFIX);
    const has_contract = (host) => !MyArray.is_empty(list_contract(host));

    // Print the name of a Coding Contract, together with its type.
    const print_contract = (host) => {
        list_contract(host).forEach((file) => {
            const type = ns.codingcontract.getContractType(file, host);
            log(ns, `${host}: ${file}, ${type}`);
        });
    };
    network(ns).concat([home]).filter(has_contract).forEach(print_contract);
}
