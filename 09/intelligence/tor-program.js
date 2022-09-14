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
    has_program, intelligence, intelligence_gain
} from "/intelligence/util.js";
import { all_programs } from "/lib/constant.exe.js";
import { Player } from "/lib/player.js";
import { assert } from "/lib/util.js";

/**
 * Use the dark web to purchase various programs.
 *
 * @param ns The Netscript API.
 */
function purchase_programs(ns) {
    const player = new Player(ns);
    for (const [p, _] of all_programs()) {
        // We already have the program.
        if (has_program(ns, p)) {
            continue;
        }
        // We do not have enough money to buy the program.
        const cost = ns.singularity.getDarkwebProgramCost(p);
        if (player.money() < cost) {
            continue;
        }
        // Purchase the program.
        const before = intelligence(ns);
        assert(ns.singularity.purchaseProgram(p));
        const after = intelligence(ns);
        const action = "Purchase " + p + " via dark web";
        intelligence_gain(ns, before, after, action);
    }
}

/**
 * Obtain Intelligence XP by purchasing programs through the dark web.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    purchase_programs(ns);
}
