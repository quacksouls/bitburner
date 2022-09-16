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

import { intelligence, intelligence_gain } from "/intelligence/util.js";
import { home } from "/lib/constant/misc.js";
import { Player } from "/lib/player.js";
import { Server} from "/lib/server.js";
import { assert } from "/lib/util.js";

/**
 * Upgrade the number of Cores on the home server.
 *
 * @param ns The Netscript API.
 */
function upgrade_core(ns) {
    const player = new Player(ns);
    if (player.money() < ns.singularity.getUpgradeHomeCoresCost()) {
        return;
    }
    const server = new Server(ns, home);
    const cores_before = server.cores();
    const before = intelligence(ns);
    assert(ns.singularity.upgradeHomeCores());
    const cores_after = server.cores();
    const after = intelligence(ns);
    const action = "Upgrade home Cores: " + cores_before + " -> " + cores_after;
    intelligence_gain(ns, before, after, action);
}

/**
 * Upgrade the amount of RAM on the home server.
 *
 * @param ns The Netscript API.
 */
function upgrade_ram(ns) {
    const player = new Player(ns);
    if (player.money() < ns.singularity.getUpgradeHomeRamCost()) {
        return;
    }
    const server = new Server(ns, home);
    const ram_before = server.ram_max();
    const before = intelligence(ns);
    assert(ns.singularity.upgradeHomeRam());
    const ram_after = server.ram_max();
    const after = intelligence(ns);
    const action = "Upgrade home RAM: " + ram_before + " -> " + ram_after;
    intelligence_gain(ns, before, after, action);
}

/**
 * Determine the amount of Intelligence XP gained from upgrading the Cores and
 * RAM on the home server.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    upgrade_ram(ns);
    upgrade_core(ns);
}
