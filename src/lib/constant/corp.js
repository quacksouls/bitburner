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
     * This file means that we should reload the script
     *
     * /corporation/agriculture.js
     *
     * after a soft reset.  In some cases, we do not want to start everything
     * all over again from the script
     *
     * /corporation/go.js
     */
    AGRI: "/corporation/agriculture.txt",
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
    INVEST: "/corporation/invest.txt",
    /**
     * This file means that we should reload the script
     *
     * /corporation/janitor.js
     *
     * after a soft reset.  In some cases, we do not want to start everything
     * all over again from the script
     *
     * /corporation/go.js
     */
    JANI: "/corporation/janitor.txt",
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
     * The name of our corporation.
     */
    NAME: "Quacken Industries",
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
     * This file means that we should reload the script
     *
     * /corporation/prep.js
     *
     * after a soft reset.  In some cases, we do not want to start everything
     * all over again from the script
     *
     * /corporation/go.js
     */
    PREP: "/corporation/prep.txt",
    /**
     * Various research that can be purchased.  Data taken from this file:
     *
     * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Corporation/data/ResearchMetadata.ts
     */
    research: {
        ASSEMBLER: "Self-Correcting Assemblers",
        ASSIST: "sudo.Assist",
        BREW: "AutoBrew",
        BUY: "Bulk Purchasing",
        CAPACITY_I: "uPgrade: Capacity.I",
        CAPACITY_II: "uPgrade: Capacity.II",
        DASHBOARD: "uPgrade: Dashboard",
        DRONE: "Drones",
        DRONE_ASSEMBLY: "Drones - Assembly",
        DRONE_TRANSPORT: "Drones - Transport",
        DRUG: "Automatic Drug Administration",
        FULCRUM: "uPgrade: Fulcrum",
        INJECT: "CPH4 Injections",
        JOY: "JoyWire",
        JUICE: "Go-Juice",
        OVERCLOCK: "Overclock",
        PARTY: "AutoPartyManager",
        RND_LAB: "Hi-Tech R&D Laboratory",
        RECRUIT: "HRBuddy-Recruitment",
        STIMULATE: "Sti.mu",
        TA_I: "Market-TA.I",
        TA_II: "Market-TA.II",
        TRAIN: "HRBuddy-Training",
    },
    /**
     * The round of investment.
     */
    round: ["one", "two", "three", "four"],
    /**
     * This file means that we should reload the script
     *
     * /corporation/tobacco.js
     *
     * after a soft reset.  In some cases, we do not want to start everything
     * all over again from the script
     *
     * /corporation/go.js
     */
    TOBA: "/corporation/tobacco.txt",
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
     * The fraction of profit to issue as dividends.
     */
    DIVIDEND: 0.1,
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
     * The fraction of our corporation's funds to be invested in a product.
     */
    INVEST_MULT: 0.01,
    /**
     * The number of shares to issue for our Initial Public Offering (IPO).
     */
    IPO: 0,
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
     * The maximum percentage progress.  For example, if the development of a
     * product has reached this progress threshold, then the product has
     * completed its development.
     */
    MAX_PROGRESS: 100,
    /**
     * Miscellaneous thresholds related to products.
     */
    product: {
        /**
         * Initially, we can develop at most this number of products.  To
         * develop another product, we must discontinue a product to make room
         * for a new product.
         */
        INIT_TAU: 3,
        /**
         * The maximum number of products that any division can manufacture.
         * Must have purchased "uPgrade: Capacity.I" and "uPgrade: Capacity.II".
         */
        MAX: 5,
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
            /**
             * A mid profit threshold: $1m per second.
             */
            three: {
                N: 1e6,
            },
            /**
             * A mid profit threshold: $2m per second.
             */
            four: {
                N: 2e6,
            },
        },
    },
    /**
     * Multiply the cost of a research by this amount.
     */
    RESEARCH_MULT: 2,
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
         * The cost to level up an upgrade should be no more than this fraction
         * of our profit.
         */
        COST_MULT: 0.5,
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
    },
};

/**
 * Various thresholds and constants related to our Agriculture division.
 */
export const agriculture = {
    /**
     * City offices of our Agriculture division.
     */
    Aevum: {
        hire: {
            stage: {
                /**
                 * The n-th stage of hiring.  This is the general stage, where
                 * our division is in maintenance mode.  Each number is an
                 * increment of the current number of employees in the
                 * particular role.  For example, we want 1 more employee in
                 * the Business role.
                 */
                n: {
                    BUSINESS: 1, // +1
                    ENGINEER: 1, // +1
                    MANAGEMENT: 1, // +1
                    OPERATIONS: 1, // +1
                    RND: 2, // +2
                    TRAIN: 0,
                    IDLE: 0,
                },
            },
        },
    },
    Chongqing: {
        hire: {
            stage: {
                n: {
                    BUSINESS: 1, // +1
                    ENGINEER: 1, // +1
                    MANAGEMENT: 1, // +1
                    OPERATIONS: 1, // +1
                    RND: 2, // +2
                    TRAIN: 0,
                    IDLE: 0,
                },
            },
        },
    },
    Ishima: {
        hire: {
            stage: {
                n: {
                    BUSINESS: 1, // +1
                    ENGINEER: 1, // +1
                    MANAGEMENT: 1, // +1
                    OPERATIONS: 1, // +1
                    RND: 2, // +2
                    TRAIN: 0,
                    IDLE: 0,
                },
            },
        },
    },
    "New Tokyo": {
        hire: {
            stage: {
                n: {
                    BUSINESS: 1, // +1
                    ENGINEER: 1, // +1
                    MANAGEMENT: 1, // +1
                    OPERATIONS: 1, // +1
                    RND: 2, // +2
                    TRAIN: 0,
                    IDLE: 0,
                },
            },
        },
    },
    "Sector-12": {
        hire: {
            stage: {
                n: {
                    BUSINESS: 1, // +1
                    ENGINEER: 1, // +1
                    MANAGEMENT: 1, // +1
                    OPERATIONS: 1, // +1
                    RND: 2, // +2
                    TRAIN: 0,
                    IDLE: 0,
                },
            },
        },
    },
    Volhaven: {
        hire: {
            stage: {
                n: {
                    BUSINESS: 1, // +1
                    ENGINEER: 1, // +1
                    MANAGEMENT: 1, // +1
                    OPERATIONS: 1, // +1
                    RND: 2, // +2
                    TRAIN: 0,
                    IDLE: 0,
                },
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
         * All materials sold by the Agriculture division.
         */
        sold: [corp.material.FOOD, corp.material.PLANT],
        /**
         * All materials bought by the Agriculture division.
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
                        /**
                         * The target amount to have after the purchase.
                         */
                        TARGET: 2520,
                    },
                    two: {
                        N: 3750,
                        TARGET: 6270,
                    },
                },
            },
        },
        chemical: {
            buy: {
                round: {
                    one: {
                        N: 0,
                        TARGET: 0,
                    },
                    two: {
                        N: 0,
                        TARGET: 0,
                    },
                },
            },
        },
        drug: {
            buy: {
                round: {
                    one: {
                        N: 0,
                        TARGET: 0,
                    },
                    two: {
                        N: 0,
                        TARGET: 0,
                    },
                },
            },
        },
        energy: {
            buy: {
                round: {
                    one: {
                        N: 0,
                        TARGET: 0,
                    },
                    two: {
                        N: 0,
                        TARGET: 0,
                    },
                },
            },
        },
        food: {
            buy: {
                round: {
                    one: {
                        N: 0,
                        TARGET: 0,
                    },
                    two: {
                        N: 0,
                        TARGET: 0,
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
                        TARGET: 2800,
                    },
                    two: {
                        N: 6500,
                        TARGET: 9300,
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
                        TARGET: 146400,
                    },
                    two: {
                        N: 84e3,
                        TARGET: 230400,
                    },
                },
            },
        },
        metal: {
            buy: {
                round: {
                    one: {
                        N: 0,
                        TARGET: 0,
                    },
                    two: {
                        N: 0,
                        TARGET: 0,
                    },
                },
            },
        },
        plant: {
            buy: {
                round: {
                    one: {
                        N: 0,
                        TARGET: 0,
                    },
                    two: {
                        N: 0,
                        TARGET: 0,
                    },
                },
            },
        },
        robot: {
            buy: {
                round: {
                    one: {
                        N: 96,
                        TARGET: 96,
                    },
                    two: {
                        N: 630,
                        TARGET: 726,
                    },
                },
            },
        },
        water: {
            buy: {
                round: {
                    one: {
                        N: 0,
                        TARGET: 0,
                    },
                    two: {
                        N: 0,
                        TARGET: 0,
                    },
                },
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

/**
 * Various thresholds and constants related to our Tobacco division.
 */
export const tobacco = {
    /**
     * Only one city can be the developer city.
     */
    DEVELOPER_CITY: "Aevum",
    /**
     * City offices of our Tobacco division.
     */
    Aevum: {
        hire: {
            stage: {
                /**
                 * Stage 1 of hiring.  The maximum number of employees in each
                 * role.
                 */
                one: {
                    BUSINESS: 5,
                    ENGINEER: 9,
                    MANAGEMENT: 8,
                    OPERATIONS: 8,
                    RND: 0,
                    TRAIN: 0,
                    IDLE: 0,
                },
                two: {
                    BUSINESS: 9, // +4
                    ENGINEER: 13, // +4
                    MANAGEMENT: 10, // +2
                    OPERATIONS: 12, // +4
                    RND: 0,
                    TRAIN: 0,
                    IDLE: 0,
                },
                three: {
                    BUSINESS: 13, // +4
                    ENGINEER: 18, // +5
                    MANAGEMENT: 12, // +2
                    OPERATIONS: 17, // +5
                    RND: 0,
                    TRAIN: 0,
                    IDLE: 0,
                },
                /**
                 * From stage 4 onward, we want the number of employees at Aevum
                 * to be at least 60 ahead of other cities, within the same
                 * division.
                 */
                four: {
                    BUSINESS: 17, // +4
                    ENGINEER: 25, // +7
                    MANAGEMENT: 19, // +7
                    OPERATIONS: 24, // +7
                    RND: 0,
                    TRAIN: 0,
                    IDLE: 0,
                },
                five: {
                    BUSINESS: 19, // +2
                    ENGINEER: 30, // +5
                    MANAGEMENT: 24, // +5
                    OPERATIONS: 29, // +5
                    RND: 0,
                    TRAIN: 0,
                    IDLE: 0,
                },
                six: {
                    BUSINESS: 21, // +2
                    ENGINEER: 35, // +5
                    MANAGEMENT: 29, // +5
                    OPERATIONS: 34, // +5
                    RND: 0,
                    TRAIN: 0,
                    IDLE: 0,
                },
                seven: {
                    BUSINESS: 23, // +2
                    ENGINEER: 40, // +5
                    MANAGEMENT: 34, // +5
                    OPERATIONS: 39, // +5
                    RND: 0,
                    TRAIN: 0,
                    IDLE: 0,
                },
                eight: {
                    BUSINESS: 25, // +2
                    ENGINEER: 45, // +5
                    MANAGEMENT: 39, // +5
                    OPERATIONS: 44, // +5
                    RND: 0,
                    TRAIN: 0,
                    IDLE: 0,
                },
                nine: {
                    BUSINESS: 27, // +2
                    ENGINEER: 50, // +5
                    MANAGEMENT: 44, // +5
                    OPERATIONS: 49, // +5
                    RND: 0,
                    TRAIN: 0,
                    IDLE: 0,
                },
                /**
                 * The n-th stage of hiring.  This is the general stage, where
                 * our corporation is in maintenance mode.  Each number is an
                 * increment of the current number of employees in the
                 * particular role.  For example, we want 2 more employees in
                 * the Business role.
                 */
                n: {
                    BUSINESS: 2, // +2
                    ENGINEER: 4, // +4
                    MANAGEMENT: 4, // +4
                    OPERATIONS: 4, // +4
                    RND: 0,
                    TRAIN: 0,
                    IDLE: 0,
                },
            },
        },
    },
    Chongqing: {
        hire: {
            stage: {
                one: {
                    BUSINESS: 1,
                    ENGINEER: 1,
                    MANAGEMENT: 1,
                    OPERATIONS: 1,
                    RND: 5,
                    TRAIN: 0,
                    IDLE: 0,
                },
                two: {
                    BUSINESS: 2, // +1
                    ENGINEER: 2, // +1
                    MANAGEMENT: 2, // +1
                    OPERATIONS: 2, // +1
                    RND: 9, // +4
                    TRAIN: 0,
                    IDLE: 0,
                },
                three: {
                    BUSINESS: 3, // +1
                    ENGINEER: 3, // +1
                    MANAGEMENT: 3, // +1
                    OPERATIONS: 3, // +1
                    RND: 13, // +4
                    TRAIN: 0,
                    IDLE: 0,
                },
                /**
                 * Do not hire any employees during stage 4, for this city as
                 * well as other cities.  From round 4 onward, we want the
                 * number of employees at cities other than the developer city
                 * to be at least 60 behind.
                 */
                four: {
                    BUSINESS: 3, // +0
                    ENGINEER: 3, // +0
                    MANAGEMENT: 3, // +0
                    OPERATIONS: 3, // +0
                    RND: 13, // +0
                    TRAIN: 0,
                    IDLE: 0,
                },
                five: {
                    BUSINESS: 4, // +1
                    ENGINEER: 4, // +1
                    MANAGEMENT: 4, // +1
                    OPERATIONS: 4, // +1
                    RND: 18, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                six: {
                    BUSINESS: 5, // +1
                    ENGINEER: 5, // +1
                    MANAGEMENT: 5, // +1
                    OPERATIONS: 5, // +1
                    RND: 23, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                seven: {
                    BUSINESS: 6, // +1
                    ENGINEER: 6, // +1
                    MANAGEMENT: 6, // +1
                    OPERATIONS: 6, // +1
                    RND: 28, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                eight: {
                    BUSINESS: 7, // +1
                    ENGINEER: 7, // +1
                    MANAGEMENT: 7, // +1
                    OPERATIONS: 7, // +1
                    RND: 33, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                nine: {
                    BUSINESS: 8, // +1
                    ENGINEER: 8, // +1
                    MANAGEMENT: 8, // +1
                    OPERATIONS: 8, // +1
                    RND: 38, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                /**
                 * The n-th stage of hiring.  This is the general stage, where
                 * our corporation is in maintenance mode.  Each number is an
                 * increment of the current number of employees in the
                 * particular role.  For example, we want 1 more employee in
                 * the Business role.
                 */
                n: {
                    BUSINESS: 1, // +1
                    ENGINEER: 1, // +1
                    MANAGEMENT: 1, // +1
                    OPERATIONS: 1, // +1
                    RND: 5, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
            },
        },
    },
    Ishima: {
        hire: {
            stage: {
                one: {
                    BUSINESS: 1,
                    ENGINEER: 1,
                    MANAGEMENT: 1,
                    OPERATIONS: 1,
                    RND: 5,
                    TRAIN: 0,
                    IDLE: 0,
                },
                two: {
                    BUSINESS: 2, // +1
                    ENGINEER: 2, // +1
                    MANAGEMENT: 2, // +1
                    OPERATIONS: 2, // +1
                    RND: 9, // +4
                    TRAIN: 0,
                    IDLE: 0,
                },
                three: {
                    BUSINESS: 3, // +1
                    ENGINEER: 3, // +1
                    MANAGEMENT: 3, // +1
                    OPERATIONS: 3, // +1
                    RND: 13, // +4
                    TRAIN: 0,
                    IDLE: 0,
                },
                four: {
                    BUSINESS: 3, // +0
                    ENGINEER: 3, // +0
                    MANAGEMENT: 3, // +0
                    OPERATIONS: 3, // +0
                    RND: 13, // +0
                    TRAIN: 0,
                    IDLE: 0,
                },
                five: {
                    BUSINESS: 4, // +1
                    ENGINEER: 4, // +1
                    MANAGEMENT: 4, // +1
                    OPERATIONS: 4, // +1
                    RND: 18, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                six: {
                    BUSINESS: 5, // +1
                    ENGINEER: 5, // +1
                    MANAGEMENT: 5, // +1
                    OPERATIONS: 5, // +1
                    RND: 23, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                seven: {
                    BUSINESS: 6, // +1
                    ENGINEER: 6, // +1
                    MANAGEMENT: 6, // +1
                    OPERATIONS: 6, // +1
                    RND: 28, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                eight: {
                    BUSINESS: 7, // +1
                    ENGINEER: 7, // +1
                    MANAGEMENT: 7, // +1
                    OPERATIONS: 7, // +1
                    RND: 33, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                nine: {
                    BUSINESS: 8, // +1
                    ENGINEER: 8, // +1
                    MANAGEMENT: 8, // +1
                    OPERATIONS: 8, // +1
                    RND: 38, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                /**
                 * The n-th stage of hiring.  This is the general stage, where
                 * our corporation is in maintenance mode.  Each number is an
                 * increment of the current number of employees in the
                 * particular role.  For example, we want 1 more employee in
                 * the Business role.
                 */
                n: {
                    BUSINESS: 1, // +1
                    ENGINEER: 1, // +1
                    MANAGEMENT: 1, // +1
                    OPERATIONS: 1, // +1
                    RND: 5, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
            },
        },
    },
    "New Tokyo": {
        hire: {
            stage: {
                one: {
                    BUSINESS: 1,
                    ENGINEER: 1,
                    MANAGEMENT: 1,
                    OPERATIONS: 1,
                    RND: 5,
                    TRAIN: 0,
                    IDLE: 0,
                },
                two: {
                    BUSINESS: 2, // +1
                    ENGINEER: 2, // +1
                    MANAGEMENT: 2, // +1
                    OPERATIONS: 2, // +1
                    RND: 9, // +4
                    TRAIN: 0,
                    IDLE: 0,
                },
                three: {
                    BUSINESS: 3, // +1
                    ENGINEER: 3, // +1
                    MANAGEMENT: 3, // +1
                    OPERATIONS: 3, // +1
                    RND: 13, // +4
                    TRAIN: 0,
                    IDLE: 0,
                },
                four: {
                    BUSINESS: 3, // +0
                    ENGINEER: 3, // +0
                    MANAGEMENT: 3, // +0
                    OPERATIONS: 3, // +0
                    RND: 13, // +0
                    TRAIN: 0,
                    IDLE: 0,
                },
                five: {
                    BUSINESS: 4, // +1
                    ENGINEER: 4, // +1
                    MANAGEMENT: 4, // +1
                    OPERATIONS: 4, // +1
                    RND: 18, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                six: {
                    BUSINESS: 5, // +1
                    ENGINEER: 5, // +1
                    MANAGEMENT: 5, // +1
                    OPERATIONS: 5, // +1
                    RND: 23, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                seven: {
                    BUSINESS: 6, // +1
                    ENGINEER: 6, // +1
                    MANAGEMENT: 6, // +1
                    OPERATIONS: 6, // +1
                    RND: 28, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                eight: {
                    BUSINESS: 7, // +1
                    ENGINEER: 7, // +1
                    MANAGEMENT: 7, // +1
                    OPERATIONS: 7, // +1
                    RND: 33, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                nine: {
                    BUSINESS: 8, // +1
                    ENGINEER: 8, // +1
                    MANAGEMENT: 8, // +1
                    OPERATIONS: 8, // +1
                    RND: 38, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                /**
                 * The n-th stage of hiring.  This is the general stage, where
                 * our corporation is in maintenance mode.  Each number is an
                 * increment of the current number of employees in the
                 * particular role.  For example, we want 1 more employee in
                 * the Business role.
                 */
                n: {
                    BUSINESS: 1, // +1
                    ENGINEER: 1, // +1
                    MANAGEMENT: 1, // +1
                    OPERATIONS: 1, // +1
                    RND: 5, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
            },
        },
    },
    "Sector-12": {
        hire: {
            stage: {
                one: {
                    BUSINESS: 1,
                    ENGINEER: 1,
                    MANAGEMENT: 1,
                    OPERATIONS: 1,
                    RND: 5,
                    TRAIN: 0,
                    IDLE: 0,
                },
                two: {
                    BUSINESS: 2, // +1
                    ENGINEER: 2, // +1
                    MANAGEMENT: 2, // +1
                    OPERATIONS: 2, // +1
                    RND: 9, // +4
                    TRAIN: 0,
                    IDLE: 0,
                },
                three: {
                    BUSINESS: 3, // +1
                    ENGINEER: 3, // +1
                    MANAGEMENT: 3, // +1
                    OPERATIONS: 3, // +1
                    RND: 13, // +4
                    TRAIN: 0,
                    IDLE: 0,
                },
                four: {
                    BUSINESS: 3, // +0
                    ENGINEER: 3, // +0
                    MANAGEMENT: 3, // +0
                    OPERATIONS: 3, // +0
                    RND: 13, // +0
                    TRAIN: 0,
                    IDLE: 0,
                },
                five: {
                    BUSINESS: 4, // +1
                    ENGINEER: 4, // +1
                    MANAGEMENT: 4, // +1
                    OPERATIONS: 4, // +1
                    RND: 18, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                six: {
                    BUSINESS: 5, // +1
                    ENGINEER: 5, // +1
                    MANAGEMENT: 5, // +1
                    OPERATIONS: 5, // +1
                    RND: 23, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                seven: {
                    BUSINESS: 6, // +1
                    ENGINEER: 6, // +1
                    MANAGEMENT: 6, // +1
                    OPERATIONS: 6, // +1
                    RND: 28, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                eight: {
                    BUSINESS: 7, // +1
                    ENGINEER: 7, // +1
                    MANAGEMENT: 7, // +1
                    OPERATIONS: 7, // +1
                    RND: 33, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                nine: {
                    BUSINESS: 8, // +1
                    ENGINEER: 8, // +1
                    MANAGEMENT: 8, // +1
                    OPERATIONS: 8, // +1
                    RND: 38, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                /**
                 * The n-th stage of hiring.  This is the general stage, where
                 * our corporation is in maintenance mode.  Each number is an
                 * increment of the current number of employees in the
                 * particular role.  For example, we want 1 more employee in
                 * the Business role.
                 */
                n: {
                    BUSINESS: 1, // +1
                    ENGINEER: 1, // +1
                    MANAGEMENT: 1, // +1
                    OPERATIONS: 1, // +1
                    RND: 5, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
            },
        },
    },
    Volhaven: {
        hire: {
            stage: {
                one: {
                    BUSINESS: 1,
                    ENGINEER: 1,
                    MANAGEMENT: 1,
                    OPERATIONS: 1,
                    RND: 5,
                    TRAIN: 0,
                    IDLE: 0,
                },
                two: {
                    BUSINESS: 2, // +1
                    ENGINEER: 2, // +1
                    MANAGEMENT: 2, // +1
                    OPERATIONS: 2, // +1
                    RND: 9, // +4
                    TRAIN: 0,
                    IDLE: 0,
                },
                three: {
                    BUSINESS: 3, // +1
                    ENGINEER: 3, // +1
                    MANAGEMENT: 3, // +1
                    OPERATIONS: 3, // +1
                    RND: 13, // +4
                    TRAIN: 0,
                    IDLE: 0,
                },
                four: {
                    BUSINESS: 3, // +0
                    ENGINEER: 3, // +0
                    MANAGEMENT: 3, // +0
                    OPERATIONS: 3, // +0
                    RND: 13, // +0
                    TRAIN: 0,
                    IDLE: 0,
                },
                five: {
                    BUSINESS: 4, // +1
                    ENGINEER: 4, // +1
                    MANAGEMENT: 4, // +1
                    OPERATIONS: 4, // +1
                    RND: 18, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                six: {
                    BUSINESS: 5, // +1
                    ENGINEER: 5, // +1
                    MANAGEMENT: 5, // +1
                    OPERATIONS: 5, // +1
                    RND: 23, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                seven: {
                    BUSINESS: 6, // +1
                    ENGINEER: 6, // +1
                    MANAGEMENT: 6, // +1
                    OPERATIONS: 6, // +1
                    RND: 28, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                eight: {
                    BUSINESS: 7, // +1
                    ENGINEER: 7, // +1
                    MANAGEMENT: 7, // +1
                    OPERATIONS: 7, // +1
                    RND: 33, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                nine: {
                    BUSINESS: 8, // +1
                    ENGINEER: 8, // +1
                    MANAGEMENT: 8, // +1
                    OPERATIONS: 8, // +1
                    RND: 38, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
                /**
                 * The n-th stage of hiring.  This is the general stage, where
                 * our corporation is in maintenance mode.  Each number is an
                 * increment of the current number of employees in the
                 * particular role.  For example, we want 1 more employee in
                 * the Business role.
                 */
                n: {
                    BUSINESS: 1, // +1
                    ENGINEER: 1, // +1
                    MANAGEMENT: 1, // +1
                    OPERATIONS: 1, // +1
                    RND: 5, // +5
                    TRAIN: 0,
                    IDLE: 0,
                },
            },
        },
    },
    /**
     * The products that our Tobacco division makes.
     */
    product: [
        "Beedi",
        "Blunt",
        "Cigar",
        "Cigarette",
        "Cigarillo",
        "Dokha",
        "Gutka",
        "Hookah",
        "Iqmik",
        "Kiseru",
        "Kizami",
        "Kretek",
        "Mava",
        "Muʽassel",
        "Naswar",
        "Pipe",
        "Pouch",
        "RYO",
        "Snuff",
        "Snus",
    ],
    /**
     * Various constants and thresholds related to research.
     */
    research: {
        round: {
            /**
             * In round 1 of research purchase, we want to buy
             * "Hi-Tech R&D Laboratory", which costs 5e3 in research points.
             * Wait until we have double that amount of research points.
             */
            one: {
                TAU: 10e3,
            },
            /**
             * In round 2 of research purchase, we want to buy "Market-TA.I"
             * (costs 20e3 research points) and "Market-TA.II"
             * (costs 50e3 research points) for a total of 70e3 research points.
             * Wait until we have double that amount of research points.
             */
            two: {
                TAU: 140e3,
            },
        },
    },
    /**
     * Various desired levels for each upgrade.
     */
    upgrade: {
        round: {
            /**
             * The maximum level of each upgrade.
             */
            one: {
                DreamSense: 20,
                FocusWires: 20,
                "Neural Accelerators": 20,
                "Speech Processor Implants": 20,
                "Nuoptimal Nootropic Injector Implants": 20,
                "Project Insight": 10,
                "Wilson Analytics": 0,
            },
            two: {
                DreamSense: 25, // +5
                FocusWires: 25, // +5
                "Neural Accelerators": 25, // +5
                "Speech Processor Implants": 25, // +5
                "Nuoptimal Nootropic Injector Implants": 25, // +5
                "Project Insight": 15, // +5
                "Wilson Analytics": 0, // +0
            },
            three: {
                DreamSense: 30, // +5
                FocusWires: 30, // +5
                "Neural Accelerators": 30, // +5
                "Speech Processor Implants": 30, // +5
                "Nuoptimal Nootropic Injector Implants": 30, // +5
                "Project Insight": 20, // +5
                "Wilson Analytics": 10, // +10
            },
            four: {
                DreamSense: 31, // +1
                FocusWires: 31, // +1
                "Neural Accelerators": 31, // +1
                "Speech Processor Implants": 31, // +1
                "Nuoptimal Nootropic Injector Implants": 31, // +1
                "Project Insight": 21, // +1
                "Wilson Analytics": 11, // +1
            },
            five: {
                DreamSense: 32, // +1
                FocusWires: 32, // +1
                "Neural Accelerators": 32, // +1
                "Speech Processor Implants": 32, // +1
                "Nuoptimal Nootropic Injector Implants": 32, // +1
                "Project Insight": 22, // +1
                "Wilson Analytics": 11, // +0
            },
            six: {
                DreamSense: 33, // +1
                FocusWires: 33, // +1
                "Neural Accelerators": 33, // +1
                "Speech Processor Implants": 33, // +1
                "Nuoptimal Nootropic Injector Implants": 33, // +1
                "Project Insight": 23, // +1
                "Wilson Analytics": 11, // +0
            },
            seven: {
                DreamSense: 34, // +1
                FocusWires: 34, // +1
                "Neural Accelerators": 34, // +1
                "Speech Processor Implants": 34, // +1
                "Nuoptimal Nootropic Injector Implants": 34, // +1
                "Project Insight": 24, // +1
                "Wilson Analytics": 11, // +0
            },
            eight: {
                DreamSense: 35, // +1
                FocusWires: 35, // +1
                "Neural Accelerators": 35, // +1
                "Speech Processor Implants": 35, // +1
                "Nuoptimal Nootropic Injector Implants": 35, // +1
                "Project Insight": 25, // +1
                "Wilson Analytics": 11, // +0
            },
            nine: {
                DreamSense: 36, // +1
                FocusWires: 36, // +1
                "Neural Accelerators": 36, // +1
                "Speech Processor Implants": 36, // +1
                "Nuoptimal Nootropic Injector Implants": 36, // +1
                "Project Insight": 26, // +1
                "Wilson Analytics": 12, // +1
            },
        },
    },
};
