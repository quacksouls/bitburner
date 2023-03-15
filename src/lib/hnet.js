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

/// ///////////////////////////////////////////////////////////////////////
// Miscellaneous helper functions for Hacknet
/// ///////////////////////////////////////////////////////////////////////

import { hnet_t } from "/quack/lib/constant/hacknet.js";
import { io } from "/quack/lib/constant/io.js";

/**
 * Spend all hashes we have.
 *
 * @param {NS} ns The Netscript API.
 */
export function hacknet_liquidate(ns) {
    const fname = hnet_t.LIQUIDATE;
    const data = "Spend all hashes.";
    ns.write(fname, data, io.WRITE);
}
