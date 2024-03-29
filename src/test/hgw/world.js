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

import { base } from "/quack/lib/constant/misc.js";
import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import { log } from "/quack/lib/io.js";
import { assert, time_hms, to_second } from "/quack/lib/util.js";

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
    const script = worker_script(strat);
    const option = { preventDuplicates: true, threads: 1 };
    const pid = ns.exec(script, home, option, host);
    while (money(ns) < target_money) {
        await ns.sleep(wait_t.SECOND);
    }
    ns.kill(pid);
    ns.exec("/quack/kill-script.js", home, option, "world");
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
 * The script to use depending on the hacking strategy.
 *
 * @param strat The strategy to use.  Either "naive", "proto", or "smart".
 * @return The script corresponding to the given strategy.
 */
function worker_script(strat) {
    switch (strat) {
        case "naive":
            return "/quack/test/hgw/naive.js";
        case "proto":
            return "/quack/test/hgw/proto.js";
        case "smart":
            return "/quack/test/hgw/smart.js";
        default:
            // Should never reach here.
            assert(false);
    }
}

/**
 * Compare effectiveness of the following hacking strategies:
 *
 * (1) Use all available world servers to target a common server. Run hack,
 *     grow, weaken in a loop.  This is the naive strategy.
 * (2) Same as the naive strategy, but each of the hack/grow/weaken functions is
 *     separated into its own script.  This is the smart strategy.
 * (3) Use a sequential batcher to pool resources of all available world servers
 *     to target a common server.  This is the proto strategy.
 *
 * The script accepts the following command line arguments:
 *
 * (1) strategy := The strategy to use.  Either "naive", "proto", or "smart".
 * (2) host := Hostname of the target server.
 * (3) amount := The amount of money we want to raise.
 *
 * Usage: run quack/test/hgw/world.js [strategy] [host] [amount]
 * Example: run quack/test/hgw/world.js naive n00dles 10e6
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const [strat, host, amount] = ns.args;
    assert(strat === "naive" || strat === "proto" || strat === "smart");
    assert(ns.getServerMaxMoney(host) > 0);
    const max_money = parseInt(amount, base.DECIMAL);
    assert(max_money > 0);

    // Data prior to hacking.
    let time = Date.now();
    let hack_xp = ns.getPlayer().exp.hacking;
    let hack_stat = ns.getPlayer().skills.hacking;

    // Gather data.
    await hack(ns, strat, host, max_money);

    // Data after hacking.
    const rate = (amt, ms) => amt / to_second(ms);
    time = Date.now() - time;
    const time_fmt = time_hms(time);
    hack_xp = ns.getPlayer().exp.hacking - hack_xp;
    const xp_rate = rate(hack_xp, time);
    hack_stat = ns.getPlayer().skills.hacking - hack_stat;
    const money_rate = rate(max_money, time);
    const stat = `${hack_stat}, ${hack_xp}, ${xp_rate}, ${money_rate}`;
    log(ns, `${host}: ${time_fmt}, ${stat}`);
}
