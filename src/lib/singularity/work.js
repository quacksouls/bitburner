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

/// ///////////////////////////////////////////////////////////////////////
// Miscellaneous helper functions related to work.
/// ///////////////////////////////////////////////////////////////////////

import { bool } from "/quack/lib/constant/bool.js";
import { empty_string, work_hack_lvl } from "/quack/lib/constant/misc.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { job_area, job_title } from "/quack/lib/constant/work.js";
import { log } from "/quack/lib/io.js";
import { money } from "/quack/lib/money.js";
import { Player } from "/quack/lib/player.js";
import { study } from "/quack/lib/singularity/study.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * Choose a company at which to work.
 *
 * @param {NS} ns The Netscript API.
 * @returns {string} The name of a company.
 */
function choose_company(ns) {
    let company = empty_string;
    switch (ns.getPlayer().city) {
        case "Aevum":
            company = "ECorp";
            break;
        case "Chongqing":
            company = "KuaiGong International";
            break;
        case "Ishima":
            company = "Nova Medical";
            break;
        case "New Tokyo":
            company = "Global Pharmaceuticals";
            break;
        case "Sector-12":
            company = "MegaCorp";
            break;
        case "Volhaven":
            company = "NWO";
            break;
        default:
            // Should never reach here.
            assert(false);
    }
    assert(!is_empty_string(company));
    return company;
}

/**
 * Choose the field of work.  Either "Business" or "Software".
 *
 * @param {NS} ns The Netscript API.
 * @returns {string} Either "Business" or "Software".
 */
export function choose_field(ns) {
    const charisma_lvl = work_hack_lvl;
    if (ns.getPlayer().skills.charisma < charisma_lvl) {
        return job_area.SOFTWARE;
    }
    return job_area.BUSINESS;
}

/**
 * Work for a company to raise our Charisma to a given amount.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} hack_lvl The minimum amount of Hack we must have.
 * @param {number} threshold Continue working until our Charisma is at this
 *     level or higher.  Assume to be a positive integer.
 */
export async function raise_charisma(ns, hack_lvl, threshold) {
    // Sanity checks.
    const player = new Player(ns);
    if (player.charisma() >= threshold) {
        return;
    }
    assert(threshold > 0);

    // Ensure we have the minimum Hack stat.
    if (player.hacking_skill() < hack_lvl) {
        await study(ns, hack_lvl);
    }
    assert(player.hacking_skill() >= hack_lvl);

    // Work for a company as a software engineer until we have accumulated the
    // given amount of Charisma level.
    const company = choose_company(ns);
    ns.singularity.goToLocation(company); // Raise Intelligence XP.
    ns.singularity.applyToCompany(company, job_area.SOFTWARE);
    ns.singularity.workForCompany(company, bool.FOCUS);
    while (player.charisma() < threshold) {
        await ns.sleep(wait_t.DEFAULT);
        const success = ns.singularity.applyToCompany(
            company,
            job_area.SOFTWARE
        );

        // We have a promotion.  Work in the new job.
        if (success) {
            ns.singularity.workForCompany(company, bool.FOCUS);
        }
    }
    ns.singularity.stopAction();
    ns.singularity.quitJob(company);
}

/**
 * Work at a company and rise to the position of Chief Financial Officer.  We
 * do not quit the company after the function ends.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} company We want to work for this company.
 */
export async function rise_to_cfo(ns, company) {
    // Ensure we have the minimum Hack and Charisma stats.
    const player = new Player(ns);
    const charisma_lvl = work_hack_lvl;
    assert(player.hacking_skill() >= work_hack_lvl);
    assert(player.charisma() >= charisma_lvl);

    // Work for the company in a business position.  Once in a while, apply for
    // a promotion until we reach the position of Chief Financial Officer.
    ns.singularity.goToLocation(company); // Raise Intelligence XP.
    ns.singularity.applyToCompany(company, job_area.BUSINESS);
    ns.singularity.workForCompany(company, bool.FOCUS);
    const is_cfo = () => player.job(company) === job_title.CFO;
    const is_ceo = () => player.job(company) === job_title.CEO;
    const has_target_job = () => is_cfo() || is_ceo();
    for (;;) {
        if (has_target_job()) {
            break;
        }
        await ns.sleep(wait_t.DEFAULT);
        const success = ns.singularity.applyToCompany(
            company,
            job_area.BUSINESS
        );

        // We have a promotion.  Work in the new job.
        if (success) {
            ns.singularity.workForCompany(company, bool.FOCUS);
        }
    }
    ns.singularity.stopAction();
}

/**
 * Work to boost our income.  Stop working when we have accumulated a given
 * amount of money.
 *
 * @param {NS} ns The Netscript API.
 * @param {number} threshold Continue working as long as our money is less than
 *     this threshold.
 */
export async function work(ns, threshold) {
    assert(threshold > 0);
    if (money(ns) >= threshold) {
        return;
    }

    // Ensure we have the minimum Hack stat.
    if (ns.getHackingLevel() < work_hack_lvl) {
        await study(ns, work_hack_lvl);
    }
    assert(ns.getHackingLevel() >= work_hack_lvl);

    // Work for a company until our money is at least the given threshold.
    // Every once in a while, apply for a promotion to earn more money per
    // second.  By default, we work a business job.  However, if our Charisma
    // level is low, work a software job instead to raise our Charisma.
    const company = choose_company(ns);
    ns.singularity.goToLocation(company); // Increase Intelligence XP.
    let field = choose_field(ns);
    ns.singularity.applyToCompany(company, field);
    ns.singularity.workForCompany(company, bool.FOCUS);
    log(ns, `Work for ${company} in ${field}`);
    while (money(ns) < threshold) {
        await ns.sleep(wait_t.DEFAULT);
        field = choose_field(ns);
        const success = ns.singularity.applyToCompany(company, field);

        // We have a promotion.  Start working in the new job.
        if (success) {
            ns.singularity.workForCompany(company, bool.FOCUS);
            log(ns, `Work for ${company} in ${field}`);
        }
    }
    ns.singularity.stopAction();
    ns.singularity.quitJob(company);
}

/**
 * Work for a company.  Stop working when we have accumulated a given amount
 * of reputation points.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} company We want to work for this company.
 * @param {number} rep Work for the company until we have at least this amount
 *     of reputation points.
 */
export async function work_for_company(ns, company, rep) {
    assert(rep > 0);
    ns.singularity.goToLocation(company); // Raise Intelligence XP.

    // Ensure we have the minimum Hack stat.
    if (ns.getHackingLevel() < work_hack_lvl) {
        await study(ns, work_hack_lvl);
    }
    assert(ns.getHackingLevel() >= work_hack_lvl);

    // Work for the company until we have accumulated the given amount of
    // reputation points.  Occasionally apply for a promotion to earn even
    // more reputation points per second.
    let field = choose_field(ns);
    ns.singularity.applyToCompany(company, field);
    ns.singularity.workForCompany(company, bool.FOCUS);
    log(ns, `Work for ${company} in ${field}`);
    while (ns.singularity.getCompanyRep(company) < rep) {
        await ns.sleep(wait_t.DEFAULT);
        field = choose_field(ns);
        const success = ns.singularity.applyToCompany(company, field);

        // We have a promotion.  Work in the new job.
        if (success) {
            ns.singularity.workForCompany(company, bool.FOCUS);
            log(ns, `Work for ${company} in ${field}`);
        }
    }
    ns.singularity.stopAction();
    ns.singularity.quitJob(company);
}
