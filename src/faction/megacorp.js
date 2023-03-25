/**
 * Copyright (C) 2022--2023 Duck McSouls
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

import { bool } from "/quack/lib/constant/bool.js";
import { faction_req, faction_t } from "/quack/lib/constant/faction.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { job_area } from "/quack/lib/constant/work.js";
import { Server } from "/quack/lib/server.js";
import { purchase_augment } from "/quack/lib/singularity/augment.js";
import {
    join_faction,
    work_for_faction,
} from "/quack/lib/singularity/faction.js";
import {
    install_backdoor,
    visit_city,
} from "/quack/lib/singularity/network.js";
import { raise_hack } from "/quack/lib/singularity/study.js";
import { choose_field, work_for_company } from "/quack/lib/singularity/work.js";
import { assert, exec, has_required_hack } from "/quack/lib/util.js";

/**
 * Install a backdoor on a megacorporation server.  Since version 2.0 of the
 * game, we must have at least 400k reputation with a megacorporation as a
 * pre-requisite for receiving an invitation from the corresponding faction.
 * Installing a backdoor on the company server would reduce the reputation
 * requirement to 300k.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} fac The name of a megacorporation faction.
 */
async function install_backdoor_on_server(ns, fac) {
    // Ensure we have the required Hack stat.
    const server = new Server(ns, faction_req[fac].backdoor);
    if (!has_required_hack(ns, server.hostname())) {
        await raise_hack(ns, server.hacking_skill());
    }
    assert(has_required_hack(ns, server.hostname()));

    // Ensure we have root access on the target server.
    while (!server.has_root_access()) {
        server.gain_root_access();
        await ns.sleep(wait_t.SECOND);
    }
    assert(server.has_root_access());
    await install_backdoor(ns, server.hostname());
}

/**
 * Join a megacorporation faction.  The requirements for receiving an
 * invitation are:
 *
 * (1) Travel to a particular city where a megacorporation is located.
 * (2) Work for the megacorporation to earn a given amount of reputation points.
 * (3) Continue working for the company until we have received an invitation.
 *     Even if we satisfy the above 2 requirements, we would not receive an
 *     invitation if we are not currently an employee of the company.
 *
 * The exception is Fulcrum Technologies.  In addition to the above
 * requirements, this megacorporation also requires us to install a backdoor on
 * the fulcrumassets server.  The invitation is sent from Fulcrum Secret
 * Technologies, not Fulcrum Technologies.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} company We want to work for this company and raise our
 *     reputation within the company.
 * @param {string} fac Our aim is to join this faction.
 * @param {number} rep Must earn at least this amount of reputation points
 *     within the company.
 */
async function megacorporation(ns, company, fac, rep) {
    // Relocate to raise Intelligence XP.
    await visit_city(ns, faction_req[fac].city);
    ns.singularity.goToLocation(company);

    // Work for the company to earn the required reputation points.  Must
    // continue working for the company until we receive an invitation from
    // the company faction.
    await work_for_company(ns, company, rep);
    ns.singularity.applyToCompany(company, choose_field(ns));
    ns.singularity.workForCompany(company, bool.FOCUS);

    // Join the faction, earn reputation points, and purchase all
    // Augmentations.  Ensure we remain an employee of the company.  Wait until
    // we have joined the company faction, then quit our job at the company.
    await join_faction(ns, fac);
    ns.singularity.quitJob(company);
    await work_for_faction(ns, fac, job_area.HACK);
    await purchase_augment(
        ns,
        fac,
        bool.STOP_TRADE,
        bool.BUY_NFG,
        bool.RAISE_MONEY
    );
}

/**
 * Various sanity checks of a parameter.
 *
 * @param {string} fac Sanity check this parameter.
 */
function sanity_check(fac) {
    assert(
        fac === "Bachman & Associates"
            || fac === "Blade Industries"
            || fac === "Clarke Incorporated"
            || fac === "ECorp"
            || fac === "Four Sigma"
            || fac === "Fulcrum Secret Technologies"
            || fac === "KuaiGong International"
            || fac === "MegaCorp"
            || fac === "NWO"
            || fac === "OmniTek Incorporated"
    );
}

/**
 * Suppress various log messages.
 *
 * @param {NS} ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("scan");
    ns.disableLog("singularity.applyToCompany");
    ns.disableLog("singularity.workForCompany");
    ns.disableLog("sleep");
}

/**
 * Join a megacorporation faction.  The megacorporation factions are:
 * Bachman & Associates, Blade Industries, Clarke Incorporated, ECorp,
 * Four Sigma, Fulcrum Secret Technologies, KuaiGong International, MegaCorp,
 * NWO, OmniTek Incorporated.  This script accepts a command line argument,
 * i.e. the name of a faction.
 *
 * Usage: run quack/faction/megacorp.js [factionName]
 * Example: run quack/faction/megacorp.js MegaCorp
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);

    // Join the appropriate faction.
    const faction = ns.args[0];
    sanity_check(faction);

    // Since version 2.0, we need at least 400k company reputation to join the
    // corresponding company faction.  See
    //
    // https://github.com/danielyxie/bitburner/blob/dev/doc/source/changelog.rst
    //
    // However, the reputation requirement is reduced to 300k if we have
    // installed a backdoor on the corresponding company server.
    await install_backdoor_on_server(ns, faction);
    let company = faction;
    if (faction === "Fulcrum Secret Technologies") {
        company = "Fulcrum Technologies";
    }
    assert(company.length > 0);
    assert(faction.length > 0);
    await megacorporation(ns, company, faction, faction_t.CORP_REP);

    // The next script in the load chain.
    exec(ns, "/quack/chain/home.js");
}
