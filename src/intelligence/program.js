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
    has_program,
    intelligence,
    intelligence_gain,
} from "/intelligence/util.js";
import { bool } from "/lib/constant/bool.js";
import { wait_t } from "/lib/constant/time.js";
import { assert } from "/lib/util.js";

/**
 * All programs that can be created.  These programs can also be purchased via
 * the dark web.  We exclude Formulas.exe because we permanently unlocked that
 * program after destroying BitNode 5.
 */
function all_programs() {
    // A map where the key/value pair is as follows:
    //
    // key := The name of a program.
    // value := The minimum Hack stat at which we are able to create the
    //     program.  This value is specific to the current save file.
    const program = new Map([
        ["BruteSSH.exe", 1],
        ["FTPCrack.exe", 24],
        ["HTTPWorm.exe", 424],
        ["relaySMTP.exe", 174],
        ["SQLInject.exe", 674],
        ["DeepscanV1.exe", 1],
        ["DeepscanV2.exe", 324],
        ["ServerProfiler.exe", 1],
        ["AutoLink.exe", 1],
    ]);
    return program;
}

/**
 * Whether we can create a given program.
 *
 * @param ns The Netscript API.
 * @param program A string representing the name of the program we want to
 *     create.
 * @return true if we meet the requirement to create the given program;
 *     false otherwise.
 */
function can_create(ns, program) {
    const prog = all_programs();
    const threshold = prog.get(program);
    assert(threshold > 0);
    return ns.getHackingLevel() >= threshold;
}

/**
 * Create a program.
 *
 * @param ns The Netscript API.
 * @param program A string representing the name of the program we want to
 *     create.
 */
async function create_program(ns, program) {
    // Work on creating the program.
    const before = intelligence(ns);
    assert(ns.singularity.createProgram(program, bool.FOCUS));
    while (ns.singularity.isBusy()) {
        await ns.sleep(wait_t.DEFAULT);
    }
    assert(has_program(ns, program));
    const after = intelligence(ns);
    const action = `Create program: ${program}`;
    intelligence_gain(ns, before, after, action);
}

/**
 * Whether a given string represents a valid program.
 *
 * @param prog A string representing a program name.
 * @return true if the given string represents a valid program;
 *     false otherwise.
 */
function is_valid_program(prog) {
    assert(prog.length > 0);
    const program = all_programs();
    return program.has(prog);
}

/**
 * Determine the amount of Intelligence XP gained from creating various
 * programs.  This script accepts a command line argument, i.e. the name
 * of the program to create.
 *
 * Usage: run intelligence/program.js [programName]
 * Example: run intelligence/program.js BruteSSH.exe
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const prog = ns.args[0];
    assert(is_valid_program(prog));
    if (has_program(ns, prog)) {
        return;
    }
    assert(can_create(ns, prog));
    await create_program(ns, prog);
}
