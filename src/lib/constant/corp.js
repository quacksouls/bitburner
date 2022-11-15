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
     * Constants related to an employee.
     */
    employee: {
        /**
         * Various attributes of an employee.
         */
        attribute: [
            "charisma",
            "creativity",
            "efficiency",
            "energy",
            "experience",
            "happiness",
            "intelligence",
            "morale",
            "salary",
        ],
    },
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
     * The roles to assign to employees.  Data taken from this file:
     *
     * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Corporation/EmployeePositions.ts
     */
    job: {
        BUSINESS: "Business",
        ENGINEER: "Engineer",
        MANAGEMENT: "Management",
        OPERATIONS: "Operations",
        RND: "Research & Development",
        TRAIN: "Training",
        IDLE: "Unassigned",
    },
    /**
     * Various types of materials.  Data taken from this file:
     *
     * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Corporation/data/Constants.ts
     */
    material: {
        AI: "AI Cores",
        CHEMICAL: "Chemicals",
        DRUG: "Drugs",
        ENERGY: "Energy",
        FOOD: "Food",
        HARDWARE: "Hardware",
        LAND: "Real Estate",
        METAL: "Metal",
        PLANT: "Plants",
        ROBOT: "Robots",
        WATER: "Water",
    },
    /**
     * The positions to assign to employees.  Data taken from this file:
     *
     * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Corporation/EmployeePositions.ts
     */
    position: [
        "Operations",
        "Engineer",
        "Business",
        "Management",
        "Research & Development",
        "Training",
    ],
    /**
     * The name of our corporation.
     */
    NAME: "Quacken Industries",
    /**
     * Unlock upgrades.  These are one-time unlockable upgrades and apply to the
     * entire corporation.  We cannot level these upgrades.  Data are taken from
     * this file:
     *
     * https://github.com/danielyxie/bitburner/blob/dev/src/Corporation/data/CorporationUnlockUpgrades.ts
     */
    unlock: {
        /**
         * Shady tactics to reduce our corporation's tax.
         */
        ACCOUNT: "Shady Accounting",
        /**
         * Statistics about our corporation and its supply chain.
         */
        CHAIN: "VeChain",
        /**
         * Display the competition of each material or product.
         */
        COMPETITION: "Market Data - Competition",
        /**
         * Display the demand of each material or product.
         */
        DEMAND: "Market Research - Demand",
        /**
         * Allows us to export goods.
         */
        EXPORT: "Export",
        /**
         * The Office API.
         */
        OFFICE: "Office API",
        /**
         * Private/public partnership or PPP.  Partner with national governments
         * to help lower our taxes.
         */
        PPP: "Government Partnership",
        /**
         * Allows us to purchase the exact amount of supply for production.
         */
        SMART: "Smart Supply",
        /**
         * The Warehouse API.
         */
        WAREHOUSE: "Warehouse API",
    },
    /**
     * These are level upgrades, as distinct from the unlock upgrades.  All
     * level upgrades start off as level 0.  We must purchase more levels for a
     * particular upgrade to increase its effectiveness.  Data taken from this
     * file:
     *
     * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Corporation/data/Constants.ts
     */
    upgrade: {
        ANALYTIC: "Wilson Analytics",
        DREAM: "DreamSense",
        FACTORY: "Smart Factories",
        FOCUS: "FocusWires",
        INJECTOR: "Nuoptimal Nootropic Injector Implants",
        INSIGHT: "Project Insight",
        NEURAL: "Neural Accelerators",
        SALE: "ABC SalesBots",
        SPEECH: "Speech Processor Implants",
        STORAGE: "Smart Storage",
    },
};

/**
 * Thresholds on various aspects of a corporation.
 */
export const corp_t = {
    /**
     * Thresholds on various aspects of employees.
     */
    employee: {
        /**
         * The average energy percentage for an employee to be considered
         * vivacious.
         */
        ENERGY: 99.998,
        /**
         * The average happiness for an employee to be considered vivacious.
         */
        HAPPINESS: 99.998,
        /**
         * The average morale for an employee to be considered vivacious.
         */
        MORALE: 100,
    },
    /**
     * Various funds thresholds.  We use these thresholds to help us make
     * various decisions related to the direction of our corporation.
     */
    funds: {
        /**
         * A very low funds threshold: $500m.
         */
        VERY_LOW: 5e8,
    },
    /**
     * Various thresholds on materials.
     */
    material: {
        /**
         * AI Cores.
         */
        ai: {
            /**
             * Purchasing thresholds.
             */
            buy: {
                /**
                 * The amount for our initial purchase.
                 */
                INIT: 75,
            },
        },
        /**
         * Hardware.
         */
        hardware: {
            /**
             * Purchasing thresholds.
             */
            buy: {
                /**
                 * The amount for our initial purchase.
                 */
                INIT: 125,
            },
        },
        /**
         * Real Estate.
         */
        land: {
            /**
             * Purchasing thresholds.
             */
            buy: {
                /**
                 * The amount for our initial purchase.
                 */
                INIT: 27e3,
            },
        },
    },
    /**
     * Various thresholds related to an office.
     */
    office: {
        /**
         * The initial number of employees to hire for an office.
         */
        INIT_HIRE: 3,
    },
    /**
     * Various profit thresholds.  Each value is a rate per second.  We use
     * these thresholds to help us make various decisions related to the
     * direction of our corporation.
     */
    profit: {
        /**
         * A very low profit threshold: $200k per second.
         */
        VERY_LOW: 2e5,
    },
    /**
     * We need $150b to start a corporation.  Data taken from this file:
     *
     * https://github.com/danielyxie/bitburner/blob/dev/src/NetscriptFunctions/Corporation.ts
     */
    SEED_COST: 15e10,
    /**
     * Thresholds on various aspects of selling materials or products.
     */
    sell: {
        /**
         * The sell amount.
         */
        amount: {
            /**
             * Sell the maximum of whatever we have.
             */
            MAX: "MAX",
        },
        /**
         * The sell price.
         */
        price: {
            /**
             * Sell at the market price.
             */
            MP: "MP",
        },
    },
    /**
     * Each tick in a corporation is 10 seconds, expressed in terms of
     * milliseconds.
     */
    TICK: 1e4,
    /**
     * The same as TICK, but expressed in terms of seconds.
     */
    TICK_SECOND: 10,
    /**
     * Thresholds related to level upgrades.  These are distinct from unlock
     * upgrades.
     */
    upgrade: {
        /**
         * For our initial setup, we want at least 2 levels of various upgrades.
         */
        INIT_LEVEL: 2,
    },
    /**
     * Various thresholds related to a warehouse.
     */
    warehouse: {
        /**
         * The initial upgraded size of a warehouse.  When a warehouse is
         * bought, it has a size of 100.  We want to upgrade our early warehouse
         * to this size.
         */
        INIT_UPGRADE_SIZE: 300,
    },
};
