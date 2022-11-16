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
import { corp, corp_t } from "/lib/constant/corp.js";
import { cities } from "/lib/constant/location.js";
import { Cutil } from "/lib/corporation/util.js";
import { assert, is_valid_city } from "/lib/util.js";

/**
 * A class to manage the warehouse of a corporation.  We typically use the
 * Corporation API by calling its functions along the format
 *
 * ns["corporation"].functionName()
 *
 * as a means of circumventing the high RAM cost.
 */
export class Warehouse {
    /**
     * The namespace for the Netscript API.
     */
    #ns;

    /**
     * Initialize a Warehouse object.
     *
     * @param ns The namespace for the Netscript API.
     */
    constructor(ns) {
        this.#ns = ns;
    }

    /**
     * Purchase a warehouse for a division in a particular city.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return True if the purchase was successful; false otherwise.
     */
    buy_warehouse(div, ct) {
        assert(Cutil.has_division(this.#ns, div));
        assert(is_valid_city(ct));
        const cost = this.#ns[corp.API].getPurchaseWarehouseCost();
        if (Cutil.funds(this.#ns) < cost) {
            return bool.FAILURE;
        }
        this.#ns[corp.API].purchaseWarehouse(div, ct);
        return bool.SUCCESS;
    }

    /**
     * Enable Smart Supply for the warehouse of each division in each city.
     */
    enable_smart_supply() {
        Cutil.all_divisions(this.#ns).forEach((div) => {
            cities.all.forEach((ct) => {
                this.#ns[corp.API].setSmartSupply(div, ct, bool.ENABLE);
            });
        });
    }

    /**
     * Upgrade the warehouse of a division in a particular city.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @param n How many times to upgrade.  Must be a positive integer.
     * @return True if the upgrade was successful; false otherwise.
     */
    upgrade_warehouse(div, ct, n) {
        assert(Cutil.has_division(this.#ns, div));
        assert(is_valid_city(ct));
        assert(n >= 1);
        const cost = this.#ns[corp.API].getUpgradeWarehouseCost(div, ct, n);
        if (Cutil.funds(this.#ns) < cost) {
            return bool.FAILURE;
        }
        this.#ns[corp.API].upgradeWarehouse(div, ct, n);
        return bool.SUCCESS;
    }

    /**
     * Upgrade a newly purchased warehouse to the initial capacity.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     */
    warehouse_init_upgrade(div, ct) {
        assert(Cutil.has_division(this.#ns, div));
        assert(is_valid_city(ct));
        const howmany = 1;
        while (
            this.#ns[corp.API].getWarehouse(div, ct).size
            < corp_t.warehouse.INIT_UPGRADE_SIZE
        ) {
            this.upgrade_warehouse(div, ct, howmany);
        }
    }
}
