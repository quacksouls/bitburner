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
import { corp } from "/lib/constant/corp.js";
import { cities } from "/lib/constant/location.js";
import { wait_t } from "/lib/constant/time.js";
import { Corporation } from "/lib/corporation/corp.js";
import { has_corporation_api } from "/lib/source.js";

/**
 * Create a corporation.
 *
 * @param ns The Netscript API.
 */
async function create_corp(ns) {
    const org = new Corporation(ns);
    if (org.has_corp()) {
        return;
    }
    while (!org.create()) {
        await ns.sleep(wait_t.DEFAULT);
    }
}

/**
 * Expand our divisions by opening offices in other cities.
 *
 * @param ns The Netscript API.
 */
function expand_city(ns) {
    const org = new Corporation(ns);
    for (const div of org.all_divisions()) {
        cities.all.forEach((ct) => {
            if (!org.has_division_office(div, ct)) {
                org.expand_city(div, ct);
            }
        });
    }
}

/**
 * Expand into other industries.
 *
 * @param ns The Netscript API.
 */
function expand_industry(ns) {
    const org = new Corporation(ns);
    org.expand_industry();
}

/**
 * Whether we have access to the Office and Warehouse APIs.  We have permanent
 * access to these APIs after we have destroyed BN3.3.
 */
function has_office_warehouse_api(ns) {
    const org = new Corporation(ns);
    return (
        org.has_unlock_upgrade(corp.unlock.OFFICE)
        && org.has_unlock_upgrade(corp.unlock.WAREHOUSE)
    );
}

/**
 * Purchase an unlock upgrade.  This is a one-time unlockable upgrade.  It
 * applies to the entire corporation and cannot be levelled.
 *
 * @param ns The Netscript API.
 */
function unlock_upgrade(ns) {
    const org = new Corporation(ns);
    if (!org.has_unlock_upgrade(corp.unlock.SMART)) {
        org.buy_unlock_upgrade(corp.unlock.SMART);
        ns[corp.API].setSmartSupply(
            corp.industry.AGRI,
            "Sector-12",
            bool.ENABLE
        );
    }
}

/**
 * Create and manage a corporation.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");
    // Sanity check.
    if (!has_corporation_api(ns)) {
        return;
    }
    // Create our corporation.  If we do not have access to the Office and
    // Warehouse APIs, then we cannot automate the early stages of our
    // corporation.  We want to automate as much of the game as possible.
    // Without the above APIs, quit the script as soon as possible.
    await create_corp(ns);
    if (!has_office_warehouse_api(ns)) {
        return;
    }
    // Manage our corporation.
    expand_industry(ns);
    unlock_upgrade(ns);
    expand_city(ns);
}
