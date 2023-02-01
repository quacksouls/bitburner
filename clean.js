/**
 * Copyright (C) 2022--2023 Duck McSouls
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

/**
 * WARNING: This script will delete all our scripts.  Make sure the scripts are
 * backed up somewhere.
 *
 * Remove all our scripts from the home server, except for this script.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const suffix = [".js", ".script"];
    const remove = (file) => ns.rm(file);
    suffix.forEach((pattern) => {
        ns.ls("home", pattern).forEach(remove);
    });
}
