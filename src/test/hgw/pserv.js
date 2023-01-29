/**
 * Copyright (C) 2023 Duck McSouls
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

import { base } from "/lib/constant/misc.js";
import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { log } from "/lib/io.js";
import { assert, to_second } from "/lib/util.js";

/**
 * Use either the naive or proto strategy to hack a common server.
 *
 * @param ns The Netscript API.
 * @param host Hostname of the purchased server to use.
 * @param target Hack this server.
 * @param frac The fraction of money to steal from the target server.
 * @param amount Hack the target server for this total amount of money.
 */
async function hack(ns, host, target, frac, amount) {
    const target_money = money(ns) + amount;
    const script = "/test/hgw/pbatch.js";
    const nthread = 1;
    const pid = ns.exec(script, home, nthread, host, target, frac);
    while (money(ns) < target_money) {
        await ns.sleep(wait_t.SECOND);
    }
    ns.kill(pid);
    ns.exec("kill-script.js", home, nthread, "world");
}

/**
 * The player's current amount of money.
 *
 * @param ns The Netscript API.
 */
function money(ns) {
    return ns.getServerMoneyAvailable(home);
}

/**
 * Various sanity checks.
 *
 * @param ns The Netscript API.
 * @param psram The amount of RAM for a purchased server.
 * @param target Hostname of the server to target.
 * @param frac The fraction of money to steal from the target server.
 * @param amount The target amount of money to steal.
 */
function sanity_checks(ns, psram, target, frac, amount) {
    const valid_ram = [32, 64, 128, 256];
    assert(valid_ram.includes(psram));
    assert(target !== "");
    assert(ns.getServerMaxMoney(target) > 0);
    assert(frac > 0 && frac <= 1);
    assert(amount > 0);
}

/**
 * Suppress various log messages.
 *
 * @param ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("scan");
    ns.disableLog("sleep");
}

/**
 * Use a proto-batcher on a purchased server to target a world server. This
 * script accepts the following command line arguments:
 *
 * (1) ram := The amount of RAM for a purchased server.  Accepted values are:
 *
 *     * 32 := A purchased server having 32GB RAM.
 *     * 64 := A purchased server having 64GB RAM.
 *     * 128 := A purchased server having 128GB RAM.
 *     * 256 := A purchased server having 256GB RAM.
 *
 * (2) target := Hostname of the server to target.
 * (3) frac := The fraction of money to steal from the target server.
 * (4) amount := The target amount of money to steal.
 *
 * Usage: run test/hgw/pserv.js [ram] [target] [frac] [amount]
 * Example: run test/hgw/pserv.js 128 n00dles 0.5 10e6
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const [ram, target, frac, amount] = ns.args;
    const psram = parseInt(ram, base.DECIMAL);
    const fr = parseFloat(frac);
    const target_money = parseInt(amount, base.DECIMAL);
    sanity_checks(ns, psram, target, fr, target_money);
    shush(ns);

    // Purchase a server having the given amount of RAM.
    const cost = ns.getPurchasedServerCost(psram);
    assert(cost <= money(ns));
    const host = ns.purchaseServer("pserv", psram);

    // Data prior to hacking.
    let time = Date.now();
    let hack_xp = ns.getPlayer().exp.hacking;
    let hack_stat = ns.getPlayer().skills.hacking;

    // Gather data.
    await hack(ns, host, target, fr, target_money);

    // Data after hacking.
    time = to_second(Date.now() - time);
    const time_fmt = ns.nFormat(time, "00:00:00");
    hack_xp = ns.getPlayer().exp.hacking - hack_xp;
    const xp_rate = hack_xp / time;
    hack_stat = ns.getPlayer().skills.hacking - hack_stat;
    const money_rate = amount / time;
    const stat = `${hack_stat}, ${hack_xp}, ${xp_rate}, ${money_rate}`;
    log(ns, `${host}: ${time_fmt}, ${stat}`);
}