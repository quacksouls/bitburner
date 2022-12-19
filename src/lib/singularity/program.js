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

import { program as popen } from "/lib/constant/exe.js";
import { darkweb, work_hack_lvl } from "/lib/constant/misc.js";
import { wait_t } from "/lib/constant/time.js";
import { log } from "/lib/io.js";
import { Player } from "/lib/player.js";
import { raise_hack } from "/lib/singularity/study.js";
import { choose_hardware_company } from "/lib/singularity/util.js";
import { work } from "/lib/singularity/work.js";
import { assert } from "/lib/util.js";

// Utility functions related to programs.

/**
 * Purchase all programs from the dark web.
 *
 * @param ns The Netscript API.
 * @param visit A boolean signifying whether to visit a hardware store.
 *     Although not required, we typically visit a hardware store to increase
 *     our Intelligence XP.
 * @param wrk A boolean signifying whether to work to increase our funds or
 *     required stats.  We require money to puchase programs.  In most cases, we
 *     require certain stats to be offered a job.
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
    assert(program.length > 0);
    const player = new Player(ns);
    program = program.filter((p) => !player.has_program(p));
    if (program.length === 0) {
        return;
    }
    // Purchase all remaining programs.
    await buy_programs(ns, popen, wrk);
}

/**
 * Purchase all programs from a given list.
 *
 * @param ns The Netscript API.
 * @param program We want to buy all programs from this list.
 * @param wrk A boolean signifying whether to work to increase our funds or
 *     required stats.  We require money to puchase programs.  In most cases, we
 *     require certain stats to be offered a job.
 */
async function buy_programs(ns, program, wrk) {
    assert(program.length > 0);
    // First, determine which programs we do not have.
    const player = new Player(ns);
    let prog = Array.from(program);
    prog = prog.filter((p) => !player.has_program(p));
    if (prog.length === 0) {
        return;
    }
    // Purchase the remaining programs.
    log(ns, `Buying port openers: ${prog.join(", ")}`);
    while (prog.length > 0) {
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
 * @param ns The Netscript API.
 * @param wrk A boolean signifying whether to work to increase our funds or
 *     required stats.  We require money to puchase the Tor router.  In most
 *     cases, we require certain stats to be offered a job.
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
 * Raise our Hack stat to at least a given number.
 *
 * @param ns The Netscript API.
 */
function target_hack_lvl(ns) {
    const player = new Player(ns);
    return player.hacking_skill() + 5;
}
