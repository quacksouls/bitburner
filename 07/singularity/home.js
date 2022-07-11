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

import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * Determine which to upgrade on the home server: Cores or RAM.
 *
 * @param ns The Netscript API.
 * @return A string having exactly one of the following values.
 *     (1) "Cores" := Upgrade the Cores on the home server.
 *     (2) "RAM" := Upgrade the RAM on the home server.
 *     (3) "" := The empty string, meaning do not upgrade anything on the home
 *         server.
 */
function choose_upgrade(ns) {
    // Do not upgrade anything.
    const player = new Player(ns);
    const server = new Server(ns, player.home());
    if (
        (server.cores() == core_limit()) && (server.ram_max() == ram_limit())
    ) {
        return "";
    }
    // Upgrade the Cores.
    const core_cost = ns.singularity.getUpgradeHomeCoresCost();
    const ram_cost = ns.singularity.getUpgradeHomeRamCost();
    if (core_cost < ram_cost) {
        if (server.cores() < core_limit()) {
            return "Cores";
        }
    }
    // Upgrade the RAM.
    assert((ram_cost >= core_cost) || (server.cores() == core_limit()));
    assert(server.ram_max() < ram_limit());
    return "RAM";
}

/**
 * The maximum number of Cores on the home server.
 */
function core_limit() {
    const limit = 8;
    return limit;
}

/**
 * The maximum amount of RAM on the home server.  This is not necessarily the
 * largest amount of RAM the home server can have.
 */
function ram_limit() {
    const limit = 33554432;
    return limit;
}

/**
 * Upgrade the Cores or RAM on the home server.
 *
 * @param ns The Netscript API.
 */
async function upgrade(ns) {
    const attribute = choose_upgrade(ns);
    if ("" == attribute) {
        return;
    }
    if ("Cores" == attribute) {
        await upgrade_cores(ns);
        return;
    }
    assert("RAM" == attribute);
    await upgrade_ram(ns);
}

/**
 * Upgrade the Cores on the home server.
 *
 * @param ns The Netscript API.
 */
async function upgrade_cores(ns) {
    const player = new Player(ns);
    const core_cost = ns.singularity.getUpgradeHomeCoresCost();
    while (player.money() < core_cost) {
        await work(ns);
    }
    let success = ns.singularity.upgradeHomeCores();
    while (!success) {
        await work(ns);
        success = ns.singularity.upgradeHomeCores();
    }
}

/**
 * Upgrade the RAM on the home server.
 *
 * @param ns The Netscript API.
 */
async function upgrade_ram(ns) {
    const player = new Player(ns);
    const ram_cost = ns.singularity.getUpgradeHomeRamCost();
    while (player.money() < ram_cost) {
        await work(ns);
    }
    let success = ns.singularity.upgradeHomeRam();
    while (!success) {
        await work(ns);
        success = ns.singularity.upgradeHomeRam();
    }
}

/**
 * Work to boost our income.
 *
 * @param ns The Netscript API.
 */
async function work(ns) {
    const hack_lvl = 250;
    const charisma_lvl = hack_lvl;
    const player = new Player(ns);
    assert(player.hacking_skill() >= hack_lvl);
    // If our Charisma is low, work as a software engineer to level up our
    // Charisma.  Otherwise work a business job because it usually pays higher
    // than a software or IT job.
    let field = "Business";
    if (player.charisma() < charisma_lvl) {
        field = "Software";
    }
    const company = "MegaCorp";
    const focus = true;
    ns.singularity.applyToCompany(company, field);
    const t = new Time();
    const time = t.minute();
    ns.singularity.workForCompany(company, focus);
    await ns.sleep(time);
    ns.singularity.stopAction();
}

/**
 * Upgrade the Cores and RAM on our home server.
 *
 * Usage: run singularity/home.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Less verbose log.
    ns.disableLog("sleep");

    await upgrade(ns);
    // The next script in the load chain.
    const player = new Player(ns);
    const script = "/singularity/install.js";
    const nthread = 1;
    ns.exec(script, player.home(), nthread);
}
