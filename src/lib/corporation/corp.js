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
 * A class to hold information about a corporation.  We use this class to help
 * us manage a corporation.  We typically use the Corporation API by calling its
 * functions along the format ns["Corporation"].functionName in order to
 * circumvent the high RAM cost.
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
     * Purchase an unlock upgrade.  This type of upgrade is a one-time
     * unlockable.  It applies to the entire corporation and cannot be levelled.
     *
     * @param upg A string representing the name of an unlock upgrade.
     * @return true if we successfully purchased the given unlock upgrade or
     *     already have it; false otherwise.
     */
    buy_unlock_upgrade(upg) {
        assert(this.is_valid_unlock_upgrade(upg));
        if (this.has_unlock_upgrade(upg)) {
            return bool.SUCCESS;
        }
        if (this.funds() < this.#ns[corp.API].getUnlockUpgradeCost(upg)) {
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
        if (this.funds() < this.#ns[corp.API].getPurchaseWarehouseCost()) {
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
     * Enable the Smart Supply for all divisions in each city.
     */
    enable_smart_supply() {
        for (const div of this.all_divisions()) {
            cities.all.forEach((ct) => {
                this.#ns[corp.API].setSmartSupply(div, ct, bool.ENABLE);
            });
        }
    }

    /**
     * Expand our corporation into other cities.  We open a division office in
     * another city.
     *
     * @param name A string representing the name of a division of our
     *     corporation.
     * @param city A string representing the name of a city.  We want to expand
     *     the given division into this city.
     * @return True if the expansion is successful or we already have a division
     *     office in the given city; false otherwise.
     */
    expand_city(name, city) {
        if (this.has_division_office(name, city)) {
            return bool.SUCCESS;
        }
        this.#ns[corp.API].expandCity(name, city);
        return this.has_division_office(name, city);
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
     */
    funds() {
        return this.#ns[corp.API].funds;
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
     * @param name A string representing the name of a division.
     * @param city A string representing the name of a city.
     * @return True if the given division has an office in the particular city;
     *     false otherwise.
     */
    has_division_office(name, city) {
        assert(this.has_division(name));
        assert(is_valid_city(city));
        for (const div of this.#ns[corp.API].getCorporation().divisions) {
            if (div.name === name) {
                return div.cities.includes(city);
            }
        }
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
     * Hire a new employee for a division in a particular city.
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
     * Hire AdVert.inc to advertise for our company.
     *
     * @param div A string representing the name of a division.
     */
    hire_advert(div) {
        assert(this.has_division(div));
        if (this.funds() > this.#ns[corp.API].getHireAdVertCost(div)) {
            this.#ns[corp.API].hireAdVert(div);
        }
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
     * Whether the given name represents a valid industry.
     *
     * @param name A string representing the name of an industry.
     * @return True if the the name refers to a valid industry; false otherwise.
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
     * Purchase an amount of a material.  We buy this material for each division
     * in each city.
     *
     * @param name The name of the material to buy.
     * @param amt The amount to buy.
     */
    async material_buy(name, amt) {
        assert(this.is_valid_material(name));
        assert(amt > 0);
        const rate = amt / corp_t.TICK_SECOND; // Amount per second.
        for (const div of this.all_divisions()) {
            for (const ct of cities.all) {
                let { qty } = this.#ns[corp.API].getMaterial(div, ct, name);
                const target = qty + amt;
                this.#ns[corp.API].buyMaterial(div, ct, name, rate);
                while (qty < target) {
                    await this.#ns.sleep(wait_t.MILLISECOND);
                    qty = this.#ns[corp.API].getMaterial(div, ct, name).qty;
                }
                this.#ns[corp.API].buyMaterial(div, ct, name, 0);
            }
        }
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
     * The number of employees in a division at a particular city.
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
        const job = this.#ns[corp.API].getOffice(div, ct).employeeJobs;
        return Number(job.Business);
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
        const job = this.#ns[corp.API].getOffice(div, ct).employeeJobs;
        return Number(job.Engineer);
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
        const job = this.#ns[corp.API].getOffice(div, ct).employeeJobs;
        return Number(job.Management);
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
        const job = this.#ns[corp.API].getOffice(div, ct).employeeJobs;
        return Number(job.Operations);
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
    office_size(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        return this.#ns[corp.API].getOffice(div, ct).size;
    }

    /**
     * The profit per second during the current tick.
     */
    profit() {
        const { expenses, revenue } = this.#ns[corp.API].getCorporation();
        return revenue - expenses;
    }

    /**
     * Upgrade the office of a division in a particular city.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @param n How many times to upgrade.  Default is 1.
     * @return True if the upgrade was successful; false otherwise.
     */
    upgrade_office(div, ct, n = 1) {
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
     * @param n How many times to upgrade.  Default is 1.
     * @return True if the upgrade was successful; false otherwise.
     */
    upgrade_warehouse(div, ct, n = 1) {
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
     * Upgrade a newly purchased warehouse to the initial capacity.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     */
    warehouse_init_upgrade(div, ct) {
        assert(this.has_division(div));
        assert(is_valid_city(ct));
        while (
            this.#ns[corp.API].getWarehouse(div, ct).size
            < corp_t.warehouse.INIT_UPGRADE_SIZE
        ) {
            this.upgrade_warehouse(div, ct);
        }
    }
}
