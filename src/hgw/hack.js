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

// NOTE: Keep this script as independent and small as possible so that its RAM
// requirement is as low as possible.  Avoid importing anything into this
// script.

/**
 * NOTE: Assume we have root access to the target server.
 *
 * Hack a server and steal its money.
 *
 * Usage: run quack/hgw/hack.js [targetServer]
 * Example: run quack/hgw/hack.js n00dles
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const target = ns.args[0];
    const opt = { stock: true }; // Affects the Stock Market.
    await ns.hack(target, opt);
}
