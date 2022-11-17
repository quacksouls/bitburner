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
import { Cutil } from "/lib/corporation/util.js";
import { Player } from "/lib/player.js";
import { assert, is_valid_city } from "/lib/util.js";

/**
 * A class to manage a corporation.  We typically use the Corporation API by
 * calling its functions along the format
 *
 * ns["corporation"].functionName()
 *
 * as a means of circumventing the high RAM cost.
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
     * @return True if we successfully purchased the given unlock upgrade or
     *     already have it; false otherwise.
     */
    buy_unlock_upgrade(upg) {
        assert(Cutil.is_valid_unlock_upgrade(upg));
        if (Cutil.has_unlock_upgrade(this.#ns, upg)) {
            return bool.SUCCESS;
        }
        const cost = this.#ns[corp.API].getUnlockUpgradeCost(upg);
        if (Cutil.funds(this.#ns) < cost) {
            return bool.FAILURE;
        }
        this.#ns[corp.API].unlockUpgrade(upg);
        return Cutil.has_unlock_upgrade(this.#ns, upg);
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
     * @return True if our corporation is successfully created; false otherwise.
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
     * @param div A string representing the name of a division of our
     *     corporation.
     * @param ct A string representing the name of a city.  We want to expand
     *     the given division into this city.
     * @return True if the expansion is successful or we already have a division
     *     office in the given city; false otherwise.
     */
    expand_city(div, ct) {
        if (Cutil.has_division_office(this.#ns, div, ct)) {
            return bool.SUCCESS;
        }
        this.#ns[corp.API].expandCity(div, ct);
        return Cutil.has_division_office(this.#ns, div, ct);
    }

    /**
     * Expand our corporation into another industry.
     *
     * @param ind We want to expand into this industry.
     */
    expand_industry(ind) {
        assert(Cutil.is_valid_industry(ind));
        if (!Cutil.has_division(this.#ns, ind)) {
            this.#ns[corp.API].expandIndustry(ind, ind);
        }
    }

    /**
     * Hire AdVert.inc to advertise for our corporation.
     *
     * @param div A string representing the name of a division.
     * @return True if the hiring was successful; false otherwise.
     */
    hire_advert(div) {
        assert(Cutil.has_division(this.#ns, div));
        const cost = this.#ns[corp.API].getHireAdVertCost(div);
        if (Cutil.funds(this.#ns) > cost) {
            this.#ns[corp.API].hireAdVert(div);
            return bool.SUCCESS;
        }
        return bool.FAILURE;
    }

    /**
     * The level of an upgrade that can be levelled.
     *
     * @param name The name of an upgrade that can be levelled.
     * @return The level of the given upgrade.
     */
    level(name) {
        assert(Cutil.is_valid_upgrade(name));
        return this.#ns[corp.API].getUpgradeLevel(name);
    }

    /**
     * Level up an upgrade that can be levelled.  A level upgrade is not the
     * same as an unlock upgrade.
     *
     * @param name The name of the upgrade to level.
     * @return True if we successfully levelled up the given upgrade;
     *     false otherwise.
     */
    level_upgrade(name) {
        assert(Cutil.is_valid_upgrade(name));
        const cost = this.#ns[corp.API].getUpgradeLevelCost(name);
        if (Cutil.funds(this.#ns) < cost) {
            return bool.FAILURE;
        }
        this.#ns[corp.API].levelUpgrade(name);
        return bool.SUCCESS;
    }

    /**
     * Purchase an amount of a material.  We buy this material for a division in
     * a particular city.
     *
     * @param div The name of a division.
     * @param ct The name of a city.
     * @param name The name of the material to buy.
     * @param amt The amount to buy.
     */
    async material_buy(div, ct, name, amt) {
        assert(Cutil.has_division(this.#ns, div));
        assert(is_valid_city(ct));
        assert(Cutil.is_valid_material(name));
        assert(amt > 0);
        const rate = amt / corp_t.TICK_SECOND; // Amount per second.
        let { qty } = this.#ns[corp.API].getMaterial(div, ct, name);
        const target = qty + amt;
        this.#ns[corp.API].buyMaterial(div, ct, name, rate);
        while (qty < target) {
            await this.#ns.sleep(wait_t.MILLISECOND);
            qty = this.#ns[corp.API].getMaterial(div, ct, name).qty;
        }
        this.#ns[corp.API].buyMaterial(div, ct, name, 0);
    }

    /**
     * The initial selling of our materials.  The amount is the maximum of
     * whatever we have.  The price is set at the market price.
     *
     * @param div The name of a division.
     * @param ct The name of a city.
     * @param name The name of the material to sell.
     */
    material_initial_sell(div, ct, name) {
        assert(Cutil.has_division(this.#ns, div));
        assert(is_valid_city(ct));
        assert(Cutil.is_valid_material(name));
        this.#ns[corp.API].sellMaterial(
            div,
            ct,
            name,
            corp_t.sell.amount.MAX,
            corp_t.sell.price.MP
        );
    }

    /**
     * The amount of a material currently held in a warehouse of a city.
     *
     * @param div The name of a division.
     * @param ct The name of a city.
     * @param name The name of the material.
     * @return The amount of the given material currently held in the warehouse
     *     of the particular division, in the given city.
     */
    material_qty(div, ct, name) {
        assert(Cutil.has_division(this.#ns, div));
        assert(is_valid_city(ct));
        assert(Cutil.is_valid_material(name));
        return this.#ns[corp.API].getMaterial(div, ct, name).qty;
    }
}
