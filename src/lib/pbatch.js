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

import { hgw } from "/lib/constant/misc.js";
import { home } from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import {
    has_max_money,
    has_min_security,
    hgw_script,
    hgw_wait_time,
    target_money,
} from "/lib/hgw.js";
import { assert, can_run_script, num_threads } from "/lib/util.js";

/**
 * A purchased server that uses a proto-batcher.
 */
export class PservHGW {
    /**
     * Hostname of a purchased server.
     */
    #phost;

    /**
     * The Netscript API.
     */
    #ns;

    /**
     * Create an object to represent a purchased server that uses a
     * proto-batcher.
     *
     * @param ns The Netscript API.
     * @param host Hostname of a purchased server.
     */
    constructor(ns, host) {
        this.#ns = ns;
        this.#phost = host;
    }

    /**
     * Perform an HGW action against a target server.
     *
     * @param host Perform an HGW action against this server.  Cannot be our
     *     home server.
     * @param action The action we want to perform against the given target
     *     server.  Supported actions are:
     *     (1) "grow" := Grow money on the target server.
     *     (2) "weaken" := Weaken the security level of the target server.
     */
    async hgw_action(host, action) {
        assert(host !== "");
        assert(host !== home);
        const time = hgw_wait_time(this.#ns, host, action);
        const s = hgw_script(action);
        assert(can_run_script(this.#ns, s, this.#phost));
        const nthread = () => num_threads(this.#ns, s, this.#phost);
        const run_script = () => this.#ns.exec(s, this.#phost, nthread(), host);
        const pid = run_script();
        await this.#ns.sleep(time);
        const is_action_done = () => !this.#ns.isRunning(pid);
        while (!is_action_done()) {
            await this.#ns.sleep(wait_t.SECOND);
        }
    }

    /**
     * Perform the hack HGW action against a target server.
     *
     * @param host Hack this server.  Cannot be our home server.
     * @param frac The fraction of money to steal.  Must be positive and at
     *     most 1.
     */
    async hgw_hack(host, frac) {
        assert(host !== "");
        assert(host !== home);
        assert(frac > 0 && frac <= 1);

        // max_threads := The number of threads to use to hack the target server
        //     in order to steal the given fraction of money.
        // max_server_threads := The maximum number of threads the purchased
        //     server allows us to run the hack script.
        const money = target_money(this.#ns, host, frac);
        const max_threads = this.#ns.hackAnalyzeThreads(host, money);
        const time = hgw_wait_time(this.#ns, host, hgw.action.HACK);
        const s = hgw_script(hgw.action.HACK);
        assert(can_run_script(this.#ns, s, this.#phost));
        const max_server_threads = num_threads(this.#ns, s, this.#phost);
        let nthread = max_threads;
        if (max_threads > max_server_threads) {
            nthread = max_server_threads;
        }

        const run_script = () => this.#ns.exec(s, this.#phost, nthread, host);
        const pid = run_script();
        await this.#ns.sleep(time);
        const is_action_done = () => !this.#ns.isRunning(pid);
        while (!is_action_done()) {
            await this.#ns.sleep(wait_t.SECOND);
        }
    }

    /**
     * Prepare a world server for hacking.  We use the following strategy.
     *
     * (1) Grow
     * (2) Weaken
     *
     * Apply the above strategy in a loop.  Repeat until the target server has
     * minimum security level and maximum money.
     *
     * @param host Prep this world server.
     */
    async prep_gw(host) {
        for (;;) {
            if (!has_max_money(this.#ns, host)) {
                await this.hgw_action(host, hgw.action.GROW);
            }
            if (!has_min_security(this.#ns, host)) {
                await this.hgw_action(host, hgw.action.WEAKEN);
            }
            if (
                has_min_security(this.#ns, host)
                && has_max_money(this.#ns, host)
            ) {
                return;
            }
            await this.#ns.sleep(0);
        }
    }

    /**
     * Copy our HGW scripts over to a purchased server.
     */
    scp_scripts() {
        const file = [hgw.script.GROW, hgw.script.HACK, hgw.script.WEAKEN];
        this.#ns.scp(file, this.#phost, home);
    }
}
