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

// Keep this script as independent as possible so that its RAM requirement is
// as low as possible.  Avoid importing anything into this script.

/**
 * Try to gain root access on a server.
 *
 * @param ns The Netscript API.
 * @param server We want root access on this server.
 * @return true if we have root access on this server;
 *     false if root access cannot be obtained.
 */
async function gain_root_access(ns, server) {
    // Do we already have root access on this server?
    if (ns.hasRootAccess(server)) {
        return true;
    }
    // Try to open all required ports and nuke the server.
    try { await ns.brutessh(server); } catch { }
    try { await ns.ftpcrack(server); } catch { }
    try { await ns.httpworm(server); } catch { }
    try { await ns.relaysmtp(server); } catch { }
    try { await ns.sqlinject(server); } catch { }
    try {
        await ns.nuke(server);
        return true;
    } catch {
        return false;
    }
}

/**
 * Hack a server and steal its money.  We weaken the server's security as
 * necessary, grow the server in case the amount of money on the server is
 * below our threshold, and hack the server when all conditions are met.  This
 * script accepts the first command line argument given to the script at
 * runtime.  We want one command line argument, i.e. the name of the* server we
 * want to hack.
 *
 * Usage: run hack.js [targetServer]
 * Example: run hack.js n00dles
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The target server, i.e. the server to hack.
    const target = ns.args[0];
    // Ensure we have root access on the target server.
    if (!ns.hasRootAccess(target)) {
        try {
            await gain_root_access(ns, target);
        } catch {
            const error_msg = "Can't gain root access to " + target;
            await ns.tprint(error_msg);
            ns.exit();
        }
    }
    // How much money a server should have before we hack it.  Even if the
    // server is bankrupt, successfully hacking it would increase our hacking
    // experience points, although we would not receive any money.
    // Set the money threshold at 75% of the server's maximum money.
    const money_threshold = ns.getServerMaxMoney(target) * 0.75;
    // The threshold for the server's security level.  If the target's
    // security level is higher than the threshold, weaken the target
    // before doing anything else.
    const security_threshold = ns.getServerMinSecurityLevel(target) + 5;
    // Continuously hack/grow/weaken the target server.
    const time = 1;  // One millisecond.
    while (true) {
        const money_available = ns.getServerMoneyAvailable(target);
        if (ns.getServerSecurityLevel(target) > security_threshold) {
            // If the server's security level is above our threshold, weaken it.
            await ns.weaken(target);
        } else if (money_available < money_threshold) {
            // If the server's money is less than our threshold, grow it.
            await ns.grow(target);
        } else {
            // Otherwise, hack it.
            await ns.hack(target);
        }
        await ns.sleep(time);
    }
}
