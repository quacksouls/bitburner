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

// Helper functions relating to Source-Files.

/**
 * Whether we have Source-File 5: Artificial Intelligence.
 *
 * @param ns The Netscript API.
 * @return true if we have Source-File 5; false otherwise.
 */
export function has_ai_sf(ns) {
    try {
        ns.getBitNodeMultipliers();
        return bool.HAS;
    } catch {
        return bool.NOT;
    }
}
