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
import { assert } from "/lib/util.js";

/**
 * Whether we have Augmentations that are purchased and yet to be installed.
 *
 * @param ns The Netscript API.
 * @return true if we have Augmentations that are yet to be installed;
 *     false otherwise.
 */
function has_augmentations(ns) {
    const augment = purchased_augmentations(ns);
    return augment.length > 0;
}

/**
 * Install all purchased Augmentations.
 *
 * @param ns The Netscript API.
 */
function install(ns) {
    assert(has_augmentations(ns));
    const script = "go.js";
    ns.singularity.installAugmentations(script);
}

/**
 * An array of Augmentations we have purchased and installed.
 *
 * @param ns The Netscript API.
 */
function installed_augmentations(ns) {
    return ns.singularity.getOwnedAugmentations(bool.NOT_PURCHASED);
}

/**
 * An array of Augmentations we have purchased, but not yet installed.
 *
 * @param ns The Netscript API.
 */
function purchased_augmentations(ns) {
    const purchased_aug = ns.singularity.getOwnedAugmentations(bool.PURCHASED);
    const installed_aug = installed_augmentations(ns);
    return purchased_aug.filter(a => !installed_aug.includes(a));
}

/**
 * Install all purchased Augmentations and run our bootstrap script.
 *
 * Usage: run singularity/install.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    install(ns);
}
