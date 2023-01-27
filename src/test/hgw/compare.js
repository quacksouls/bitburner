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

import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { log } from "/lib/io.js";
import { assert, to_second } from "/lib/util.js";

/**
 * Use either the naive or proto strategy to hack a common server.
 *
 * @param ns The Netscript API.
 * @param strat The strategy to use.  Either "naive" or "proto".
 * @param host Hack this server.
 * @param amount Hack the target server for this amount of money.
 */
async function hack(ns, strat, host, amount) {
    assert(host !== "");
    assert(amount > 0);
    const target_money = money(ns) + amount;
    let script = "/test/hgw/naive.js";
    if (strat === "proto") {
        script = "/test/hgw/proto.js";
    }
    const nthread = 1;
    const pid = ns.exec(script, home, nthread, host);
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
 * Compare effectiveness of the following hacking strategies:
 *
 * (1) Use all available world servers to target a common server. Run hack,
 *     grow, weaken in a loop.  This is the naive strategy.
 * (2) Use a proto-batcher to pool resources of all available world servers to
 *     target a common server.  This is the proto-batcher strategy.
 *
 * The script accepts the following command line arguments:
 *
 * (1) strategy := The strategy to use.  Either "naive" or "proto".
 * (2) host := Hostname of the target server.
 *
 * Usage: run test/hgw/compare.js [strategy] [host]
 * Example: run test/hgw/compare.js naive n00dles
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const [strat, host] = ns.args;
    assert(strat === "naive" || strat === "proto");
    assert(ns.getServerMaxMoney(host) > 0);

    // Data prior to hacking.
    let time = Date.now();
    let hack_xp = ns.getPlayer().exp.hacking;
    let hack_stat = ns.getPlayer().skills.hacking;

    // Gather data.
    const amount = 10e6;
    await hack(ns, strat, host, amount);

    // Data after hacking.
    time = to_second(Date.now() - time);
    const time_fmt = ns.nFormat(time, "00:00:00");
    hack_xp = ns.getPlayer().exp.hacking - hack_xp;
    const hack_rate = hack_xp / time;
    hack_stat = ns.getPlayer().skills.hacking - hack_stat;
    log(ns, `${host}: ${time_fmt}, ${hack_stat}, ${hack_xp}, ${hack_rate}`);
}
