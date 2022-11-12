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
     * The initial number of employees to hire for an office.
     */
    INIT_HIRE: 3,
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
