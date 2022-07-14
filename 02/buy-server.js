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
 * Purchase new servers and run our hack script on those servers.
 *
 * Usage: run buy-server.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // We want each server to have 16GB of RAM because we will run 2 instances
    // of hack.js on a server, each instance using 3 threads.
    const ram = 16;
    // Our hack script.
    const script = "hack.js";
    // Our hack script is located on our home server.
    const source = "home";
    // How many threads to run our script on a purchased server.
    const nthread = 3;
    // Hack this target.
    const targetA = "n00dles";
    // Hack this other target.
    const targetB = "foodnstuff";
    // Continuously try to purchase a new server until we've reached the
    // maximum number of servers we can buy.
    let i = 0;
    while (i < ns.getPurchasedServerLimit()) {
        // Do we have enough money (on our home server) to buy a new server?
        const money = ns.getServerMoneyAvailable(source);
        const cost = ns.getPurchasedServerCost(ram);
        if (money > cost) {
            const hostname = ns.purchaseServer("pserv", ram);
            await ns.scp(script, source, hostname);
            ns.exec(script, hostname, nthread, targetA);
            ns.exec(script, hostname, nthread, targetB);
            i++;
        }
        await ns.sleep(3000);
    }
}
