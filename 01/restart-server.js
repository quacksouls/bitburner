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

/**
 * Restart all scripts on a purchased server.  This is useful in the case where
 * all scripts running on a purchased server have been killed.  We start running
 * those scripts again.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Our hack script.
    const script = "hack.js";
    // How many threads to run our script on a purchased server.
    const nthread = 3;
    // Hack this target.
    const targetA = "n00dles";
    // Hack this other target.
    const targetB = "foodnstuff";
    // Cycle through our purchased servers to see whether to restart our
    // hack.js script.
    for (const server of ns.getPurchasedServers()) {
        if (!ns.isRunning(script, server, targetA)) {
            ns.exec(script, server, nthread, targetA);
        }
        if (!ns.isRunning(script, server, targetB)) {
            ns.exec(script, server, nthread, targetB);
        }
    }
}
