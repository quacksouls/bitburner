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

import { intelligence } from "/intelligence/util.js";
import { all_programs, home } from "/lib/constant.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

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
    assert(!has_program(ns, program));
    // Ensure we meet the Hack stat requirement for creating the program.
    const threshold = hack_requirement(program);
    assert(threshold > 0);
    assert(ns.getHackingLevel() >= threshold);
    // Work on creating the program.
    const focus = true;
    const t = new Time();
    const time = t.minute();
    const before = intelligence(ns);
    assert(ns.singularity.createProgram(program, focus));
    while (ns.singularity.isBusy()) {
        assert(!has_program(ns, program));
        await ns.sleep(time);
    }
    assert(has_program(ns, program));
    const after = intelligence(ns);
    const gain = after - before;
    ns.tprint("Create program: " + program);
    ns.tprint("Intelligence before: " + before);
    ns.tprint("Intelligence after: " + after);
    ns.tprint("Intelligence xp gain: " + gain);
    ns.tprint("");
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
 * Determine the amount of Intelligence XP gained from creating various
 * programs.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    for (const [p, _] of all_programs()) {
        if (ns.getHackingLevel() < hack_requirement(p)) {
            continue;
        }
        if (has_program(ns, p)) {
            continue;
        }
        await create_program(ns, p);
    }
}
