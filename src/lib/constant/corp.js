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
     * A file to store the latest investment round we have completed.  Only
     * store the integer that represents the latest investment round in which
     * we accepted investment.
     */
    INVEST: "invest.txt",
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
     * The round of investment.
     */
    round: ["one", "two", "three", "four"],
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
         * Different rounds have different thresholds for the amount of funds we
         * want.
         */
        round: {
            /**
             * A very low funds threshold: $1b.
             */
            one: {
                N: 1e9,
            },
            /**
             * A low funds threshold: $2b.
             */
            two: {
                N: 2e9,
            },
        },
    },
    /**
     * Hiring policies for various rounds of hiring.
     */
    hire: {
        /**
         * The policy for each stage of hiring.
         */
        stage: {
            /**
             * Stage 1 of hiring for an office.  We currently have employees in
             * these roles:
             *
             * (1) Operations x 1
             * (2) Engineer x 1
             * (3) Business x 1
             */
            one: {
                /**
                 * We want to hire an employee and assign them to this role.
                 */
                ROLE: "Management",
                /**
                 * The number of employees to hire for each office.
                 */
                WANT: 1,
                /**
                 * The current number of employees in each office who are
                 * assigned the above role.
                 */
                NOW: 0,
            },
            /**
             * Stage 2 of hiring for an office.  We currently have employees in
             * these roles:
             *
             * (1) Operations x 1
             * (2) Engineer x 1
             * (3) Business x 1
             * (4) Management x 1
             */
            two: {
                ROLE: "Operations",
                WANT: 1,
                NOW: 1,
            },
            /**
             * Stage 3 of hiring for an office.  We currently have employees in
             * these roles:
             *
             * (1) Operations x 2
             * (2) Engineer x 1
             * (3) Business x 1
             * (4) Management x 1
             */
            three: {
                ROLE: "Engineer",
                WANT: 1,
                NOW: 1,
            },
            /**
             * Stage 4 of hiring for an office.  We currently have employees in
             * these roles:
             *
             * (1) Operations x 2
             * (2) Engineer x 2
             * (3) Business x 1
             * (4) Management x 1
             */
            four: {
                ROLE: "Business",
                WANT: 1,
                NOW: 1,
            },
            /**
             * Stage 5 of hiring for an office.  We currently have employees in
             * these roles:
             *
             * (1) Operations x 2
             * (2) Engineer x 2
             * (3) Business x 2
             * (4) Management x 1
             */
            five: {
                ROLE: "Management",
                WANT: 1,
                NOW: 1,
            },
            /**
             * Stage 6 of hiring for an office.  We currently have employees in
             * these roles:
             *
             * (1) Operations x 2
             * (2) Engineer x 2
             * (3) Business x 2
             * (4) Management x 2
             */
            six: {
                ROLE: "Operations",
                WANT: 1,
                NOW: 2,
            },
        },
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
                /**
                 * Thresholds for various rounds.
                 */
                round: {
                    /**
                     * Threshold for round 1.
                     */
                    one: {
                        /**
                         * The amount to buy for this round.
                         */
                        N: 2445,
                    },
                    two: {
                        N: 3750,
                    },
                },
            },
        },
        chemical: {
            buy: {
                round: {
                    one: {
                        N: 0,
                    },
                    two: {
                        N: 0,
                    },
                },
            },
        },
        drug: {
            buy: {
                round: {
                    one: {
                        N: 0,
                    },
                    two: {
                        N: 0,
                    },
                },
            },
        },
        energy: {
            buy: {
                round: {
                    one: {
                        N: 0,
                    },
                    two: {
                        N: 0,
                    },
                },
            },
        },
        food: {
            buy: {
                round: {
                    one: {
                        N: 0,
                    },
                    two: {
                        N: 0,
                    },
                },
            },
        },
        hardware: {
            buy: {
                INIT: 125,
                round: {
                    one: {
                        N: 2675,
                    },
                    two: {
                        N: 6500,
                    },
                },
            },
        },
        land: {
            buy: {
                INIT: 27e3,
                round: {
                    one: {
                        N: 119400,
                    },
                    two: {
                        N: 84e3,
                    },
                },
            },
        },
        metal: {
            buy: {
                round: {
                    one: {
                        N: 0,
                    },
                    two: {
                        N: 0,
                    },
                },
            },
        },
        plant: {
            buy: {
                round: {
                    one: {
                        N: 0,
                    },
                    two: {
                        N: 0,
                    },
                },
            },
        },
        robot: {
            buy: {
                round: {
                    one: {
                        N: 96,
                    },
                    two: {
                        N: 630,
                    },
                },
            },
        },
        water: {
            buy: {
                round: {
                    one: {
                        N: 0,
                    },
                    two: {
                        N: 0,
                    },
                },
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
         * Different rounds have different rates of profits we aim to achieve.
         */
        round: {
            /**
             * A very low profit threshold: $200k per second.
             */
            one: {
                N: 2e5,
            },
            /**
             * A low profit threshold: $300k per second.
             */
            two: {
                N: 3e5,
            },
        },
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
        /**
         * Upgrade thresholds for subsequent rounds.
         */
        round: {
            /**
             * Round 1 of upgrade.  Level up various upgrades to this level.
             */
            one: {
                LEVEL: 10,
            },
        },
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
        /**
         * Upgrade thresholds for subsequent rounds.
         */
        round: {
            /**
             * Round 1 of storage upgrade.  Expand the capacity of each
             * warehouse to this number.
             */
            one: {
                SIZE: 2e3,
            },
            two: {
                SIZE: 3800,
            },
        },
    },
};
