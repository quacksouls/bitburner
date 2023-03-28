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
import { program as popen } from "/quack/lib/constant/exe.js";
import {
    darkweb,
    empty_string,
    work_hack_lvl,
} from "/quack/lib/constant/misc.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";
import { Player } from "/quack/lib/player.js";
import { raise_hack } from "/quack/lib/singularity/study.js";
import { choose_hardware_company } from "/quack/lib/singularity/util.js";
import { work } from "/quack/lib/singularity/work.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/// ///////////////////////////////////////////////////////////////////////
// Utility functions related to programs.
/// ///////////////////////////////////////////////////////////////////////

/**
 * Purchase all programs from the dark web.
 *
 * @param {NS} ns The Netscript API.
 * @param {boolean} visit Whether to visit a hardware store.  Although not
 *     required, we visit a hardware store to increase our Intelligence XP.
 * @param {boolean} wrk Whether to work to increase our funds or required stats.
 *     We require money to puchase programs.  In most cases, we require certain
 *     stats to be offered a job.
 */
export async function buy_all_programs(ns, visit, wrk) {
    // Purchase the Tor router from a hardware store.
    const shop = await choose_hardware_company(ns, visit);
    if (visit) {
        ns.singularity.goToLocation(shop);
    }
    await buy_tor_router(ns, wrk);

    // Work out which programs we still need to purchase via the dark web.
    let program = ns.singularity.getDarkwebPrograms();
    assert(!MyArray.is_empty(program));
    const player = new Player(ns);
    program = program.filter((p) => !player.has_program(p));
    if (MyArray.is_empty(program)) {
        return;
    }

    // Purchase all remaining programs.
    await buy_programs(ns, popen, wrk);
}

/**
 * Purchase all programs from a given list.
 *
 * @param {NS} ns The Netscript API.
 * @param {array<string>} program We want to buy all programs from this list.
 * @param {boolean} wrk Whether to work to increase our funds or required stats.
 *     We require money to puchase programs.  In most cases, we require certain
 *     stats to be offered a job.
 */
async function buy_programs(ns, program, wrk) {
    assert(program.length > 0);

    // First, determine which programs we do not have.
    const player = new Player(ns);
    let prog = Array.from(program);
    prog = prog.filter((p) => !player.has_program(p));
    if (MyArray.is_empty(prog)) {
        return;
    }

    // Purchase the remaining programs.
    log(ns, `Buying port openers: ${prog.join(", ")}`);
    while (!MyArray.is_empty(prog)) {
        const [p, cost] = cheapest(ns, prog);
        if (player.has_program(p)) {
            prog = prog.filter((e) => e !== p);
            continue;
        }
        while (player.money() < cost) {
            if (player.hacking_skill() < work_hack_lvl) {
                if (wrk) {
                    await raise_hack(ns, target_hack_lvl(ns));
                }
                await ns.sleep(wait_t.SECOND);
                continue;
            }
            if (wrk) {
                await work(ns, cost);
            }
            await ns.sleep(wait_t.SECOND);
        }
        assert(ns.singularity.purchaseProgram(p));
        log(ns, `Purchased program ${p}`);
        prog = prog.filter((e) => e !== p);
    }
}

/**
 * Purchase the Tor router so we can access the dark web.
 *
 * @param {NS} ns The Netscript API.
 * @param {boolean} wrk Whether to work to increase our funds or required stats.
 *     We require money to puchase the Tor router.  In most cases, we require
 *     certain stats to be offered a job.
 */
async function buy_tor_router(ns, wrk) {
    log(ns, "Purchase Tor router");
    const player = new Player(ns);
    while (!ns.singularity.purchaseTor()) {
        if (player.hacking_skill() < work_hack_lvl) {
            if (wrk) {
                await raise_hack(ns, target_hack_lvl(ns));
            }
            await ns.sleep(wait_t.SECOND);
            continue;
        }
        if (wrk) {
            await work(ns, darkweb.tor.COST);
        }
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * Choose the least expensive program that can be purchased via the dark web.
 *
 * @param {NS} ns The Netscript API.
 * @param {array<string>} program Program names.  We want to determine the
 *     cheapest program from among this list.
 * @returns {array} An array [prog, cost] as follows.
 *     (1) prog := The name of cheapest program from among the given list of
 *         program names.
 *     (2) cost := The cost of the cheapest program.
 */
function cheapest(ns, program) {
    assert(program.length > 0);
    let mincost = Infinity;
    let prog = empty_string;
    for (const p of program) {
        const cost = ns.singularity.getDarkwebProgramCost(p);
        if (mincost > cost) {
            mincost = cost;
            prog = p;
        }
    }
    assert(mincost > 0);
    assert(!is_empty_string(prog));
    assert(program.includes(prog));
    return [prog, mincost];
}

/**
 * Raise our Hack stat to at least a given number.
 *
 * @param {NS} ns The Netscript API.
 */
function target_hack_lvl(ns) {
    const player = new Player(ns);
    return player.hacking_skill() + 5;
}
