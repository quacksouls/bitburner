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
// Various constant values related to Bladeburner.
/// ///////////////////////////////////////////////////////////////////////

export const bb_t = {
    /**
     * Various contracts that we or a sleeve can perform.  Complete contracts
     * to increase our Bladeburner rank and earn money.  Failure results in
     * loss of HP.
     */
    contract: {
        BOUNTY: "Bounty Hunter",
        RETIRE: "Retirement",
        TRACK: "Tracking",
    },
    /**
     * The likely success chance of an action.
     */
    LIKELY: 0.9,
    /**
     * Indices of sleeves that are assigned to specific tasks.
     */
    sleeve: {
        /**
         * This sleeve is always assigned to Diplomacy.
         */
        DIPLOM: 2,
        /**
         * This sleeve is always assigned to take on contracts.
         */
        CONTRACT: 3,
    },
    /**
     * Required minimum stat levels.  We need these stats in order to join the
     * Bladeburner division of the CIA.
     */
    stat: {
        combat: {
            MIN: 100,
        },
    },
    /**
     * Generic actions that help us in our Bladeburner duties.
     */
    task: {
        CONTRACT: "Take on contracts",
        DIPLOM: "Diplomacy",
        FIELD: "Field analysis",
        INFILT: "Infiltrate synthoids",
        RECRUIT: "Recruitment",
        REGEN: "Hyperbolic Regeneration Chamber",
        SUPPORT: "Support main sleeve",
    },
};
