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

import { bool } from "/quack/lib/constant/bool.js";
import { crimes } from "/quack/lib/constant/crime.js";
import { error } from "/quack/lib/io.js";
import { has_ai_api, has_singularity_api } from "/quack/lib/source.js";

/**
 * Commit larceny as a means of farming Intelligence XP.
 *
 * Usage: run quack/intelligence/larceny.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    if (!has_ai_api(ns)) {
        error(ns, "No access to Artificial Intelligence API");
        return;
    }
    if (!has_singularity_api(ns)) {
        error(ns, "No access to Singularity API");
        return;
    }

    ns.singularity.commitCrime(crimes.LARCENY, bool.NO_FOCUS);
}
