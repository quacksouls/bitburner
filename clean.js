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
 * WARNING: This script will delete all our scripts and text files.  Make sure
 * the files are backed up somewhere.
 *
 * Remove all our scripts and text files from the home server, except for this
 * script.  If a script is running, it will not be removed.
 *
 * Usage: run clean.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const suffix = [".js", ".script", ".txt"];
    const rm_file = (file) => ns.rm(file);
    const rm_all_files = (pattern) => ns.ls("home", pattern).forEach(rm_file);
    suffix.forEach(rm_all_files);
}
