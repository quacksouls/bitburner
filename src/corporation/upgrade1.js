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

import { corp, corp_t } from "/lib/constant/corp.js";
import { cities } from "/lib/constant/location.js";
import { Corporation } from "/lib/corporation/corp.js";
import { Warehouse } from "/lib/corporation/store.js";
import { Cutil } from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { has_corporation_api } from "/lib/source.js";
import { assert, exec } from "/lib/util.js";

/**
 * Whether each warehouse has been upgraded for this round.
 *
 * @param ns The Netscript API.
 * @return True if each warehouse is upgraded to a given storage capacity.
 */
function all_warehouses_upgraded(ns) {
    const target = corp_t.warehouse.round.one.SIZE;
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
 * Level up various upgrades by 1 level.
 *
 * @param ns The Netscript API.
 */
function level_upgrade(ns) {
    const lvl = corp_t.upgrade.round.one.LEVEL;
    const org = new Corporation(ns);
    if (org.level(corp.upgrade.FACTORY) < lvl) {
        org.level_upgrade(corp.upgrade.FACTORY);
    }
    if (org.level(corp.upgrade.STORAGE) < lvl) {
        org.level_upgrade(corp.upgrade.STORAGE);
    }
}

/**
 * Level up various upgrades to a desired level.
 *
 * @param ns The Netscript API.
 */
async function level_up(ns) {
    const upg = [corp.upgrade.FACTORY, corp.upgrade.STORAGE];
    log(ns, `Level up these upgrades: ${upg.join(", ")}`);
    const lvl = corp_t.upgrade.round.one.LEVEL;
    for (;;) {
        const org = new Corporation(ns);
        if (
            org.level(corp.upgrade.FACTORY) >= lvl
            && org.level(corp.upgrade.STORAGE) >= lvl
        ) {
            break;
        }
        level_upgrade(ns);
        await ns.sleep(corp_t.TICK);
    }
    const org = new Corporation(ns);
    const lvl_factory = org.level(corp.upgrade.FACTORY);
    const lvl_storage = org.level(corp.upgrade.STORAGE);
    log(ns, `Upgraded ${corp.upgrade.FACTORY} to level ${lvl_factory}`);
    log(ns, `Upgraded ${corp.upgrade.STORAGE} to level ${lvl_storage}`);
}

/**
 * Upgrade the warehouse of each division in each city.
 *
 * @param ns The Netscript API.
 */
async function level_up_storage(ns) {
    log(ns, "Upgrading the storage capacity of each warehouse");
    while (!all_warehouses_upgraded(ns)) {
        upgrade_warehouse(ns);
        await ns.sleep(corp_t.TICK);
    }
    const size = ns.nFormat(corp_t.warehouse.round.one.SIZE, "0,00.00a");
    log(ns, `New storage capacity of each warehouse: ${size}`);
}

/**
 * Upgrade the storage capacity of each warehouse.
 *
 * @param ns The Netscript API.
 */
function upgrade_warehouse(ns) {
    Cutil.all_divisions(ns).forEach((div) => {
        cities.all.forEach((ct) => {
            const depo = new Warehouse(ns);
            if (depo.capacity(div, ct) < corp_t.warehouse.round.one.SIZE) {
                const howmany = 1;
                depo.upgrade_warehouse(div, ct, howmany);
            }
        });
    });
}

/**
 * Miscellaneous upgrades after the first round of investment.
 *
 * Usage: corporation/upgrade1.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Sanity check.
    assert(has_corporation_api(ns));
    assert(Cutil.has_corp(ns));
    assert(Cutil.has_office_warehouse_api(ns));
    // Manage our corporation.
    await level_up(ns);
    await level_up_storage(ns);
    // The next script in the load chain.
    exec(ns, "/corporation/material1.js");
}
