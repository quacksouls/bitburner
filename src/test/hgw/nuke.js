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

import { wait_t } from "/quack/lib/constant/time.js";
import { network } from "/quack/lib/network.js";
import { nuke_servers } from "/quack/lib/util.js";

/**
 * Continuously try to nuke world servers.
 *
 * Usage: run quack/test/hgw/nuke.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    for (;;) {
        nuke_servers(ns, network(ns));
        await ns.sleep(wait_t.MINUTE);
    }
}
