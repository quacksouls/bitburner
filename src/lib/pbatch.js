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

import { bool } from "/quack/lib/constant/bool.js";
import { hgw } from "/quack/lib/constant/misc.js";
import { home } from "/quack/lib/constant/server.js";
import { wait_t } from "/quack/lib/constant/time.js";
import {
    has_max_money,
    has_min_security,
    hgw_script,
    hgw_wait_time,
    pbatch_num_hthreads,
    pbatch_parameters,
    target_money,
} from "/quack/lib/hgw.js";
import { assert, can_run_script, num_threads } from "/quack/lib/util.js";

/**
 * A purchased server that uses various HGW strategies.
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
     * Create an object to represent a purchased server that uses various
     * batching strategies.
     *
     * @param {NS} ns The Netscript API.
     * @param {string} host Hostname of a purchased server.
     */
    constructor(ns, host) {
        this.#ns = ns;
        this.#phost = host;
    }

    /**
     * Perform an HGW action against a target server.
     *
     * @param {string} host Perform an HGW action against this server.  Cannot
     *     be our home server.
     * @param {string} action The action we want to perform against the given
     *     target server.  Supported actions are:
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
     * @param {string} host Hack this server.  Cannot be our home server.
     * @param {number} frac The fraction of money to steal.  Must be positive
     *     and at most 1.
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
        const max_threads = Math.floor(
            this.#ns.hackAnalyzeThreads(host, money)
        );
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
     * Launch a batch against a target server.  Use the model of proto batcher.
     *
     * @param {string} target Hostname of the server our proto batcher will
     *     target.
     * @returns {Promise<boolean>} True if the batch was successfully launched;
     *     false otherwise.
     */
    async launch_pbatch(target) {
        const hthread = pbatch_num_hthreads(this.#ns, this.#phost, target);
        if (hthread === hgw.pbatch.INVALID_NUM_THREAD) {
            return bool.FAILURE;
        }

        const param = pbatch_parameters(this.#ns, target, hthread);
        // eslint-disable-next-line
        const exec = (script, nthread) => this.#ns.exec(script, this.#phost, nthread, target);
        const sleep = (time) => this.#ns.sleep(time);
        const pidw = exec(hgw.script.WEAKEN, param.weaken.thread);
        await sleep(param.weaken.time - hgw.pbatch.DELAY - param.grow.time);
        const pidg = exec(hgw.script.GROW, param.grow.thread);
        await sleep(param.grow.time - hgw.pbatch.DELAY - param.hack.time);
        const pidh = exec(hgw.script.HACK, param.hack.thread);
        const not_running = (pid) => !this.#ns.isRunning(pid);
        const pids = [pidh, pidg, pidw];
        const is_done = () => pids.every(not_running);
        for (;;) {
            if (is_done()) {
                return bool.SUCCESS;
            }
            await sleep(hgw.pbatch.SLEEP);
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
     * @param {string} host Prep this world server.
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
     * Prepare a world server for hacking.  We use the following strategy.
     *
     * (1) Weaken
     * (2) Grow
     *
     * Apply the above strategy in a loop.  Repeat until the target server has
     * minimum security level and maximum money.
     *
     * @param {string} host Prep this world server.
     */
    async prep_wg(host) {
        for (;;) {
            if (!has_min_security(this.#ns, host)) {
                await this.hgw_action(host, hgw.action.WEAKEN);
            }
            if (!has_max_money(this.#ns, host)) {
                await this.hgw_action(host, hgw.action.GROW);
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
