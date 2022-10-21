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

import { io } from "/lib/constant/io.js";
import { intelligence } from "/intelligence/util.js";

/**
 * Install a bunch of Augmentations.
 *
 * @param ns The Netscript API.
 */
async function install_augmentations(ns) {
    const before = intelligence(ns);
    const file = "/intelligence/value.txt";
    await ns.write(file, before, io.WRITE);
    const script = "/intelligence/augmentation-post-install.js";
    ns.singularity.installAugmentations(script);
}

/**
 * Determine the amount of Intelligence XP gained from installing
 * Augmentations.  This script shows the amount of Intelligence XP prior to
 * the installation.  We must call another script to determine the Intelligence
 * XP gain after the installation.
 *
 * Usage: run intelligence/augmentation-install.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    await install_augmentations(ns);
}
