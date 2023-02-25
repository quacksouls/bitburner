/**
 * Copyright (C) 2023 Duck McSouls
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

import { crimes } from "/quack/lib/constant/crime.js";
import { colour } from "/quack/lib/constant/misc.js";
import { log } from "/quack/lib/io.js";
import { has_sleeve_api } from "/quack/lib/source.js";
import { all_sleeves } from "/quack/lib/sleeve/util.js";

/**
 * Assign sleeves to commit homicide as a means of earning some money in the
 * early stages of a BitNode.
 *
 * Usage: run quack/sleeve/homicide.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    if (!has_sleeve_api(ns)) {
        log(ns, "No access to Sleeve API", colour.RED);
        return;
    }
    log(ns, "Sleeves commit homicide to raise money");
    const homicide = (i) => ns.sleeve.setToCommitCrime(i, crimes.KILL);
    all_sleeves(ns).forEach(homicide);
}
