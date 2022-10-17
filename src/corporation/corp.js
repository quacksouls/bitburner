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

import { bitnode } from "/lib/constant/bn.js";
import { bool } from "/lib/constant/bool.js";
import { corp, corp_t } from "/lib/constant/corp.js";
import { wait_t } from "/lib/constant/time.js";
import { Player } from "/lib/player.js";

/**
 * Start a corporation.  We can start a corporation in one of two ways:
 *
 * (1) Self-funded.  Use $150b of our own money to start a corporation.  This
 *     works in any BitNode, but has the disadvantage that we must have at least
 *     $150b upfront.
 * (2) Get a loan.  Take out a loan of $150b to start our corporation.  This
 *     only works in BN3.
 *
 * @param ns The Netscript API.
 */
async function create_corp(ns) {
    const player = new Player(ns);
    // Assume we are in BN3.  Use our own money to start a corporation,
    // otherwise take out a loan.
    if (bitnode.Corporatocracy === player.bitnode()) {
        const self_fund = player.money() >= corp_t.SEED_COST;
        ns[corp.API].createCorporation(corp.NAME, self_fund);
        return;
    }
    // We are in a BitNode other than BN3.  Must use our own money to start a
    // corporation.  There is no option to take out a loan.
    while (player.money() < corp_t.SEED_COST) {
        await ns.sleep(wait_t.MILLISECOND);
    }
    ns[corp.API].createCorporation(corp.NAME, bool.SELF_FUND);
}

/**
 * Create and manage a corporation.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("sleep");

    await create_corp(ns);
}
