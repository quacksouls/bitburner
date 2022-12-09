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
export const hnet_t = {
    /**
     * The maximum Level of a Hacknet node.  This number is taken from the file
     *
     * https://github.com/danielyxie/bitburner/blob/dev/src/Hacknet/data/Constants.ts
     */
    MAX_LEVEL: 200,
    /**
     * The money thresholds.  Use these to help us gauge how many Hacknet nodes
     * we should purchase.  The values 1e6 and 1e9 mean million and billion,
     * respectively.
     */
    MONEY: [10e6, 100e6, 1e9, 100e9],
    /**
     * The node thresholds.  At certain money thresholds, we should have the
     * corresponding number of nodes.
     */
    NODE: [6, 12, 24, 30],
    /**
     * The initial number of Hacknet nodes to buy.  Start our Hacknet farm
     * with this many seed nodes.
     */
    SEED_NODE: 3,
    /**
     * The server thresholds.  We can have at most 20 Hacknet servers.  At
     * certain money thresholds, we should have the corresponding number of
     * servers.
     */
    SERVER: [5, 10, 15, 20],
    /**
     * Thresholds related to Hacknet servers.
     */
    server: {
        /**
         * The maximum amount of cache a Hacknet server can have.  Data taken
         * from this file:
         *
         * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Hacknet/data/Constants.ts
         */
        MAX_CACHE: 15,
        /**
         * The maximum number of Cores a Hacknet server can have.  Data taken
         * from this file:
         *
         * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Hacknet/data/Constants.ts
         */
        MAX_CORE: 128,
        /**
         * The maximum Level of a Hacknet server.  Data taken from this file:
         *
         * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Hacknet/data/Constants.ts
         */
        MAX_LEVEL: 300,
        /**
         * The maximum amount of RAM of a Hacknet server.  Data taken from this
         * file:
         *
         * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Hacknet/data/Constants.ts
         */
        MAX_RAM: 8192,
    },
};
