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
import { wait_t } from "/quack/lib/constant/time.js";
import { error, log } from "/quack/lib/io.js";
import {
    augment_to_install,
    purchase_augment,
} from "/quack/lib/singularity/augment.js";
import { has_gang_api } from "/quack/lib/source.js";
import { exec } from "/quack/lib/util.js";

/**
 * Purchase Augmentations from our gang faction.
 *
 * @param {NS} ns The Netscript API.
 * @returns {Promise<boolean>} True if we bought at least one Augmentation;
 *     false otherwise.
 */
async function buy_augment(ns) {
    const { faction } = ns.gang.getGangInformation();
    await purchase_augment(
        ns,
        faction,
        bool.NO_STOP_TRADE,
        bool.NO_BUY_NFG,
        bool.NO_RAISE_MONEY
    );
    const to_install = augment_to_install(ns);
    return to_install.length > 0;
}

/**
 * Purchase Augmentations from the faction in which we created a gang.  We use
 * any money available to us.  This should help to speed up our run through a
 * BitNode.
 *
 * Usage: run quack/gang/augment.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    // Less verbose log.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");

    // Sanity check.
    if (!has_gang_api(ns)) {
        error(ns, "No access to Gang API");
        return;
    }

    // The update loop.
    while (!ns.gang.inGang()) {
        await ns.sleep(wait_t.DEFAULT);
    }
    const { faction } = ns.gang.getGangInformation();
    log(ns, `Purchasing Augmentations from gang faction ${faction}`);
    const success = await buy_augment(ns);
    if (success) {
        log(ns, `Bought Augmentations from ${faction}`);
        // The next script in the load chain.
        exec(ns, "/quack/singularity/home.js");
        return;
    }
    log(ns, `No Augmentations bought from ${faction}`);
}
