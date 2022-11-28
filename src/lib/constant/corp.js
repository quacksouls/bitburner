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
    },
};

/**
 * Various thresholds and constants related to our Agriculture division.
 */
export const agriculture = {
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
            },
        },
    },
    /**
     * The products that our Tobacco division makes.
     */
    product: {
        one: {
            NAME: "Cigarette",
            INVEST_DESIGN: 1e9,
            INVEST_MARKETING: 1e9,
        },
        two: {
            NAME: "Cigar",
            INVEST_DESIGN: 2e9, // Double the budget of previous product.
            INVEST_MARKETING: 2e9,
        },
        three: {
            /**
             * Roll-Your-Own or hand-rolled cigars or cigarettes.
             */
            NAME: "RYO",
            INVEST_DESIGN: 4e9, // Double the budget of previous product.
            INVEST_MARKETING: 4e9,
        },
        four: {
            /**
             * Blunt, a stubby version of cigar.
             */
            NAME: "Blunt",
            INVEST_DESIGN: 8e9, // Double the budget of previous product.
            INVEST_MARKETING: 8e9,
        },
    },
    /**
     * Various constants and thresholds related to research.
     */
    research: {
        /**
         * Multiply the cost of a research by this amount.
         */
        MULT: 2,
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
        },
    },
};
