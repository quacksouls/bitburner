/**
 * Copyright (C) 2023 Duck McSouls
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

import { home, server } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { Server } from "/quack/lib/server.js";
import { shell } from "/quack/lib/util.js";

/**
 * Hack ecorp from the terminal.  We use an exploit to simulate terminal input.
 *
 * Usage: run quack/intelligence/ecorp.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const target = new Server(ns, server.ECORP);
    while (!target.gain_root_access()) {
        await ns.sleep(wait_t.DEFAULT);
    }

    const option = { preventDuplicates: true, threads: 1 };
    const pid = ns.exec("/quack/connect.js", home, option, server.ECORP);
    while (ns.isRunning(pid)) {
        await ns.sleep(wait_t.DEFAULT);
    }

    for (;;) {
        const time = Math.ceil(ns.getHackTime(server.ECORP));
        try {
            shell("hack");
        } catch {}
        await ns.sleep(time);
    }
}
