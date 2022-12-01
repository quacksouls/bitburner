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

import { corp, corp_t, tobacco } from "/lib/constant/corp.js";
import { cities } from "/lib/constant/location.js";
import { wait_t } from "/lib/constant/time.js";
import { Corporation } from "/lib/corporation/corp.js";
import {
    create_product,
    discontinue_product,
    finishing_product,
    hire_advert_frugal,
    hireling,
    level_upgrade,
    sell_product,
} from "/lib/corporation/util.js";
import { log } from "/lib/io.js";
import { has_corporation_api } from "/lib/source.js";
import { assert } from "/lib/util.js";

/**
 * Take our corporation public and list it on the Stock Exchange.
 *
 * @param ns The Netscript API.
 */
async function go_public(ns) {
    const org = new Corporation(ns);
    while (!org.is_public()) {
        log(ns, "corporation is listed on Stock Exchange");
        org.go_public();
        await ns.sleep(wait_t.SECOND);
    }
    org.issue_dividends();
}

/**
 * Whether we have reached the maximum number of products for a particular
 * division.  The product capacity of the division is assumed to be at the
 * maximum possible.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 * @return True if the given division has the maximum number of products;
 *     false otherwise.
 */
function has_max_products(ns, div) {
    const org = new Corporation(ns);
    return org.all_products(div).length === corp_t.product.MAX;
}

/**
 * Hire a crop of employees for a division.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 */
async function hire(ns, div) {
    log(ns, `${div}: hiring a crop of employees`);
    for (const ct of cities.all) {
        const num = hire_increment(div, ct);
        for (const role of Object.values(corp.job)) {
            await hireling(ns, div, ct, num[role], role);
        }
    }
}

/**
 * The number of employees to hire for each role in a division.
 *
 * @param div A string representing the name of a division.
 * @param ct A string representing the name of a city.
 * @return An object as follows:
 *     {
 *         Business: Number, // Hire this many for Business role.
 *         Engineer: Number, // Hire this many for Engineer role.
 *         Management: Number, // Hire this many for Management role.
 *         Operations: Number, // Hire this many for Operations role.
 *         "Research & Development": Number, // Hire this many for R&D role.
 *         Training: Number, // Hire this many for Training role.
 *         Unassigned: Number, // Hire this many for Idle role.
 *     }
 */
function hire_increment(div, ct) {
    if (div === corp.industry.TOBACCO) {
        return {
            Business: tobacco[ct].hire.stage.n.BUSINESS,
            Engineer: tobacco[ct].hire.stage.n.ENGINEER,
            Management: tobacco[ct].hire.stage.n.MANAGEMENT,
            Operations: tobacco[ct].hire.stage.n.OPERATIONS,
            "Research & Development": tobacco[ct].hire.stage.n.RND,
            Training: tobacco[ct].hire.stage.n.TRAIN,
            Unassigned: tobacco[ct].hire.stage.n.IDLE,
        };
    }
}

/**
 * The product cycle.  This includes hiring, development, and selling.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 */
async function product_cycle(ns, div) {
    if (has_max_products(ns, div)) {
        return;
    }
    log(ns, `${div}: a round of product development`);
    await hire(ns, div);
    const name = create_product(ns, div);
    log(ns, `${div}: creating product: ${name}`);
    const upg = level_upgrade(ns);
    if (upg.length > 0) {
        log(ns, `${div}: levelled up upgrade(s): ${upg.join(", ")}`);
    }
    log(ns, `${div}: waiting for product to complete: ${name}`);
    await finishing_product(ns, div, name);
    log(ns, `${div}: hire AdVert.inc to advertise`);
    await hire_advert_frugal(ns, div);
    log(ns, `${div}: selling product: ${name}`);
    sell_product(ns, div, name);
}

/**
 * The maintenance loop.  We constantly maintain the various divisions of our
 * corporation.
 *
 * @param ns The Netscript API.
 * @param div A string representing the name of a division.
 */
async function update(ns, div) {
    // If we have developed the maximum number of products, then we must
    // discontinue a product to make room for a new product (possibly of higher
    // rating).
    if (has_max_products(ns, div)) {
        const name = discontinue_product(ns, div);
        log(ns, `${div}: discontinued a product: ${name}`);
    }
    await product_cycle(ns, div);
    const org = new Corporation(ns);
    log(ns, `${div}: waiting for each office to be vivacious`);
    await org.vivacious_office();
}

/**
 * Our corporation is now in maintenance mode.  Continue to maintain the various
 * divisions.
 *
 * Usage: run corporation/janitor.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("sleep");
    // Sanity checks.
    const org = new Corporation(ns);
    const division = [corp.industry.TOBACCO];
    assert(has_corporation_api(ns));
    assert(org.has_corp());
    assert(org.has_office_warehouse_api());
    division.forEach((div) => {
        assert(org.has_research(div, corp.research.CAPACITY_I));
        assert(org.has_research(div, corp.research.CAPACITY_II));
    });
    // Maintain our corporation.
    await go_public(ns);
    for (;;) {
        for (const div of division) {
            await update(ns, div);
        }
        await ns.sleep(5 * wait_t.MINUTE);
    }
}
