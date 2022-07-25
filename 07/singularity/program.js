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

import {
    all_programs, home, program as popen, work_hack_lvl
} from "/lib/constant.js";
import { raise_hack } from "/lib/singularity.study.js";
import { work } from "/lib/singularity.work.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Purchase all programs from the dark web.
 *
 * @param ns The Netscript API.
 */
async function buy_all_programs(ns) {
    // We require the Tor router before we can access the dark web.
    await buy_tor_router(ns);
    // Work out which programs we still need to purchase via the dark web.
    let program = ns.singularity.getDarkwebPrograms();
    assert(program.length > 0);
    program = program.filter(p => !has_program(ns, p));
    if (0 == program.length) {
        return;
    }
    // Purchase all remaining programs.
    await buy_programs(ns, popen);
}

/**
 * Purchase all programs from a given list.
 *
 * @param ns The Netscript API.
 * @param program We want to buy all programs from this list.
 */
async function buy_programs(ns, program) {
    assert(program.length > 0);
    // First, determine which programs we do not have.
    let prog = Array.from(program);
    prog = prog.filter(p => !has_program(ns, p));
    if (0 == prog.length) {
        return;
    }
    // Purchase the remaining programs.
    const t = new Time();
    const time = t.second();
    while (prog.length > 0) {
        const [p, cost] = cheapest(ns, prog);
        while (ns.getServerMoneyAvailable(home) < cost) {
            await work(ns, cost);
            await ns.sleep(time);
        }
        assert(ns.singularity.purchaseProgram(p));
        prog = prog.filter(e => e != p);
    }
}

/**
 * Purchase the Tor router so we can access the dark web.
 *
 * @param ns The Netscript API.
 */
async function buy_tor_router(ns) {
    const t = new Time();
    const time = t.second();
    const cost = 200000;
    while (!ns.singularity.purchaseTor()) {
        const hack_lvl = ns.getHackingLevel();
        if (hack_lvl < work_hack_lvl) {
            const threshold = hack_lvl + 5;
            await raise_hack(ns, threshold);
            await ns.sleep(time);
            continue;
        }
        await work(ns, cost);
        await ns.sleep(time);
    }
}

/**
 * Choose the least expensive program that can be purchased via the dark web.
 *
 * @param ns The Netscript API.
 * @param program An array of program names.  We want to determine the cheapest
 *     program from among this list.
 * @return An array [prog, cost] as follows.
 *     (1) prog := The name of cheapest program from among the given list of
 *         program names.
 *     (2) cost := The cost of the cheapest program.
 */
function cheapest(ns, program) {
    assert(program.length > 0);
    let mincost = Infinity;
    let prog = "";
    for (const p of program) {
        assert(!has_program(ns, p));
        const cost = ns.singularity.getDarkwebProgramCost(p);
        if (mincost > cost) {
            mincost = cost;
            prog = p;
        }
    }
    assert(mincost > 0);
    assert(prog.length > 0);
    assert(program.includes(prog));
    return [prog, mincost];
}

/**
 * Whether we have the given program on our home server.
 *
 * @param ns The Netscript API.
 * @param program A string representing the name of a program.
 * @return true if we already have the given program;
 *     false otherwise.
 */
function has_program(ns, program) {
    assert(is_valid_program(program));
    return ns.fileExists(program, home);
}

/**
 * Whether the given name is a valid program.
 *
 * @param name A string representing the name of a program.
 * @return true if the given name is a valid program;
 *     false otherwise.
 */
function is_valid_program(name) {
    assert(name.length > 0);
    const program = all_programs();
    return program.has(name);
}

/**
 * Purchase various programs from the dark web.
 *
 * Usage: run singularity/program.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Suppress various log messages.
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");

    await buy_all_programs(ns);
    const script = "/singularity/faction.js";
    const nthread = 1;
    ns.exec(script, home, nthread);
}
