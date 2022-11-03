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
import { assert, is_valid_city } from "/lib/util.js";

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
     * All divisions of our corporation.
     *
     * @return An array containing the names of all divisions of our
     *     corporation.
     */
    all_divisions() {
        return this.#ns[corp.API].getCorporation().divisions.map((d) => d.name);
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
     * Expand our corporation into other cities.  We open a division office in
     * another city.
     *
     * @param name A string representing the name of a division of our
     *     corporation.
     * @param city A string representing the name of a city.  We want to expand
     *     the given division into this city.
     * @return true if the expansion is successful or we already have a division
     *     office in the given city; false otherwise.
     */
    expand_city(name, city) {
        if (this.has_division_office(name, city)) {
            return bool.SUCCESS;
        }
        this.#ns[corp.API].expandCity(name, city);
        return this.has_division_office(name, city);
    }

    /**
     * Expand our corporation into other industries.
     */
    expand_industry() {
        if (!this.has_division(corp.industry.AGRI)) {
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
     * Whether we have already created a corporation.
     *
     * @return True if we have already created a corporation; false otherwise.
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
     * Whether we have a particular division.
     *
     * @param div A string representing the name of a division.
     * @return True if we have expanded into the given division;
     *     false otherwise.
     */
    has_division(div) {
        for (const d of this.#ns[corp.API].getCorporation().divisions) {
            if (d.type === div) {
                return bool.HAS;
            }
        }
        return bool.NOT;
    }

    /**
     * Whether one of our divisions has an office in a given city.
     *
     * @param name A string representing the name of a division.
     * @param city A string representing the name of a city.
     * @return True if the given division has an office in the particular city;
     *     false otherwise.
     */
    has_division_office(name, city) {
        assert(this.is_valid_division(name));
        assert(is_valid_city(city));
        for (const div of this.#ns[corp.API].getCorporation().divisions) {
            if (div.name === name) {
                return div.cities.includes(city);
            }
        }
    }

    /**
     * Whether we have an unlockable upgrade.
     *
     * @param upg A string representing the name of an unlock upgrade.
     * @return True if we already have the given unlock upgrade;
     *     false otherwise.
     */
    has_unlock_upgrade(upg) {
        assert(this.is_valid_unlock_upgrade(upg));
        return this.#ns[corp.API].hasUnlockUpgrade(upg);
    }

    /**
     * Hire a new employee for a division in a particular city.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return A string representing the name of the newly hired employee.  An
     *     empty string if we fail to hire a new employee.
     */
    hire(div, ct) {
        assert(this.is_valid_division(div));
        assert(is_valid_city(ct));
        const worker = this.#ns[corp.API].hireEmployee(div, ct);
        return worker !== undefined ? worker.name : "";
    }

    /**
     * Hire AdVert.inc to advertise for our company.
     *
     * @param div A string representing the name of a division.
     */
    hire_advert(div) {
        assert(this.is_valid_division(div));
        this.#ns[corp.API].hireAdVert(div);
    }

    /**
     * Hire the initial crop of employees for a new office in a city.  Assign an
     * employee to each of the initial positions.
     *
     * @param div The name of a division.
     * @param ct The name of a city.
     */
    initial_hire(div, ct) {
        for (let i = 0; i < corp_t.INIT_HIRE; i++) {
            const name = this.hire(div, ct);
            if (name !== "") {
                this.#ns[corp.API].assignJob(div, ct, name, corp.position[i]);
            }
        }
    }

    /**
     * Whether we have the given division.
     *
     * @param name A string representing the name of a division.
     * @return True if our corporation has a division with the given name;
     *     false otherwise.
     */
    is_valid_division(name) {
        assert(name !== "");
        for (const div of this.#ns[corp.API].getCorporation().divisions) {
            if (div.name === name) {
                return bool.VALID;
            }
        }
        return bool.INVALID;
    }

    /**
     * Whether the given name refers to a valid unlock upgrade.
     *
     * @param upg A string representing the name of an unlock upgrade.
     * @return True if the given name refers to a valid unlock upgrade;
     *     false otherwise.
     */
    // eslint-disable-next-line class-methods-use-this
    is_valid_unlock_upgrade(upg) {
        assert(upg !== "");
        const upgrade = new Set(Object.values(corp.unlock));
        return upgrade.has(upg);
    }
}
