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

import { bool } from "/lib/constant/bool.js";
import { darkweb, hgw } from "/lib/constant/misc.js";
import { server } from "/lib/constant/server.js";
import {
    assemble_botnet, hgw_action, prep_gw, prep_wg,
} from "/lib/hgw.js";
import { log } from "/lib/io.js";
import { assert, has_all_popen, has_program } from "/lib/util.js";

/**
 * Whether to abandon the server joesguns.
 *
 * @param ns The Netscript API.
 * @return True if we should abandon joesguns; false otherwise.
 */
function abandon_joesguns(ns) {
    return !choose_joesguns(ns);
}

/**
 * Whether to abandon the server n00dles.
 *
 * @param ns The Netscript API.
 * @return True if we should abandon n00dles; false otherwise.
 */
function abandon_noodles(ns) {
    return !choose_noodles(ns);
}

/**
 * Whether to target the server joesguns.
 *
 * @param ns The Netscript API.
 * @return True if we are to prep and hack joesguns; false otherwise.
 */
function choose_joesguns(ns) {
    assert(has_program(ns, darkweb.program.brutessh.NAME));
    assert(has_program(ns, darkweb.program.ftpcrack.NAME));
    return (
        !has_program(ns, darkweb.program.relaysmtp.NAME)
        || !has_program(ns, darkweb.program.httpworm.NAME)
        || !has_program(ns, darkweb.program.sqlinject.NAME)
    );
}

/**
 * Whether to target the server n00dles.
 *
 * @param ns The Netscript API.
 * @return True if we are to prep and hack n00dles; false otherwise.
 */
function choose_noodles(ns) {
    return (
        !has_program(ns, darkweb.program.brutessh.NAME)
        || !has_program(ns, darkweb.program.ftpcrack.NAME)
    );
}

/**
 * Whether to target the server phantasy.
 *
 * @param ns The Netscript API.
 * @return True if we are to prep and hack phantasy; false otherwise.
 */
function choose_phantasy(ns) {
    if (!has_all_popen(ns)) {
        return bool.NOT;
    }
    const cutoff = Math.floor(ns.getHackingLevel() / 2);
    return cutoff >= ns.getServerRequiredHackingLevel(server.PHANTASY);
}

/**
 * Choose the target server to prep and hack.
 *
 * @param ns The Netscript API.
 * @return Hostname of the server to target.
 */
function choose_target(ns) {
    if (choose_noodles(ns)) {
        return server.NOODLES;
    }
    if (choose_joesguns(ns)) {
        return server.JOES;
    }
    if (choose_phantasy(ns)) {
        return server.PHANTASY;
    }
    return server.NOODLES;
}

/**
 * Continuously hack a server.  Steal a certain percentage of the server's
 * money, then weaken/grow the server until it is at minimum security level and
 * maximum money.  Rinse and repeat.
 *
 * @param ns The Netscript API.
 * @param host Hack this server.
 */
async function hack(ns, host) {
    for (;;) {
        await prep_server(ns, host);
        const botnet = assemble_botnet(
            ns,
            host,
            hgw.hack[host].FRACTION,
            bool.NOT_PREP
        );
        await hgw_action(ns, host, botnet, hgw.action.HACK);
        if (next_host(ns, host)) {
            return;
        }
        await ns.sleep(0);
    }
}

/**
 * Whether to move on to another server to target.
 *
 * @param ns The Netscript API.
 * @param host Hostname of the server we are currently targeting.
 * @return True if we should abandon the current host and target another host;
 *     false otherwise.
 */
function next_host(ns, host) {
    switch (host) {
        case server.NOODLES:
            return abandon_noodles(ns);
        case server.JOES:
            return abandon_joesguns(ns);
        case server.PHANTASY:
            return bool.NOT;
        default:
            // Should never reach here.
            assert(false);
    }
}

/**
 * Prep a server.  Weaken the server to its minimum security level and grow the
 * server to its maximum amount of money.
 *
 * @param ns The Netscript API.
 * @param host Prep this server.
 */
async function prep_server(ns, host) {
    switch (host) {
        case server.NOODLES:
        case server.JOES:
            await prep_gw(ns, host);
            break;
        case server.PHANTASY:
            await prep_wg(ns, host);
            break;
        default:
            // Should never reach here.
            assert(false);
    }
}

/**
 * A sequential batcher that pools the resources of world servers to target a
 * common server.  Each of the hack, grow, and weaken functions is separated
 * into its own script.  When we need a particular HGW action, we launch the
 * appropriate script against a target server.  We pool the resources of all
 * world servers, excluding our home server and purchased servers.
 *
 * Usage: run hgw/world.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    let prev_host = "";
    for (;;) {
        const host = choose_target(ns);
        assert(ns.getServerMaxMoney(host) > 0);
        if (host !== prev_host) {
            log(ns, `Prep and hack ${host}`);
            prev_host = host;
        }
        await hack(ns, host);
        await ns.sleep(0);
    }
}