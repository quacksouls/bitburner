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

// Miscellaneous helper functions for scripts that use the Singularity API.

import { shortest_path } from "/lib/network.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Connect to a given server.  The target server can be multiple hops away.
 *
 * @param ns The Netscript API.
 * @param source The source node.  We are currently on this server.
 * @param target We want to connect to this server.  Not necessarily a neighbour node.
 */
export function connect_to(ns, source, target) {
    const path = shortest_path(ns, source, target);
    assert(path.length > 0);
    assert(source == path[0]);
    path.shift();
    while (path.length > 0) {
        const node = path.shift();
        assert(ns.singularity.connect(node));
    }
}

/**
 * Work to boost our income.
 *
 * @param ns The Netscript API.
 * @param company We want to work for this company.
 */
export async function work(ns, company) {
    const hack_lvl = 250;
    const charisma_lvl = hack_lvl;
    if (ns.getHackingLevel() < hack_lvl) {
        return;
    }
    // Work for a company.  Every once in a while, apply for a promotion to
    // earn more money per second.  By default, we work a business job.
    // However, if our Charisma level is low, work a software job instead to
    // raise our Charisma.
    let field = "Business";
    const stat = ns.getPlayer();
    if (stat.charisma < charisma_lvl) {
        field = "Software";
    }
    const focus = true;
    ns.singularity.applyToCompany(company, field);
    const t = new Time();
    const time = t.minute();
    ns.singularity.workForCompany(company, focus);
    await ns.sleep(time);
    ns.singularity.stopAction();
}
