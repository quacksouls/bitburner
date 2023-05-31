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
     * The number of contracts remaining, at which point we should stop
     * performing a particular type of contracts.
     */
    CONTRACT_THRESHOLD: 5,
    /**
     * The likely success chance of an action.
     */
    LIKELY: 0.95,
    /**
     * There should be at least this many contracts to help us decide whether to
     * take on a particular type of contracts.
     */
    MIN_CONTRACTS: 50,
    /**
     * Various skills.
     */
    skill: {
        BLADE: "Blade's Intuition",
        CIRCUIT: "Short-Circuit",
        CLOAK: "Cloak",
        CLOCK: "Overclock",
        DATA: "Datamancer",
        DRIVE: "Hyperdrive",
        EDGE: "Cyber's Edge",
        EVADE: "Evasive System",
        MIDAS: "Hands of Midas",
        OBSERVER: "Digital Observer",
        REAPER: "Reaper",
        TRACER: "Tracer",
        /**
         * Thresholds for levels of various skills.
         */
        tau: {
            Overclock: 90,
        },
    },
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
    /**
     * An update interval in milliseconds.  This is our custom update interval,
     * not Bladeburner's update interval.
     */
    TICK: 10e3,
};
