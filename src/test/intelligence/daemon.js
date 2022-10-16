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

import { intelligence } from "/intelligence/util.js";
import { bool } from "/lib/constant/bool.js";
import { wait_t } from "/lib/constant/time.js";
import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import { connect_to } from "/lib/singularity/network.js";
import { assert } from "/lib/util.js";

/**
 * Find and destroy the w0r1d_d43m0n server.
 *
 * @param ns The Netscript API.
 */
async function destroy(ns) {
    const server = new Server(ns, "w0r1d_d43m0n");
    const player = new Player(ns);
    while (player.hacking_skill() < server.hacking_skill()) {
        await ns.sleep(wait_t.DEFAULT);
    }
    while (!server.has_root_access()) {
        await ns.sleep(wait_t.DEFAULT);
        await server.gain_root_access();
    }
    assert(player.hacking_skill() >= server.hacking_skill());
    assert(server.has_root_access());
    // Now hack the target server.
    connect_to(ns, player.home(), server.hostname());
    const before = intelligence(ns);
    const file = "/intelligence/value-daemon.txt";
    const write_mode = "w";
    await ns.write(file, before, write_mode);
    await ns.singularity.installBackdoor();
}

/**
 * Destroy the w0r1d_d43m0n server.
 *
 * Usage: run singularity/daemon.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const augment = ns.singularity.getOwnedAugmentations(bool.NOT_PURCHASED);
    assert(augment.includes("The Red Pill"));
    await destroy(ns);
}