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
import { Player } from "/lib/player.js";
import { assert } from "/lib/util.js";

/**
 * A class to hold information about a corporation.  We use this class to help
 * us manage a corporation.  We typically use the Corporation API by calling its
 * functions along the format ns["Corporation"].functionName in order to
 * circumvent the high RAM cost.
 */
export class Corporation {
    /**
     * The namespace for the Netscript API.
     */
    #ns;

    /**
     * Initialize a Corporation object.
     *
     * @param ns The namespace for the Netscript API.
     */
    constructor(ns) {
        this.#ns = ns;
    }

    /**
     * Purchase an unlock upgrade.  This type of upgrade is a one-time
     * unlockable.  It applies to the entire corporation and cannot be levelled.
     *
     * @param upg A string representing the name of an unlock upgrade.
     * @return true if we successfully purchased the given unlock upgrade or
     *     already have it; false otherwise.
     */
    buy_unlock_upgrade(upg) {
        assert(this.is_valid_unlock_upgrade(upg));
        if (this.has_unlock_upgrade(upg)) {
            return bool.SUCCESS;
        }
        if (this.funds() < this.#ns[corp.API].getUnlockUpgradeCost(upg)) {
            return bool.FAILURE;
        }
        this.#ns[corp.API].unlockUpgrade(upg);
        return this.has_unlock_upgrade(upg);
    }

    /**
     * Start a corporation.  We can start a corporation in one of two ways:
     *
     * (1) Self-funded.  Use $150b of our own money to start a corporation.
     *     This works in any BitNode, but has the disadvantage that we must have
     *     at least $150b upfront.
     * (2) Get a loan.  Take out a loan of $150b to start our corporation.  This
     *     only works in BN3.
     *
     * @return true if our corporation is successfully created; false otherwise.
     */
    create() {
        const player = new Player(this.#ns);
        // Assume we are in BN3.  Use our own money to start a corporation,
        // otherwise take out a loan.
        if (bitnode.Corporatocracy === player.bitnode()) {
            const self_fund = player.money() >= corp_t.SEED_COST;
            return this.#ns[corp.API].createCorporation(corp.NAME, self_fund);
        }
        // We are in a BitNode other than BN3.  Must use our own money to start
        // a corporation.  There is no option to take out a loan.
        if (player.money() < corp_t.SEED_COST) {
            return bool.FAILURE;
        }
        return this.#ns[corp.API].createCorporation(corp.NAME, bool.SELF_FUND);
    }

    /**
     * Expand our corporation into other industries.
     */
    expand() {
        if (!this.has_agriculture()) {
            this.#ns[corp.API].expandIndustry(
                corp.industry.AGRI,
                corp.industry.AGRI
            );
        }
    }

    /**
     * The funds available to our corporation.
     */
    funds() {
        return this.#ns[corp.API].funds;
    }

    /**
     * Whether we have a division in the agriculture industry.
     *
     * @return true if we have expanded into the agriculture industry;
     *     false otherwise.
     */
    has_agriculture() {
        for (const d of this.#ns[corp.API].getCorporation().divisions) {
            if (d.type === corp.industry.AGRI) {
                return bool.HAS;
            }
        }
        return bool.NOT;
    }

    /**
     * Whether we have already created a corporation.
     *
     * @return true if we have already created a corporation; false otherwise.
     */
    has_corp() {
        try {
            assert(this.#ns[corp.API].getCorporation().name === corp.NAME);
            return bool.HAS;
        } catch {
            return bool.NOT;
        }
    }

    /**
     * Whether we have an unlockable upgrade.
     *
     * @param upg A string representing the name of an unlock upgrade.
     * @return true if we already have the given unlock upgrade;
     *     false otherwise.
     */
    has_unlock_upgrade(upg) {
        assert(this.is_valid_unlock_upgrade(upg));
        return this.#ns[corp.API].hasUnlockUpgrade(upg);
    }

    /**
     * Whether the given name refers to a valid unlock upgrade.
     *
     * @param upg A string representing the name of an unlock upgrade.
     * @return true if the given name refers to a valid unlock upgrade;
     *     false otherwise.
     */
    // eslint-disable-next-line class-methods-use-this
    is_valid_unlock_upgrade(upg) {
        assert(upg !== "");
        const upgrade = new Set(Object.values(corp.unlock));
        return upgrade.has(upg);
    }
}
