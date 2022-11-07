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

import { bool } from "/lib/constant/bool.js";
import { augment } from "/lib/constant/faction.js";
import { server } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { log } from "/lib/io.js";
import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import { join_all_factions } from "/lib/singularity/faction.js";
import { connect_to } from "/lib/singularity/network.js";
import { assert, cleanup } from "/lib/util.js";

/**
 * Find and destroy the w0r1d_d43m0n server.
 *
 * @param ns The Netscript API.
 */
async function destroy(ns) {
    log(ns, `Searching for target server: ${server.WD}`);
    const serv = new Server(ns, server.WD);
    const player = new Player(ns);
    while (player.hacking_skill() < serv.hacking_skill()) {
        await ns.sleep(wait_t.DEFAULT);
    }
    while (!serv.has_root_access()) {
        await ns.sleep(wait_t.DEFAULT);
        await serv.gain_root_access();
    }
    assert(player.hacking_skill() >= serv.hacking_skill());
    assert(serv.has_root_access());
    // First, try to raise our Intelligence stat.
    join_all_factions(ns);
    // Now hack the target server.
    cleanup(ns);
    connect_to(ns, player.home(), serv.hostname());
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
    const augmentation = ns.singularity.getOwnedAugmentations(
        bool.NOT_PURCHASED
    );
    if (!augmentation.includes(augment.TRP)) {
        return;
    }
    await destroy(ns);
}
