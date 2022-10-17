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

// Various constant values related to corporation.

/**
 * Constants related to a corporation.
 */
export const corp = {
    /**
     * The name of the Corporation API.  We use this to circumvent the namespace
     * RAM cost.
     */
    API: "corporation",
    /**
     * All available industries into which we can expand.  Data taken from this
     * file:
     *
     * https://github.com/danielyxie/bitburner/blob/dev/src/Corporation/data/Constants.ts
     */
    industry: {
        AGRI: "Agriculture",
        CHEM: "Chemical",
        COMP: "Computers",
        ENERGY: "Energy",
        FISH: "Fishing",
        FOOD: "Food",
        HEALTH: "Healthcare",
        LAND: "RealEstate",
        MINE: "Mining",
        PHARMA: "Pharmaceutical",
        ROBO: "Robotics",
        SOFTWARE: "Software",
        TOBACCO: "Tobacco",
        UTIL: "Utilities",
    },
    /**
     * The name of our corporation.
     */
    NAME: "Quacken Industries",
};

/**
 * Thresholds on various aspects of a corporation.
 */
export const corp_t = {
    /**
     * We need $150b to start a corporation.  Data taken from this file:
     *
     * https://github.com/danielyxie/bitburner/blob/dev/src/NetscriptFunctions/Corporation.ts
     */
    SEED_COST: 15e10,
};
