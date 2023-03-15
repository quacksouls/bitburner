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

import { colour } from "/quack/lib/constant/misc.js";
import { home, home_t } from "/quack/lib/constant/server.js";
import { log } from "/quack/lib/io.js";
import { has_singularity_api } from "/quack/lib/source.js";
import { assert, exec, is_empty_string } from "/quack/lib/util.js";

/**
 * Restart our source of income and Hack XP.  This script is useful whenever we
 * have installed a bunch of Augmentations and we want to automatically restart
 * scripts to farm Hack XP and money.
 *
 * Usage: run quack/go.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    // Check whether we have access to the Singularity API.  If the check fails,
    // then we cannot automate the game play so we exit the script.
    if (!has_singularity_api(ns)) {
        log(
            ns,
            "No access to Singularity API. Cannot automate game play.",
            colour.RED
        );
        return;
    }

    // Run some or all utility scripts, depending on the amount of RAM on our
    // home server.
    exec(ns, "/quack/hash.js");
    const server = ns.getServer(home);
    let script = "";
    if (server.maxRam >= home_t.RAM_HIGH) {
        script = "/quack/go-high.js";
    } else if (server.maxRam >= home_t.RAM_MID) {
        script = "/quack/go-mid.js";
    } else {
        assert(server.maxRam < home_t.RAM_MID);
        script = "/quack/go-low.js";
    }
    assert(!is_empty_string(script));
    exec(ns, script);
}
