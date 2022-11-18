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
import { corp } from "/lib/constant/corp.js";
import { cities } from "/lib/constant/location.js";
import { wait_t } from "/lib/constant/time.js";
import { Office } from "/lib/corporation/office.js";
import { assert, is_valid_city } from "/lib/util.js";

/**
 * A class containing various utility methods, implemented as static methods.
 * We typically use the Corporation API by calling its functions along the
 * format
 *
 * ns["corporation"].functionName()
 *
 * as a means of circumventing the high RAM cost.
 */
export class Cutil {
    /**
     * All divisions of our corporation.
     *
     * @param ns The Netscript API.
     * @return An array containing the names of all divisions of our
     *     corporation.
     */
    static all_divisions(ns) {
        return ns[corp.API].getCorporation().divisions.map((d) => d.name);
    }

    /**
     * The funds available to our corporation.
     *
     * @param ns The Netscript API.
     * @return The amount of funds our corporation has.
     */
    static funds(ns) {
        return ns[corp.API].getCorporation().funds;
    }

    /**
     * Whether we have already created a corporation.
     *
     * @param ns The Netscript API.
     * @return True if we have already created a corporation; false otherwise.
     */
    static has_corp(ns) {
        try {
            assert(ns[corp.API].getCorporation().name === corp.NAME);
            return bool.HAS;
        } catch {
            return bool.NOT;
        }
    }

    /**
     * Whether we have a particular division.  This is also known as an
     * industry.
     *
     * @param ns The Netscript API.
     * @param div A string representing the name of a division.
     * @return True if we have expanded into the given division;
     *     false otherwise.
     */
    static has_division(ns, div) {
        for (const d of ns[corp.API].getCorporation().divisions) {
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
     * @param ns The Netscript API.
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return True if the given division has an office in the particular city;
     *     false otherwise.
     */
    static has_division_office(ns, div, ct) {
        assert(this.has_division(ns, div));
        assert(is_valid_city(ct));
        for (const d of ns[corp.API].getCorporation().divisions) {
            if (d.name === div) {
                return d.cities.includes(ct);
            }
        }
    }

    /**
     * Whether we have access to the Office and Warehouse APIs.  We have
     * permanent access to these APIs after we have destroyed BN3.3.
     *
     * @param ns The Netscript API.
     */
    static has_office_warehouse_api(ns) {
        return (
            this.has_unlock_upgrade(ns, corp.unlock.OFFICE)
            && this.has_unlock_upgrade(ns, corp.unlock.WAREHOUSE)
        );
    }

    /**
     * Whether we have an unlockable upgrade.
     *
     * @param ns The Netscript API.
     * @param upg A string representing the name of an unlock upgrade.
     * @return True if we already have the given unlock upgrade;
     *     false otherwise.
     */
    static has_unlock_upgrade(ns, upg) {
        assert(this.is_valid_unlock_upgrade(upg));
        return ns[corp.API].hasUnlockUpgrade(upg);
    }

    /**
     * Whether an office is at capacity, i.e. we already hired the maximum
     * number of employees for the office.
     *
     * @param ns The Netscript API.
     * @param div A string representing the name of a division.
     * @param ct A string representing the name of a city.
     * @return True if the given office is at capacity; false otherwise.
     */
    static is_at_capacity(ns, div, ct) {
        assert(this.has_division(ns, div));
        assert(is_valid_city(ct));
        const { employees, size } = ns[corp.API].getOffice(div, ct);
        return employees.length === size;
    }

    /**
     * Whether the given name represents a valid industry.
     *
     * @param name A string representing the name of an industry.
     * @return True if the given name refers to a valid industry;
     *     false otherwise.
     */
    static is_valid_industry(name) {
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
    static is_valid_material(name) {
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
    static is_valid_role(role) {
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
    static is_valid_round(str) {
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
    static is_valid_unlock_upgrade(upg) {
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
    static is_valid_upgrade(upg) {
        assert(upg !== "");
        const upgrade = new Set(Object.values(corp.upgrade));
        return upgrade.has(upg);
    }

    /**
     * The profit per second during the current tick.
     *
     * @param ns The Netscript API.
     * @return The profit of our corporation, expressed as per second during
     *     the current tick.
     */
    static profit(ns) {
        const { expenses, revenue } = ns[corp.API].getCorporation();
        return revenue - expenses;
    }

    /**
     * Convert a number in words to integer.
     *
     * @param str A word representing a number.  For example, "one" refers to
     *     the integer 1.
     * @return The integer equivalent of the given number.
     */
    static to_number(str) {
        assert(str !== "");
        const round = {
            one: 1,
            two: 2,
            three: 3,
            four: 4,
        };
        return round[str];
    }

    /**
     * Waiting for each office to be vivacious.
     *
     * @param ns The Netscript API.
     */
    static async vivacious_office(ns) {
        const office = new Office(ns);
        for (const div of this.all_divisions(ns)) {
            const vivacious = (c) => office.is_vivacious(div, c);
            while (!cities.all.every(vivacious)) {
                await ns.sleep(wait_t.SECOND);
            }
        }
    }
}
