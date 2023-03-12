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
import { hgw } from "/quack/lib/constant/misc.js";
import { server } from "/quack/lib/constant/server.js";
import { assemble_botnet, hgw_action, prep_gw } from "/quack/lib/hgw.js";
import { log } from "/quack/lib/io.js";

/**
 * Continuously hack a server.  Steal a certain percentage of the server's
 * money, then weaken/grow the server until it is at minimum security level and
 * maximum money.  Rinse and repeat.
 *
 * @param ns The Netscript API.
 * @param host Hack this server.
 */
async function hack(ns, host) {
    for (;;) {
        await prep_gw(ns, host);
        const botnet = assemble_botnet(
            ns,
            host,
            hgw.hack[host].FRACTION,
            bool.NOT_PREP
        );
        await hgw_action(ns, host, botnet, hgw.action.HACK);
    }
}

/**
 * A sequential batcher that pools the resources of world servers to target a
 * common server.  Each of the hack, grow, and weaken functions is separated
 * into its own script.  When we need a particular HGW action, we launch the
 * appropriate script against a target server.  We pool the resources of all
 * world servers, excluding our home server and purchased servers.
 *
 * Usage: run quack/hgw/world.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const host = server.JOES;
    log(ns, `Prep and hack ${host}`);
    await hack(ns, host);
}
