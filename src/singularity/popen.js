/**
 * Copyright (C) 2023 Duck McSouls
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
import { bool } from "/quack/lib/constant/bool.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { darkweb } from "/quack/lib/constant/tor.js";
import { log } from "/quack/lib/io.js";
import { assert, has_all_popen, has_program } from "/quack/lib/util.js";

/**
 * Create a port opener program.
 *
 * @param {NS} ns The Netscript API.
 */
async function create_program(ns) {
    const not_have = (prog) => !has_program(ns, prog);
    const popen = Array.from(darkweb.program.popen);
    const candidate = popen.filter(not_have);
    if (MyArray.is_empty(candidate)) {
        return;
    }

    // Create a program.
    for (const prog of candidate) {
        const success = ns.singularity.createProgram(prog, bool.FOCUS);
        if (success) {
            log(ns, `Creating program ${prog}`);
            while (ns.singularity.isBusy()) {
                assert(!has_program(ns, prog));
                await ns.sleep(wait_t.DEFAULT);
            }
            assert(has_program(ns, prog));
            return;
        }
    }
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
}

/**
 * Create various port opener programs.
 *
 * Usage: run quack/singularity/popen.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    while (!has_all_popen(ns)) {
        await create_program(ns);
        await ns.sleep(wait_t.DEFAULT);
    }
}
