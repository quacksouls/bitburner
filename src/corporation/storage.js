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

import { corp_t } from "/lib/constant/corp.js";
import { cities } from "/lib/constant/location.js";
import { Warehouse } from "/lib/corporation/store.js";
import { Cutil } from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { has_corporation_api } from "/lib/source.js";
import { assert } from "/lib/util.js";

/**
 * Whether each warehouse has been upgraded for this round.
 *
 * @param ns The Netscript API.
 * @param n A string representing the investment round number.
 * @return True if each warehouse is upgraded to a given storage capacity.
 */
function all_warehouses_upgraded(ns, n) {
    const target = corp_t.warehouse.round[n].SIZE;
    for (const div of Cutil.all_divisions(ns)) {
        const depo = new Warehouse(ns);
        const not_upgraded = (c) => depo.capacity(div, c) < target;
        if (cities.all.some(not_upgraded)) {
            return false;
        }
    }
    return true;
}

/**
 * Upgrade the warehouse of each division in each city.
 *
 * @param ns The Netscript API.
 * @param n A string representing the investment round number.
 */
async function level_up_storage(ns, n) {
    log(ns, "Upgrading the storage capacity of each warehouse");
    while (!all_warehouses_upgraded(ns, n)) {
        upgrade_warehouse(ns, n);
        await ns.sleep(corp_t.TICK);
    }
    const size = ns.nFormat(corp_t.warehouse.round[n].SIZE, "0,00.00a");
    log(ns, `New storage capacity of each warehouse: ${size}`);
}

/**
 * Upgrade the storage capacity of each warehouse.
 *
 * @param ns The Netscript API.
 * @param n A string representing the investment round number.
 */
function upgrade_warehouse(ns, n) {
    Cutil.all_divisions(ns).forEach((div) => {
        cities.all.forEach((ct) => {
            const depo = new Warehouse(ns);
            if (depo.capacity(div, ct) < corp_t.warehouse.round[n].SIZE) {
                const howmany = 1;
                depo.upgrade_warehouse(div, ct, howmany);
            }
        });
    });
}

/**
 * Upgrade the storage of our warehouses.  This script accepts a command line
 * argument, i.e. a number representing the upgrade stage.  This upgrade stage
 * number, or round number, corresponds to the number of times we have accepted
 * investment money.  Pass in the round number as a word.  For example, if it is
 * round 1, then pass in the string "one".
 *
 * Usage: corporation/storage.js [roundNumber]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Sanity checks.
    assert(ns.args.length === 1);
    const round_n = ns.args[0];
    assert(Cutil.is_valid_round(round_n));
    assert(has_corporation_api(ns));
    assert(Cutil.has_corp(ns));
    assert(Cutil.has_office_warehouse_api(ns));
    // Upgrade the storage capacity of each warehouse.
    await level_up_storage(ns, round_n);
}
