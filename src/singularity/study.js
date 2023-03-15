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

import { bool } from "/quack/lib/constant/bool.js";
import { all_programs } from "/quack/lib/constant/exe.js";
import { home, home_t } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";
import { study } from "/quack/lib/singularity/study.js";
import { assert, exec } from "/quack/lib/util.js";

/**
 * If our home server is less than a mid-sized server, then run a script to
 * manage our farm of Hacknet nodes as well as another script to compromise
 * world servers.  Let each script run for a while, then kill it.  The reason is
 * that it is likely we do not have enough RAM on our home server to allow
 * multiple scripts to run in the background.
 *
 * @param ns The Netscript API.
 */
async function bootstrap(ns) {
    if (ns.getServer(home).maxRam < home_t.RAM_MID) {
        // const script = ["hnet-farm.js"];
        const script = [];
        for (const s of script) {
            assert(!ns.isRunning(s, home));
            exec(ns, s);
            await ns.sleep(wait_t.DEFAULT);
            ns.kill(s, home);
        }
    }
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
    assert(ns.singularity.createProgram(program, bool.FOCUS));
    while (ns.singularity.isBusy()) {
        assert(!has_program(ns, program));
        await ns.sleep(wait_t.DEFAULT);
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
 * Raise our Hack stat enough to allow us to create various programs.
 *
 * @param ns The Netscript API.
 */
async function study_and_create(ns) {
    const program = ["BruteSSH.exe", "FTPCrack.exe"];
    for (const p of program) {
        log(ns, `Raise Hack to create program ${p}`);
        await study(ns, hack_requirement(p));
        await bootstrap(ns);
        log(ns, `Create program ${p}`);
        await create_program(ns, p);
        await bootstrap(ns);
    }
}

/**
 * Study to raise our Hack stat so we can create various programs.
 *
 * Usage: run singularity/study.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");

    await study_and_create(ns);
    // The next segment in the load chain.
    exec(ns, "/quack/chain/money.js");
}
