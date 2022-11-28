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

import { bitnode } from "/lib/constant/bn.js";
import { bool } from "/lib/constant/bool.js";
import { corp, corp_t } from "/lib/constant/corp.js";
import { cities } from "/lib/constant/location.js";
import { wait_t } from "/lib/constant/time.js";
import { Player } from "/lib/player.js";
import { assert, is_valid_city } from "/lib/util.js";

/**
 * A class to manage a corporation.  We typically use the Corporation API by
 * calling its functions along the format
 *
 * ns["corporation"].functionName()
 *
 * as a means of circumventing the high RAM cost.
 */
export class Corporation {
    /**
     * The namespace for the Netscript API.
     */
    #ns;

    /**
     * Initialize a Corporation object.
     *
     * @param ns The namespace for the Netscript API.
     */
    constructor(ns) {
        this.#ns = ns;
    }

    /**
     * All divisions of our corporation.
     *
     * @return An array containing the names of all divisions of our
     *     corporation.
     */
    all_divisions() {
        return this.#ns[corp.API].getCorporation().divisions.map((d) => d.name);
    }

    /**
     * All products manufactured by a particular division.
     *
     * @param div A string representing the name of a division.
     * @return An array of product names, each product being made by the given
     *     division.
     */
    all_products(div) {
        assert(this.has_division(div));
        return this.#ns[corp.API].getDivision(div).products;
    }

    /**
     * The average stats for all employees in an office.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return An object as follows:
     *     {
     *         charisma: // The average charisma.
     *         creativity: // The average creativity.
     *         efficiency: // The average efficiency.
     *         energy: // The average energy.
     *         experience: // The average experience.
     *         happiness: // The average happiness.
     *         intelligence: // The average intelligence.
     *         morale: // The average morale.
     *         salary: // The average salary.
     *     }
     */
    avg_employee_stats(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        const employee = this.#ns[corp.API].getOffice(div, ct).employees;
        assert(employee.length > 0);
        // Default is average of 0 in each attribute.
        const { attribute } = corp.employee;
        const avg_stat = {};
        attribute.forEach((a) => {
            avg_stat[a] = 0;
        });
        // A function to abbreviate the name of an attribute.  We get the first
        // 3 characters of the string.  The reason is that the function
        // getOffice() of the Office API returns an object where the keys are
        // each the first 3 characters of the above attribute names.
        const start = 0;
        const end = 3;
        const abbreviate = (x) => x.slice(start, end);
        // The average of each attribute for all employees in an office.  Use
        // the following formula to calculate the average:
        //
        // a_{i+1} = (x_{i+1} + (i * a_i)) / (i + 1)
        //
        // a_{i+1} := The current average value.
        // a_i := The previous average value.
        // x_{i+1} := The current data point.
        // i := Index of the current data point; zero-based.
        for (let i = 0; i < employee.length; i++) {
            const stat = this.#ns[corp.API].getEmployee(div, ct, employee[i]);
            attribute.forEach((a) => {
                const b = abbreviate(a);
                avg_stat[a] = (stat[b] + i * avg_stat[a]) / (i + 1);
            });
        }
        return avg_stat;
    }

    /**
     * Purchase a research for a division.  The cost is in research points, not
     * the corporation's funds.
     *
     * @param div A string representing the name of a division.
     * @param name A string representing the name of a research to buy.
     * @return True if the purchase was successful or we already have the
     *     research; false otherwise.
     */
    buy_research(div, name) {
        if (this.has_research(div, name)) {
            return bool.HAS;
        }
        if (this.division_research(div) < this.research_cost(div, name)) {
            return bool.FAILURE;
        }
        this.#ns[corp.API].research(div, name);
        return this.has_research(div, name);
    }

    /**
     * Purchase an unlock upgrade.  This type of upgrade is a one-time
     * unlockable.  It applies to the entire corporation and cannot be levelled.
     *
     * @param upg A string representing the name of an unlock upgrade.
     * @return True if we successfully purchased the given unlock upgrade or
     *     already have it; false otherwise.
     */
    buy_unlock_upgrade(upg) {
        assert(this.is_valid_unlock_upgrade(upg));
        if (this.has_unlock_upgrade(upg)) {
            return bool.SUCCESS;
        }
        const cost = this.#ns[corp.API].getUnlockUpgradeCost(upg);
        if (this.funds() < cost) {
            return bool.FAILURE;
        }
        this.#ns[corp.API].unlockUpgrade(upg);
        return this.has_unlock_upgrade(upg);
    }

    /**
     * Purchase a warehouse for a division in a particular city.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return True if the purchase was successful; false otherwise.
     */
    buy_warehouse(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        const cost = this.#ns[corp.API].getPurchaseWarehouseCost();
        if (this.funds() < cost) {
            return bool.FAILURE;
        }
        this.#ns[corp.API].purchaseWarehouse(div, ct);
        return bool.SUCCESS;
    }

    /**
     * Start a corporation.  We can start a corporation in one of two ways:
     *
     * (1) Self-funded.  Use $150b of our own money to start a corporation.
     *     This works in any BitNode, but has the disadvantage that we must have
     *     at least $150b upfront.
     * (2) Get a loan.  Take out a loan of $150b to start our corporation.  This
     *     only works in BN3.
     *
     * @return True if our corporation is successfully created; false otherwise.
     */
    create() {
        const player = new Player(this.#ns);
        // Assume we are in BN3.  Use our own money to start a corporation,
        // otherwise take out a loan.
        if (bitnode.Corporatocracy === player.bitnode()) {
            const self_fund = player.money() >= corp_t.SEED_COST;
            return this.#ns[corp.API].createCorporation(corp.NAME, self_fund);
        }
        // We are in a BitNode other than BN3.  Must use our own money to start
        // a corporation.  There is no option to take out a loan.
        if (player.money() < corp_t.SEED_COST) {
            return bool.FAILURE;
        }
        return this.#ns[corp.API].createCorporation(corp.NAME, bool.SELF_FUND);
    }

    /**
     * Create a new product.
     *
     * @param div A string representing the name of a division of our
     *     corporation.
     * @param ct A string representing the name of a city.  We want to develop
     *     our product in this city.
     * @param name A string representing the name of our product.
     * @param investd The amount to invest in the design of the product.
     * @param investm The amount to invest in the marketing of the product.
     */
    create_product(div, ct, name, investd, investm) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        assert(name !== "");
        assert(investd > 0);
        assert(investm > 0);
        this.#ns[corp.API].makeProduct(div, ct, name, investd, investm);
    }

    /**
     * Discontinue a product.
     *
     * @param div A string representing the name of a division of our
     *     corporation.
     * @param name A string representing the name of a product to discontinue.
     */
    discontinue_product(div, name) {
        assert(this.has_division(div));
        assert(this.has_product(name));
        this.#ns[corp.API].discontinueProduct(div, name);
    }

    /**
     * The amount of scientific research accumulated within a division.
     * Research points are required to purchase research.
     *
     * @param div A string representing the name of a division of our
     *     corporation.
     * @return The amount of scientific research of the given division.
     */
    division_research(div) {
        assert(this.has_division(div));
        return this.#ns[corp.API].getDivision(div).research;
    }

    /**
     * Enable Smart Supply for the warehouse of each division in each city.
     */
    enable_smart_supply() {
        this.all_divisions().forEach((div) => {
            cities.all.forEach((ct) => {
                this.#ns[corp.API].setSmartSupply(div, ct, bool.ENABLE);
            });
        });
    }

    /**
     * Expand our corporation into other cities.  We open a division office in
     * another city.
     *
     * @param div A string representing the name of a division of our
     *     corporation.
     * @param ct A string representing the name of a city.  We want to expand
     *     the given division into this city.
     * @return True if the expansion is successful or we already have a division
     *     office in the given city; false otherwise.
     */
    expand_city(div, ct) {
        if (this.has_division_office(div, ct)) {
            return bool.SUCCESS;
        }
        this.#ns[corp.API].expandCity(div, ct);
        return this.has_division_office(div, ct);
    }

    /**
     * Expand our corporation into another industry.
     *
     * @param ind We want to expand into this industry.
     */
    expand_industry(ind) {
        assert(this.is_valid_industry(ind));
        if (!this.has_division(ind)) {
            this.#ns[corp.API].expandIndustry(ind, ind);
        }
    }

    /**
     * The funds available to our corporation.
     *
     * @return The amount of funds our corporation has.
     */
    funds() {
        return this.#ns[corp.API].getCorporation().funds;
    }

    /**
     * Whether we have already created a corporation.
     *
     * @return True if we have already created a corporation; false otherwise.
     */
    has_corp() {
        try {
            assert(this.#ns[corp.API].getCorporation().name === corp.NAME);
            return bool.HAS;
        } catch {
            return bool.NOT;
        }
    }

    /**
     * Whether we have a particular division.  This is also known as an
     * industry.
     *
     * @param div A string representing the name of a division.
     * @return True if we have expanded into the given division;
     *     false otherwise.
     */
    has_division(div) {
        for (const d of this.#ns[corp.API].getCorporation().divisions) {
            assert(d.type === d.name);
            if (d.type === div) {
                return bool.HAS;
            }
        }
        return bool.NOT;
    }

    /**
     * Whether one of our divisions has an office in a given city.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return True if the given division has an office in the particular city;
     *     false otherwise.
     */
    has_division_office(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        for (const d of this.#ns[corp.API].getCorporation().divisions) {
            if (d.name === div) {
                return d.cities.includes(ct);
            }
        }
    }

    /**
     * Whether we have access to the Office and Warehouse APIs.  We have
     * permanent access to these APIs after we have destroyed BN3.3.
     *
     * @return True if we have access to the Office and Warehouse APIs;
     *     false otherwise.
     */
    has_office_warehouse_api() {
        return (
            this.has_unlock_upgrade(corp.unlock.OFFICE)
            && this.has_unlock_upgrade(corp.unlock.WAREHOUSE)
        );
    }

    /**
     * Whether a division has a particular product.
     *
     * @param div A string representing the name of a division.
     * @param name A string representing the name of a product.
     * @return True if the given division has the specified product;
     *     false otherwise.
     */
    has_product(div, name) {
        assert(this.has_division(div));
        try {
            const product = this.#ns[corp.API].getProduct(div, name);
            assert(product.name === name);
            return bool.HAS;
        } catch {
            return bool.NOT;
        }
    }

    /**
     * Whether we have a particular research unlocked.
     *
     * @param div A string representing the name of a division.
     * @param name A string representing the name of a research.
     * @return True if we already have the given research; false otherwise.
     */
    has_research(div, name) {
        assert(this.has_division(div));
        assert(this.is_valid_research(name));
        return this.#ns[corp.API].hasResearched(div, name);
    }

    /**
     * Whether we have an unlockable upgrade.
     *
     * @param upg A string representing the name of an unlock upgrade.
     * @return True if we already have the given unlock upgrade;
     *     false otherwise.
     */
    has_unlock_upgrade(upg) {
        assert(this.is_valid_unlock_upgrade(upg));
        return this.#ns[corp.API].hasUnlockUpgrade(upg);
    }

    /**
     * Hire a new employee for an office.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return A string representing the name of the newly hired employee.  An
     *     empty string if we fail to hire a new employee.
     */
    hire(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        const worker = this.#ns[corp.API].hireEmployee(div, ct);
        return worker !== undefined ? worker.name : "";
    }

    /**
     * Hire AdVert.inc to advertise for our corporation.
     *
     * @param div A string representing the name of a division.
     * @return True if the hiring was successful; false otherwise.
     */
    hire_advert(div) {
        assert(this.has_division(div));
        const cost = this.#ns[corp.API].getHireAdVertCost(div);
        if (this.funds() > cost) {
            this.#ns[corp.API].hireAdVert(div);
            return bool.SUCCESS;
        }
        return bool.FAILURE;
    }

    /**
     * Hire the initial crop of employees for a new office in a city.  Assign an
     * employee to each of the initial positions.
     *
     * @param div The name of a division.
     * @param ct The name of a city.
     */
    initial_hire(div, ct) {
        const max = corp_t.office.INIT_HIRE;
        for (let i = this.num_employees(div, ct); i < max; i++) {
            const name = this.hire(div, ct);
            if (name !== "") {
                this.#ns[corp.API].assignJob(div, ct, name, corp.position[i]);
            }
        }
    }

    /**
     * Whether an office is at capacity, i.e. we already hired the maximum
     * number of employees for the office.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return True if the given office is at capacity; false otherwise.
     */
    is_at_capacity(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        const { employees, size } = this.#ns[corp.API].getOffice(div, ct);
        return employees.length === size;
    }

    /**
     * Whether we have completed the development of a product.
     *
     * @param div A string representing the name of a division.
     * @param name A string representing the name of a product.
     * @return True if the given product has been completed; false otherwise.
     */
    is_product_complete(div, name) {
        assert(this.has_product(div, name));
        return (
            this.#ns[corp.API].getProduct(div, name).developmentProgress
            >= corp_t.MAX_PROGRESS
        );
    }

    /**
     * Whether the given name represents a valid industry.
     *
     * @param name A string representing the name of an industry.
     * @return True if the given name refers to a valid industry;
     *     false otherwise.
     */
    // eslint-disable-next-line class-methods-use-this
    is_valid_industry(name) {
        assert(name !== "");
        const industry = new Set(Object.values(corp.industry));
        return industry.has(name);
    }

    /**
     * Whether the given name represents a valid material.
     *
     * @param name A string representing a material name.
     * @return True if the given name represents a valid material;
     *     false otherwise.
     */
    // eslint-disable-next-line class-methods-use-this
    is_valid_material(name) {
        assert(name !== "");
        const material = new Set(Object.values(corp.material));
        return material.has(name);
    }

    /**
     * Whether the given name represents a valid research.
     *
     * @param name A string representing the name of a research.
     * @return True if the given name represents a valid research;
     *     false otherwise.
     */
    // eslint-disable-next-line class-methods-use-this
    is_valid_research(name) {
        assert(name !== "");
        const research = new Set(Object.values(corp.research));
        return research.has(name);
    }

    /**
     * Whether the given role is valid.
     *
     * @param role The name of a job to assign an employee.
     * @return True if the given name represents a valid role; false otherwise.
     */
    // eslint-disable-next-line class-methods-use-this
    is_valid_role(role) {
        const job = new Set(Object.values(corp.job));
        return job.has(role);
    }

    /**
     * Whether the given string represents a valid round number.  The round
     * number corresponds to the number of times we have accepted investment
     * money.  The round number should be a word representing the number.
     *
     * @param str A string representing the round number.
     * @return True if the string represents a valid round number;
     *     false otherwise.
     */
    // eslint-disable-next-line class-methods-use-this
    is_valid_round(str) {
        const round = new Set(corp.round);
        return round.has(str);
    }

    /**
     * Whether the given name refers to a valid unlock upgrade.
     *
     * @param upg A string representing the name of an unlock upgrade.
     * @return True if the given name refers to a valid unlock upgrade;
     *     false otherwise.
     */
    // eslint-disable-next-line class-methods-use-this
    is_valid_unlock_upgrade(upg) {
        assert(upg !== "");
        const upgrade = new Set(Object.values(corp.unlock));
        return upgrade.has(upg);
    }

    /**
     * Whether the given name refers to a valid level upgrade.
     *
     * @param upg A string representing the name of a level upgrade.
     * @return True if the given name refers to a valid level upgrade;
     *     false otherwise.
     */
    // eslint-disable-next-line class-methods-use-this
    is_valid_upgrade(upg) {
        assert(upg !== "");
        const upgrade = new Set(Object.values(corp.upgrade));
        return upgrade.has(upg);
    }

    /**
     * Whether the employees in an office are vivacious.  An office is said to
     * be vivacious if:
     *
     * (1) The average employee morale is 100.000.
     * (2) The average employee happiness is 99.998 or higher.
     * (3) The average employee energy is 99.998 or higher.
     *
     * @param div The name of a division.
     * @param ct The name of a city.
     * @return True if the employees in an office are vivacious;
     *     false otherwise.
     */
    is_vivacious(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        const stat = this.avg_employee_stats(div, ct);
        const int = (x) => Math.floor(x * 1000);
        return (
            int(stat.morale) >= int(corp_t.employee.MORALE)
            && int(stat.happiness) >= int(corp_t.employee.HAPPINESS)
            && int(stat.energy) >= int(corp_t.employee.ENERGY)
        );
    }

    /**
     * The level of an upgrade that can be levelled.
     *
     * @param name The name of an upgrade that can be levelled.
     * @return The level of the given upgrade.
     */
    level(name) {
        assert(this.is_valid_upgrade(name));
        return this.#ns[corp.API].getUpgradeLevel(name);
    }

    /**
     * Level up an upgrade that can be levelled.  A level upgrade is not the
     * same as an unlock upgrade.
     *
     * @param name The name of the upgrade to level.
     * @return True if we successfully levelled up the given upgrade;
     *     false otherwise.
     */
    level_upgrade(name) {
        assert(this.is_valid_upgrade(name));
        const cost = this.#ns[corp.API].getUpgradeLevelCost(name);
        if (this.funds() < cost) {
            return bool.FAILURE;
        }
        this.#ns[corp.API].levelUpgrade(name);
        return bool.SUCCESS;
    }

    /**
     * Purchase an amount of a material.  We buy this material for a division in
     * a particular city.
     *
     * @param div The name of a division.
     * @param ct The name of a city.
     * @param name The name of the material to buy.
     * @param amt The amount to buy.
     */
    async material_buy(div, ct, name, amt) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        assert(this.is_valid_material(name));
        assert(amt > 0);
        const rate = amt / corp_t.TICK_SECOND; // Amount per second.
        let { qty } = this.#ns[corp.API].getMaterial(div, ct, name);
        const target = qty + amt;
        this.#ns[corp.API].buyMaterial(div, ct, name, rate);
        while (qty < target) {
            await this.#ns.sleep(wait_t.MILLISECOND);
            qty = this.#ns[corp.API].getMaterial(div, ct, name).qty;
        }
        this.#ns[corp.API].buyMaterial(div, ct, name, 0);
    }

    /**
     * The initial selling of our materials.  The amount is the maximum of
     * whatever we have.  The price is set at the market price.
     *
     * @param div The name of a division.
     * @param ct The name of a city.
     * @param name The name of the material to sell.
     */
    material_initial_sell(div, ct, name) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        assert(this.is_valid_material(name));
        this.#ns[corp.API].sellMaterial(
            div,
            ct,
            name,
            corp_t.sell.amount.MAX,
            corp_t.sell.price.MP
        );
    }

    /**
     * The amount of a material currently held in a warehouse of a city.
     *
     * @param div The name of a division.
     * @param ct The name of a city.
     * @param name The name of the material.
     * @return The amount of the given material currently held in the warehouse
     *     of the particular division, in the given city.
     */
    material_qty(div, ct, name) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        assert(this.is_valid_material(name));
        return this.#ns[corp.API].getMaterial(div, ct, name).qty;
    }

    /**
     * Hire an employee and assign them to the given role.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @param role Assign the new hire to this role.
     * @return True if the hiring was successful; false otherwise.
     */
    new_hire(div, ct, role) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        assert(this.is_valid_role(role));
        const name = this.hire(div, ct);
        if (name === "") {
            return bool.FAILURE;
        }
        this.#ns[corp.API].assignJob(div, ct, name, role);
        return bool.SUCCESS;
    }

    /**
     * The number of employees in an office.
     *
     * @param div The name of a division.
     * @param ct The name of a city.
     * @return The number of employees in the given division at the given city.
     */
    num_employees(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        return this.#ns[corp.API].getOffice(div, ct).employees.length;
    }

    /**
     * The number of employees in an office who are assigned the role of
     * Business.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return The number of employees in the given office who have been
     *     assigned to the role of Business.
     */
    num_business(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        return this.#ns[corp.API].getOffice(div, ct).employeeJobs.Business;
    }

    /**
     * The number of employees in an office who are assigned the role of
     * Engineer.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return The number of employees in the given office who have been
     *     assigned to the role of Engineer.
     */
    num_engineer(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        return this.#ns[corp.API].getOffice(div, ct).employeeJobs.Engineer;
    }

    /**
     * The number of employees in an office who are assigned to Idle.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return The number of employees in the given office who have been
     *     assigned to the role of Idle.
     */
    num_idle(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        return this.#ns[corp.API].getOffice(div, ct).employeeJobs.Unassigned;
    }

    /**
     * The number of employees in an office who are assigned to Management.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return The number of employees in the given office who have been
     *     assigned to the role of Management.
     */
    num_management(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        return this.#ns[corp.API].getOffice(div, ct).employeeJobs.Management;
    }

    /**
     * The number of employees in an office who are assigned to Operations.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return The number of employees in the given office who have been
     *     assigned to the role of Operations.
     */
    num_operations(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        return this.#ns[corp.API].getOffice(div, ct).employeeJobs.Operations;
    }

    /**
     * The number of employees in an office who are assigned to
     * Research & Development.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return The number of employees in the given office who have been
     *     assigned to the role of Research & Development.
     */
    num_rnd(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        const rnd = "Research & Development";
        return this.#ns[corp.API].getOffice(div, ct).employeeJobs[rnd];
    }

    /**
     * The number of employees in an office who are assigned to Training.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return The number of employees in the given office who have been
     *     assigned to the role of Training.
     */
    num_training(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        return this.#ns[corp.API].getOffice(div, ct).employeeJobs.Training;
    }

    /**
     * The capacity of an office, i.e. the number of employees the office can
     * accommodate.  This is not the same as the number of employees in the
     * office.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return The size of the given office.
     */
    office_capacity(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        return this.#ns[corp.API].getOffice(div, ct).size;
    }

    /**
     * The rating of a given product.  The rating is a weighted score of various
     * attributes of a product.  The following attributes are taken into account
     * when calculating the rating of a product:
     *
     * (1) Quality
     * (2) Performance
     * (3) Durability
     * (4) Reliability
     * (5) Aesthetics
     * (6) Features
     *
     * Information taken from this file:
     *
     * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Corporation/Product.ts
     *
     * @param div A string representing the name of a division.
     * @param name A string representing the name of a product.
     * @return The rating of the given product.
     */
    product_rating(div, name) {
        assert(this.has_product(div, name));
        return this.#ns[corp.API].getProduct(div, name).rat;
    }

    /**
     * Sell a product that has been developed in a given division.  The amount
     * to sell and the selling price are automatically determined.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @param name The name of the product.
     */
    product_sell(div, ct, name) {
        assert(this.has_product(div, name));
        assert(is_valid_city(ct));
        this.#ns[corp.API].sellProduct(
            div,
            ct,
            name,
            corp_t.sell.amount.MAX,
            corp_t.sell.price.MP,
            bool.NOT
        );
    }

    /**
     * The profit per second during the current tick.
     *
     * @return The profit of our corporation, expressed as per second during
     *     the current tick.
     */
    profit() {
        const { expenses, revenue } = this.#ns[corp.API].getCorporation();
        return revenue - expenses;
    }

    /**
     * The cost in research points of a particular research.
     *
     * @param div A string representing the name of a division.
     * @param name A string representing the name of a research to buy.
     * @return The amount of research points required to unlock the given
     *     research.
     */
    research_cost(div, name) {
        assert(this.has_division(div));
        assert(this.is_valid_research(name));
        return this.#ns[corp.API].getResearchCost(div, name);
    }

    /**
     * Upgrade the office of a division in a particular city.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @param n How many times to upgrade.  Must be a positive integer.
     * @return True if the upgrade was successful; false otherwise.
     */
    upgrade_office(div, ct, n) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        assert(n >= 1);
        const cost = this.#ns[corp.API].getOfficeSizeUpgradeCost(div, ct, n);
        if (this.funds() < cost) {
            return bool.FAILURE;
        }
        this.#ns[corp.API].upgradeOfficeSize(div, ct, n);
        return bool.SUCCESS;
    }

    /**
     * Upgrade the warehouse of a division in a particular city.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @param n How many times to upgrade.  Must be a positive integer.
     * @return True if the upgrade was successful; false otherwise.
     */
    upgrade_warehouse(div, ct, n) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        assert(n >= 1);
        const cost = this.#ns[corp.API].getUpgradeWarehouseCost(div, ct, n);
        if (this.funds() < cost) {
            return bool.FAILURE;
        }
        this.#ns[corp.API].upgradeWarehouse(div, ct, n);
        return bool.SUCCESS;
    }

    /**
     * Waiting for each office to be vivacious.
     */
    async vivacious_office() {
        for (const div of this.all_divisions()) {
            const vivacious = (c) => this.is_vivacious(div, c);
            while (!cities.all.every(vivacious)) {
                await this.#ns.sleep(wait_t.SECOND);
            }
        }
    }

    /**
     * The size or capacity of a warehouse.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return The storage size of the given warehouse.
     */
    warehouse_capacity(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        return this.#ns[corp.API].getWarehouse(div, ct).size;
    }

    /**
     * Upgrade a newly purchased warehouse to the initial capacity.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     */
    warehouse_init_upgrade(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        const howmany = 1;
        while (
            this.#ns[corp.API].getWarehouse(div, ct).size
            < corp_t.warehouse.INIT_UPGRADE_SIZE
        ) {
            this.upgrade_warehouse(div, ct, howmany);
        }
    }
}
