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

// Miscellaneous helper functions related to work.

import { home, work_hack_lvl } from "/lib/constant.js";
import { Time } from "/lib/time.js";

/**
 * Work to boost our income.  Stop working when we have accumulated a given
 * amount of money.
 *
 * @param ns The Netscript API.
 * @param threshold Continue working as long as our money is less than this
 *     threshold.
 */
export async function work(ns, threshold) {
    let money = ns.getServerMoneyAvailable(home);
    if (money >= threshold) {
        return;
    }
    const charisma_lvl = work_hack_lvl;
    assert(ns.getHackingLevel() >= work_hack_lvl);
    // Work for a company until our money is at least the given threshold.
    // Every once in a while, apply for a promotion to earn more money per
    // second.  By default, we work a business job.  However, if our Charisma
    // level is low, work a software job instead to raise our Charisma.
    const company = "MegaCorp";
    let field = "Business";
    const stat = ns.getPlayer();
    if (stat.charisma < charisma_lvl) {
        field = "Software";
    }
    const focus = true;
    ns.singularity.applyToCompany(company, field);
    const t = new Time();
    const time = t.minute();
    while (money < threshold) {
        ns.singularity.workForCompany(company, focus);
        await ns.sleep(time);
        ns.singularity.applyToCompany(company, field);
        money = ns.getServerMoneyAvailable(home);
    }
    ns.singularity.stopAction();
    ns.singularity.quitJob(company);
}
