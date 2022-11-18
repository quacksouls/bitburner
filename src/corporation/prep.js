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

import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { Cutil } from "/lib/corporation/util.js";
import { has_corporation_api } from "/lib/source.js";
import { assert } from "/lib/util.js";

/**
 * Round one in preparing our corporation.  Perform these tasks in order:
 *
 * (1) Accept investment money.
 * (2) Level up various upgrades.
 *
 * @param ns The Netscript API.
 */
async function round_one(ns) {
    const script = [
        "/corporation/invest.js",
        "/corporation/hire.js",
        "/corporation/upgrade.js",
        "/corporation/storage.js",
    ];
    for (const s of script) {
        await run_task(ns, s, "one");
    }
}

/**
 * Execute a given script and wait for it to complete.
 *
 * @param ns The Netscript API.
 * @param script We want to execute this script.
 * @param arg Run the given script using this argument.
 */
async function run_task(ns, script, arg) {
    const nthread = 1;
    const pid = ns.exec(script, home, nthread, arg);
    while (ns.isRunning(pid)) {
        await ns.sleep(wait_t.SECOND);
    }
}

/**
 * Prepare our corporation after the initial setup.  We iterate over the
 * following cycle:
 *
 * (1) Accept investment money.
 * (2) Hire employees.
 * (3) Level up.
 * (4) Upgrade storage.
 * (5) Buy materials.
 *
 * Usage: run corporation/prep.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("sleep");
    // Sanity checks.
    assert(has_corporation_api(ns));
    assert(Cutil.has_corp(ns));
    assert(Cutil.has_office_warehouse_api(ns));
    // Various rounds of preparation.
    await round_one(ns);
}
