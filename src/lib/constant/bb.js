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
     * Various thresholds of chaos.
     */
    chaos: {
        HIGH: 1000,
        MID: 500,
        LOW: 200,
    },
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
     * Various levels of diplomacy, depending on the chaos in the current city.
     */
    diplomacy: {
        DIPLOM: "Diplomacy",
        FIELD: "Field Analysis",
        VIOLENCE: "Incite Violence",
        get HIGH() {
            return [
                this.DIPLOM,
                this.VIOLENCE,
                this.DIPLOM,
                this.FIELD,
                this.DIPLOM,
            ];
        },
        get MID() {
            return [this.DIPLOM, this.VIOLENCE, this.DIPLOM, this.FIELD];
        },
        get LOW() {
            return [this.VIOLENCE, this.DIPLOM, this.FIELD];
        },
        get NONE() {
            return [this.VIOLENCE, this.FIELD];
        },
    },
    /**
     * Miscellaneous general actions.
     */
    general: {
        DIPLOM: "Diplomacy",
        FIELD: "Field Analysis",
        VIOLENCE: "Incite Violence",
    },
    /**
     * The likely success chance of an action.
     */
    LIKELY: 0.95,
    /**
     * There should be at least this many contracts to help us decide whether to
     * take on a particular type of contracts.
     */
    MIN_CONTRACTS: 200,
    /**
     * There should be at least this many operations to help us decide whether
     * to undertake a particular type of operations.
     */
    MIN_OPERATIONS: 200,
    /**
     * The minimum population of a city.  Any lower than this and we should
     * switch to a different city.
     */
    MIN_POPULATION: 500e6,
    /**
     * The near certain success chance of an action.
     */
    MOST_LIKELY: 0.99,
    /**
     * Various types of operations.
     */
    operation: {
        IDLE: "Idle",
        INVESTIGATE: "Investigation",
        KILL: "Assassination",
        RAID: "Raid",
        STEALTH: "Stealth Retirement Operation",
        STING: "Sting Operation",
        UNDERCOVER: "Undercover Operation",
    },
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
