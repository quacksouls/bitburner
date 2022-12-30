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

import { darkweb } from "/lib/constant/misc.js";
import { home } from "/lib/constant/server.js";
import { assemble_botnet, hgw_hack, prep_gw } from "/lib/hgw.js";
import { log } from "/lib/io.js";
import { assert, has_program, to_second } from "/lib/util.js";

/**
 * The server to target, depending on which program we want to buy.
 *
 * @param ns The Netscript API.
 * @param prog We want to purchase this program.
 * @return Hostname of the server to target.
 */
function choose_target(ns, prog) {
    let host = "";
    switch (prog) {
        case "ssh":
            host = "n00dles";
            break;
        case "ftp":
            assert(has_program(ns, "BruteSSH.exe"));
            host = "n00dles";
            break;
        case "smtp":
            assert(has_program(ns, "BruteSSH.exe"));
            assert(has_program(ns, "FTPCrack.exe"));
            host = "joesguns";
            break;
        default:
            // Should never reach here.
            assert(false);
    }
    assert(host !== "");
    return host;
}

/**
 * Continuously hack a server.  Steal a certain percentage of the server's
 * money, then weaken/grow the server until it is at minimum security level and
 * maximum money.  Rinse and repeat.
 *
 * @param ns The Netscript API.
 * @param frac The fraction of money to steal.  Only relevant when we raise
 *     money to buy relaySMTP.exe.
 * @param prog Raise enough money to buy this program.
 */
async function hack(ns, frac, prog) {
    const fraction = money_fraction(ns, frac, prog);
    const cost = total_cost(ns, prog);
    const host = choose_target(ns, prog);
    const has_enough_money = () => ns.getServerMoneyAvailable(home) >= cost;
    while (!has_enough_money()) {
        await prep_gw(ns, host);
        const botnet = assemble_botnet(ns, host, fraction);
        await hgw_hack(ns, host, botnet);
        await ns.sleep(0);
    }
}

/**
 * The fraction of money to steal from a server.
 *
 * @param ns The Netscript API.
 * @param frac The default fraction of money to steal.
 * @param prog Buy this program.
 * @return The true frction of money to steal, depending on which program we
 *     want to purchase.
 */
function money_fraction(ns, frac, prog) {
    let fraction = 0;
    switch (prog) {
        case "ssh":
            fraction = 0.5;
            break;
        case "ftp":
            assert(has_program(ns, "BruteSSH.exe"));
            fraction = 0.5;
            break;
        case "smtp":
            assert(has_program(ns, "BruteSSH.exe"));
            assert(has_program(ns, "FTPCrack.exe"));
            fraction = frac;
            break;
        default:
            // Should never reach here.
            assert(false);
    }
    assert(fraction > 0);
    return fraction;
}

/**
 * The total cost of purchasing a program via the dark web.
 *
 * @param ns The Netscript API.
 * @param prog Raise enough money to buy this program.
 * @return The cost of buying the given program.
 */
function total_cost(ns, prog) {
    let cost = 0;
    switch (prog) {
        case "ssh":
            cost = darkweb.program.brutessh.COST + darkweb.tor.COST;
            break;
        case "ftp":
            assert(has_program(ns, "BruteSSH.exe"));
            cost = darkweb.program.ftpcrack.COST;
            break;
        case "smtp":
            assert(has_program(ns, "BruteSSH.exe"));
            assert(has_program(ns, "FTPCrack.exe"));
            cost = darkweb.program.relaysmtp.COST;
            break;
        default:
            // Should never reach here.
            assert(false);
    }
    assert(cost > 0);
    return cost;
}

/**
 * Use a proto-batcher to determine how long it takes to raise enough money to
 * purchase the TOR router as well as these programs:
 *
 * (1) BruteSSH.exe
 * (2) FTPCrack.exe
 * (3) relaySMTP.exe
 *
 * Each of the hack, grow, and weaken functions is separated into its own
 * script.  When we need a particular HGW action, we launch the appropriate
 * script against a target server.  We pool the resources of all world servers,
 * excluding our home server and purchased servers.  This script accepts 2
 * command line arguments:
 *
 * (1) program := The program to buy.
 *     ssh := BruteSSH.exe
 *     ftp := FTPCrack.exe
 *     smtp := relaySMTP.exe
 * (2) moneyFraction := The fraction of money to steal from a server.
 *
 * Usage: run test/hgw/smtp.js [program] [moneyFraction]
 * Example: run test/hgw/smtp.js ssh 0.2
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const [prog, fr] = ns.args;
    const fraction = parseFloat(fr);
    assert(fraction > 0 && fraction <= 1);
    const target = choose_target(ns, prog);
    // Data prior to hacking.
    let time = Date.now();
    let hack_xp = ns.getPlayer().exp.hacking;
    let hack_stat = ns.getPlayer().skills.hacking;
    // HGW actions.
    await hack(ns, fraction, prog);
    // Data after hacking.
    time = to_second(Date.now() - time);
    const time_fmt = ns.nFormat(time, "00:00:00");
    hack_xp = ns.getPlayer().exp.hacking - hack_xp;
    const hack_rate = hack_xp / time;
    hack_stat = ns.getPlayer().skills.hacking - hack_stat;
    log(ns, `${target}: ${time_fmt}, ${hack_stat}, ${hack_xp}, ${hack_rate}`);
}
