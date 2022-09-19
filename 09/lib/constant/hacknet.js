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

// A bunch of constant values related to Hacknet nodes and servers.

/**
 * Various thresholds on our Hacknet farm.
 */
export const hnet_tau = {
    // The maximum Level of a Hacknet node.  This number is taken from the file
    //
    // https://github.com/danielyxie/bitburner/blob/dev/src/Hacknet/data/Constants.ts
    "MAX_LEVEL": 200,
    // The money thresholds.  Use these to help us gauge how many Hacknet nodes
    // we should purchase.  The values 1e6 and 1e9 mean million and billion,
    // respectively.
    "MONEY": [
        10 * 1e6,
        100 * 1e6,
        1e9,
        100 * 1e9
    ],
    // The node thresholds.  At certain money thresholds, we should have the
    // corresponding number of nodes.
    "NODE": [
        6,
        12,
        24,
        30
    ],
    // The initial number of Hacknet nodes to buy.  Start our Hacknet farm
    // with this many seed nodes.
    "SEED_NODE": 3
};
