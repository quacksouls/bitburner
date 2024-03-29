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
import { crimes } from "/quack/lib/constant/crime.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";
import { exec, has_all_popen } from "/quack/lib/util.js";

/**
 * Commit crime to raise money for purchasing port opener programs.  Stop as
 * soon as we have bought all port opener programs.
 *
 * @param {NS} ns The Netscript API.
 */
async function commit_crime(ns) {
    log(ns, `Commit ${crimes.KILL} to raise money`);
    ns.singularity.commitCrime(crimes.KILL, bool.FOCUS);
    while (!has_all_popen(ns)) {
        await ns.sleep(wait_t.DEFAULT);
    }
    ns.singularity.stopAction();
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("singularity.applyToCompany");
    ns.disableLog("singularity.workForCompany");
    ns.disableLog("sleep");
}

/**
 * Purchase various programs from the dark web.
 *
 * Usage: run quack/singularity/program.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    await commit_crime(ns);
    exec(ns, "/quack/chain/faction.js");
}
