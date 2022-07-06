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
    home, program as popen, utility_program as utilp
} from "/lib/constant.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * All programs that can be created.  These programs can also be purchased via
 * the dark web.
 */
function all_programs() {
    const program = new Map();
    program.set("BruteSSH.exe", 50);
    program.set("FTPCrack.exe", 100);
    program.set("HTTPWorm.exe", 500);
    program.set("relaySMTP.exe", 250);
    program.set("SQLInject.exe", 750);
    program.set("DeepscanV1.exe", 75);
    program.set("DeepscanV2.exe", 400);
    program.set("ServerProfiler.exe", 75);
    program.set("AutoLink.exe", 25);
    program.set("Formulas.exe", 1000);
    return program;
}

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
    await buy_programs(ns, utilp);
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
    const time = t.minute();
    while (prog.length > 0) {
        const [p, cost] = cheapest(ns, prog);
        while (ns.getServerMoneyAvailable(home) < cost) {
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
    const time = t.minute();
    while (!ns.singularity.purchaseTor()) {
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
 * Create a program.
 *
 * @param ns The Netscript API.
 * @param program A string representing the name of the program we want to
 *     create.
 */
async function create_program(ns, program) {
    // Sanity checks.
    assert(program.length > 0);
    assert(is_valid_program(program));
    // Do we already have the program?  We can have a program without meeting
    // the Hack stat requirement to create the program.  A number of
    // Augmentations allow us to start with various programs after a soft reset.
    if (has_program(ns, program)) {
        return;
    }
    // Ensure we meet the Hack stat requirement for creating the program.
    const threshold = hack_requirement(program);
    assert(threshold > 0);
    assert(ns.getHackingLevel() >= threshold);
    // Work on creating the program.
    const focus = true;
    const t = new Time();
    const time = t.minute();
    assert(ns.singularity.createProgram(program, focus));
    while (ns.singularity.isBusy()) {
        assert(!has_program(ns, program));
        await ns.sleep(time);
    }
    assert(has_program(ns, program));
}

/**
 * The Hack stat requirement for creating a program.
 *
 * @param program We want the Hack stat requirement for this program.
 * @return The Hack stat required to create the given program.
 */
function hack_requirement(program) {
    const prog = all_programs();
    return prog.get(program);
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
 * Study at Rotham University to raise our Hack stat.  Use this function
 * under the following situations:
 *
 * (1) Immediately after installing one or more Augmentations.
 * (2) When we start all over on a different BitNode.
 *
 * This function assumes the player is currently in Sector-12.
 *
 * @param ns The Netscript API.
 * @param threshold Study until we have reached at least this amount of
 *     Hack stat.
 */
async function study(ns, threshold) {
    assert(threshold > 0);
    // Study the free computer science course at a university.
    const uni = "Rothman University";
    const course = "Study Computer Science";
    const focus = true;
    assert(ns.singularity.universityCourse(uni, course, focus));
    // Stop our study when our Hack stat is at least the given threshold.
    const t = new Time();
    const time = 10 * t.second();
    while (ns.getHackingLevel() < threshold) {
        await ns.sleep(time);
    }
    assert(ns.singularity.stopAction());
}

/**
 * Create various programs.
 *
 * Usage: run singularity/program.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Study to raise our Hack stat high enough so we can begin creating the
    // BruteSSH.exe program.
    const sshp = "BruteSSH.exe";
    const ssh_threshold = hack_requirement(sshp);
    await study(ns, ssh_threshold);
    await create_program(ns, sshp);
    // Study some more to raise our Hack stat high enough so we can begin
    // creating the FTPCrack.exe program.
    const ftpp = "FTPCrack.exe";
    const ftp_threshold = hack_requirement(ftpp);
    await study(ns, ftp_threshold);
    await create_program(ns, ftpp);
    // Purchase all programs via the dark web.
    await buy_all_programs(ns);
}
