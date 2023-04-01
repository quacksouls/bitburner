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

import { home } from "/quack/lib/constant/server.js";
import { darkweb } from "/quack/lib/constant/tor.js";
import { assemble_botnet, hgw_hack, prep_mwg } from "/quack/lib/hgw.js";
import { log } from "/quack/lib/io.js";
import { assert, to_second } from "/quack/lib/util.js";

/**
 * Continuously hack a server.  Steal a certain percentage of the server's
 * money, then weaken/grow the server until it is at minimum security level and
 * maximum money.  Rinse and repeat.
 *
 * @param ns The Netscript API.
 * @param host Hack this server.
 * @param percent The percentage of money to steal.
 * @param prog Raise enough money to buy this program.
 */
async function hack(ns, host, percent, prog) {
    const threshold = total_cost(prog);
    assert(threshold > 0);
    const enough_money = () => ns.getServerMoneyAvailable(home) >= threshold;
    while (!enough_money()) {
        await prep_mwg(ns, host);
        const botnet = assemble_botnet(ns, host, percent);
        await hgw_hack(ns, host, botnet);
        await ns.sleep(0);
    }
}

/**
 * The total cost of purchasing a program via the dark web.
 *
 * @param prog Raise enough money to buy this program.
 * @return The cost of buying the given program.  Return 0 if the program is
 *     unknown.
 */
function total_cost(prog) {
    if (prog === "ssh") {
        return darkweb.program.brutessh.COST + darkweb.tor.COST;
    }
    if (prog === "ftp") {
        return darkweb.program.ftpcrack.COST;
    }
    return 0;
}

/**
 * Use a proto-batcher to determine how long it takes to raise enough money to
 * purchase both the TOR router as well as the BruteSSH.exe program.  Then raise
 * enough money to buy the FTPCrack.exe program.
 *
 * Each of the hack, grow, and weaken functions is separated into its own
 * script.  When we need a particular HGW action, we launch the appropriate
 * script against a target server.  We pool the resources of all world servers,
 * excluding our home server and purchased servers.  This script accepts 2
 * command line arguments:
 *
 * (1) The program to buy.
 *     ssh := The BruteSSH.exe program.
 *     ftp := The FTPCrack.exe program.
 * (2) The percentage of money to steal from a server.
 *
 * Usage: run quack/test/hgw/sshftp.js [program] [moneyPercent]
 * Example: run quack/test/hgw/sshftp.js ssh 0.2
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const target = "n00dles";
    const [prog, pc] = ns.args;
    assert(ns.getServerMaxMoney(target) > 0);
    const percent = parseFloat(pc);
    assert(percent > 0 && percent <= 1);
    // Data prior to hacking.
    let time = Date.now();
    let hack_xp = ns.getPlayer().exp.hacking;
    let hack_stat = ns.getPlayer().skills.hacking;
    // HGW actions.
    await hack(ns, target, percent, prog);
    // Data after hacking.
    time = to_second(Date.now() - time);
    const time_fmt = ns.nFormat(time, "00:00:00");
    hack_xp = ns.getPlayer().exp.hacking - hack_xp;
    const hack_rate = hack_xp / time;
    hack_stat = ns.getPlayer().skills.hacking - hack_stat;
    log(ns, `${target}: ${time_fmt}, ${hack_stat}, ${hack_xp}, ${hack_rate}`);
}
