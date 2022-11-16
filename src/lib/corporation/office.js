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

import { bool } from "/lib/constant/bool.js";
import { corp, corp_t } from "/lib/constant/corp.js";
import { Cutil } from "/lib/corporation/util.js";
import { assert, is_valid_city } from "/lib/util.js";

/**
 * A class to manage an office of our corporation.  We typically use the
 * Corporation API by calling its functions along the format
 *
 * ns["corporation"].functionName()
 *
 * as a means of circumventing the high RAM cost.
 */
export class Office {
    /**
     * The namespace for the Netscript API.
     */
    #ns;

    /**
     * Initialize an Office object.
     *
     * @param ns The namespace for the Netscript API.
     */
    constructor(ns) {
        this.#ns = ns;
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
        assert(Cutil.has_division(this.#ns, div));
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
     * Hire a new employee for an office.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return A string representing the name of the newly hired employee.  An
     *     empty string if we fail to hire a new employee.
     */
    hire(div, ct) {
        assert(Cutil.has_division(this.#ns, div));
        assert(is_valid_city(ct));
        const worker = this.#ns[corp.API].hireEmployee(div, ct);
        return worker !== undefined ? worker.name : "";
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
        assert(Cutil.has_division(this.#ns, div));
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
     * Hire an employee and assign them to the given role.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @param role Assign the new hire to this role.
     * @return True if the hiring was successful; false otherwise.
     */
    new_hire(div, ct, role) {
        assert(Cutil.has_division(this.#ns, div));
        assert(is_valid_city(ct));
        assert(Cutil.is_valid_role(role));
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
        assert(Cutil.has_division(this.#ns, div));
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
        assert(Cutil.has_division(this.#ns, div));
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
        assert(Cutil.has_division(this.#ns, div));
        assert(is_valid_city(ct));
        return this.#ns[corp.API].getOffice(div, ct).employeeJobs.Engineer;
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
        assert(Cutil.has_division(this.#ns, div));
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
        assert(Cutil.has_division(this.#ns, div));
        assert(is_valid_city(ct));
        return this.#ns[corp.API].getOffice(div, ct).employeeJobs.Operations;
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
        assert(Cutil.has_division(this.#ns, div));
        assert(is_valid_city(ct));
        return this.#ns[corp.API].getOffice(div, ct).size;
    }

    /**
     * Upgrade the office of a division in a particular city.
     *
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @param n How many times to upgrade.  Must be a positive integer.
     * @return True if the upgrade was successful; false otherwise.
     */
    upgrade_office(div, ct, n = 1) {
        assert(Cutil.has_division(this.#ns, div));
        assert(is_valid_city(ct));
        assert(n >= 1);
        const cost = this.#ns[corp.API].getOfficeSizeUpgradeCost(div, ct, n);
        if (Cutil.funds(this.#ns) < cost) {
            return bool.FAILURE;
        }
        this.#ns[corp.API].upgradeOfficeSize(div, ct, n);
        return bool.SUCCESS;
    }
}
