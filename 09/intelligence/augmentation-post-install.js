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

import { intelligence, intelligence_gain } from "/intelligence/util.js";
import { home } from "/lib/constant/misc.js";

/**
 * Determine the amount of Intelligence XP gained from installing
 * Augmentations.
 *
 * Usage: run intelligence/augmentation-post-install.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const file = "/intelligence/value.txt";
    const before = parseFloat(ns.read(file));
    const after = intelligence(ns);
    const action = "Install Augmentations";
    intelligence_gain(ns, before, after, action);
    ns.rm(file, home);
}
