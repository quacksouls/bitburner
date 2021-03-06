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
 * Whether we have the necessary programs on our home server to allow us to
 * hack other servers.
 *
 * @param ns The Netscript API.
 * @return true if we have the necessary programs; false otherwise.
 */
function have_programs(ns) {
    const home = "home";
    const program = ["BruteSSH.exe", "FTPCrack.exe", "hack.js", "NUKE.exe"];
    // Ensure we have the prerequisite programs on our home server.
    for (const p of program) {
        if (!ns.fileExists(p, home)) {
            ns.tprint(p + " not found on server " + home);
            return false;
        }
    }
    return true;
}

/**
 * Purchase new servers and run our hack script on those servers.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // We want each server to have 16GB of RAM.
    const server_ram = 16;
    // Our hack script.
    const script = "hack.js";
    // Our hack script is located on our home server.
    const source = "home";
    // How many threads to run our script on a purchased server.
    const script_ram = ns.getScriptRam(script, source);
    const nthread = Math.floor(server_ram / script_ram);
    // Hack this target.
    const target = "neo-net";
    // 10,000 milliseconds or 10 seconds.
    const time = 10000;
    // Wait for our Hack stat to be high enough to hack the target server.
    while (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(target)) {
        await ns.sleep(time);
    }
    // Gain root access on the target server.
    if (!have_programs(ns)) {
        ns.exit();
    }
    if (!ns.hasRootAccess(target)) {
        ns.brutessh(target);
        ns.ftpcrack(target);
        ns.nuke(target);
    }
    // Continuously try to purchase a new server until we've reached the
    // maximum number of servers we can buy.
    const pserv = ns.getPurchasedServers();
    let i = pserv.length;
    while (i < ns.getPurchasedServerLimit()) {
        // Do we have enough money (on our home server) to buy a new server?
        const money = ns.getServerMoneyAvailable(source);
        const cost = ns.getPurchasedServerCost(server_ram);
        if (money > cost) {
            const hostname = ns.purchaseServer("pserv", server_ram);
            await ns.scp(script, source, hostname);
            ns.exec(script, hostname, nthread, target);
            i++;
        }
        await ns.sleep(time);
    }
}
