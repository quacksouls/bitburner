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

/** ***********************************************************************
 * Global data.
 *********************************************************************** */

/**
 * Various constants related to the dark web.
 */
const darkweb = {
    /**
     * Constants related to various programs that can be purchased via the dark
     * web.
     */
    program: {
        brutessh: "BruteSSH.exe",
        ftpcrack: "FTPCrack.exe",
        httpworm: "HTTPWorm.exe",
        relaysmtp: "relaySMTP.exe",
        sqlinject: "SQLInject.exe",
    },
};

/**
 * Various constants in the model of hack/grow/weaken (HGW).
 */
const hgw = {
    /**
     * Various actions in the HGW model.
     */
    action: {
        GROW: "grow",
        HACK: "hack",
        WEAKEN: "weaken",
    },
    /**
     * The fraction of money to steal from a server.
     */
    hack: {
        joesguns: {
            FRACTION: 0.6,
        },
        n00dles: {
            FRACTION: 0.5,
        },
        phantasy: {
            FRACTION: 0.5,
        },
    },
    /**
     * Various scripts in the HGW model.
     */
    script: {
        /**
         * The grow script.  Use this script to grow money on a server.
         */
        GROW: "/hgw/grow.js",
        /**
         * The hack script.  Use this script to hack a server.
         */
        HACK: "/hgw/hack.js",
        /**
         * The weaken script.  Use this script to lower the security of a
         * server.
         */
        WEAKEN: "/hgw/weaken.js",
    },
};

/**
 * Various constants related to a server.
 */
const server = {
    /**
     * Our home server.
     */
    HOME: "home",
    /**
     * The server joesguns.
     */
    JOES: "joesguns",
    /**
     * The server n00dles.
     */
    NOODLES: "n00dles",
    /**
     * The server phantasy.
     */
    PHANTASY: "phantasy",
};

/** ***********************************************************************
 * Utility functions.
 *********************************************************************** */

/**
 * Whether to abandon the server joesguns.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we should abandon joesguns; false otherwise.
 */
function abandon_joesguns(ns) {
    return !choose_joesguns(ns);
}

/**
 * Whether to abandon the server n00dles.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we should abandon n00dles; false otherwise.
 */
function abandon_noodles(ns) {
    return !choose_noodles(ns);
}

/**
 * Choose the servers from our botnet to use for hacking.  The servers are
 * chosen such that the total number of threads they offer allow us to steal a
 * certain percentage of a target's money.  Essentially, the problem is this.
 * We know we need n threads to steal a fraction of a target's money.  Choose
 * servers from among our botnet that would allow us to hack using n threads or
 * thereabout.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hack this server.
 * @param {number} frac The fraction of money to steal.  Must be between 0 and
 *     1.
 * @param {boolean} is_prep Are we prepping a world server?
 * @returns {array} An array of objects {host, thread} as follows:
 *
 *     (1) host := Hostname of a server where we are to run our hack script.
 *     (2) thread := The number of threads to use on the given server.
 *
 *     If is_prep is true, then return an array of hostnames of world servers.
 */
function assemble_botnet(ns, host, frac, is_prep) {
    if (is_prep) {
        return nuke_servers(ns);
    }
    const s = hgw.script.HACK;
    const nthread = (serv) => num_threads(ns, s, serv);
    const descending = (a, b) => nthread(b) - nthread(a);
    const has_ram_to_run_script = (serv) => can_run_script(ns, s, serv);
    const money = target_money(ns, host, frac);
    const max_threads = ns.hackAnalyzeThreads(host, money);
    const botnet = [];
    let n = 0;
    nuke_servers(ns)
        .filter(has_ram_to_run_script)
        .sort(descending)
        .forEach((serv) => {
            if (n >= max_threads) {
                return;
            }
            const k = threads_to_use(ns, serv, n, max_threads);
            botnet.push({ host: serv, thread: k });
            n += k;
            assert(n <= max_threads);
        });
    assert(botnet.length > 0);
    return botnet;
}

/**
 * A function for assertion.  Throw an assertion error if the given condition is
 * false.
 *
 * @param {boolean} cond Assert that this condition is true.
 */
function assert(cond) {
    if (!cond) {
        throw new Error("Assertion failed.");
    }
}

/**
 * Whether we can run a script on a given server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} s A script to run.  Assumed to exist on our home server as
 *     well as the target host.
 * @param {string} host The target host.
 * @returns {boolean} True if the given target server can run the script;
 *     false otherwise.
 */
function can_run_script(ns, s, host) {
    return num_threads(ns, s, host) > 0;
}

/**
 * Whether to target the server joesguns.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we are to prep and hack joesguns;
 *     false otherwise.
 */
function choose_joesguns(ns) {
    assert(has_program(ns, darkweb.program.brutessh));
    assert(has_program(ns, darkweb.program.ftpcrack));
    return (
        !has_program(ns, darkweb.program.relaysmtp)
        || !has_program(ns, darkweb.program.httpworm)
        || !has_program(ns, darkweb.program.sqlinject)
    );
}

/**
 * Whether to target the server n00dles.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we are to prep and hack n00dles; false otherwise.
 */
function choose_noodles(ns) {
    return (
        !has_program(ns, darkweb.program.brutessh)
        || !has_program(ns, darkweb.program.ftpcrack)
    );
}

/**
 * Whether to target the server phantasy.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we are to prep and hack phantasy; false otherwise.
 */
function choose_phantasy(ns) {
    if (!has_all_popen(ns)) {
        return false;
    }
    const cutoff = Math.floor(ns.getHackingLevel() / 2);
    return cutoff >= ns.getServerRequiredHackingLevel(server.PHANTASY);
}

/**
 * Choose the target server to prep and hack.
 *
 * @param {NS} ns The Netscript API.
 * @returns {string} Hostname of the server to target.
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
 * Exclude the purchased servers.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} serv An array of hostnames.
 * @returns {array<string>} An array of hostnames, but minus the purchased
 *     servers.
 */
function filter_pserv(ns, serv) {
    const is_home = (s) => s === server.HOME;
    const not_purchased = (s) => !ns.getServer(s).purchasedByPlayer;
    const not_pserv = (s) => is_home(s) || not_purchased(s);
    return serv.filter(not_pserv);
}

/**
 * Attempt to gain root access to a given server.  After gaining root access, we
 * copy our HGW scripts over to the server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of a world server.
 * @returns {boolean} True if we have root access to the given server;
 *     false otherwise.
 */
function gain_admin_access(ns, host) {
    if (gain_root_access(ns, host)) {
        const file = [hgw.script.GROW, hgw.script.HACK, hgw.script.WEAKEN];
        ns.scp(file, host, server.HOME);
        return true;
    }
    return false;
}

/**
 * Attempt to gain root access to a given server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of a world server.
 * @returns {boolean} True if we have root access to the given server;
 *     false otherwise.
 */
function gain_root_access(ns, host) {
    if (has_root_access(ns, host)) {
        return true;
    }
    // Try to open all required ports and nuke the server.
    try {
        ns.brutessh(host);
    } catch {}
    try {
        ns.ftpcrack(host);
    } catch {}
    try {
        ns.httpworm(host);
    } catch {}
    try {
        ns.relaysmtp(host);
    } catch {}
    try {
        ns.sqlinject(host);
    } catch {}
    try {
        ns.nuke(host);
        return true;
    } catch {
        return false;
    }
}

/**
 * Continuously hack a server.  Steal a certain percentage of the server's
 * money, then weaken/grow the server until it is at minimum security level and
 * maximum money.  Rinse and repeat.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hack this server.
 */
async function hack(ns, host) {
    const not_prep = false;
    for (;;) {
        await prep_server(ns, host);
        const botnet = assemble_botnet(
            ns,
            host,
            hgw.hack[host].FRACTION,
            not_prep
        );
        await hgw_action(ns, host, botnet, hgw.action.HACK);
        if (next_host(ns, host)) {
            return;
        }
        await ns.sleep(0);
    }
}

/**
 * Whether we have all port opener programs.
 *
 * @param {NS} ns The Netscript API.
 * @returns {boolean} True if we have all port opener programs; false otherwise.
 */
function has_all_popen(ns) {
    return (
        has_program(ns, darkweb.program.brutessh)
        && has_program(ns, darkweb.program.ftpcrack)
        && has_program(ns, darkweb.program.relaysmtp)
        && has_program(ns, darkweb.program.httpworm)
        && has_program(ns, darkweb.program.sqlinject)
    );
}

/**
 * Whether a server's money is at its maximum.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host The hostname of a server.
 * @returns {boolean} True if the amount of money on the given server is at its
 *     maximum; false otherwise.
 */
function has_max_money(ns, host) {
    const { moneyAvailable, moneyMax } = ns.getServer(host);
    return moneyAvailable >= moneyMax;
}

/**
 * Whether a server's security level is at its minimum.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host The hostname of a server.
 * @returns {boolean} True if the security level of the given server is at its
 *     minimum; false otherwise.
 */
function has_min_security(ns, host) {
    const { hackDifficulty, minDifficulty } = ns.getServer(host);
    return hackDifficulty <= minDifficulty;
}

/**
 * Whether we have a particular program.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} prog Do we have this program?
 * @returns {boolean} True if we have the given program; false otherwise.
 */
function has_program(ns, prog) {
    return ns.fileExists(prog, server.HOME);
}

/**
 * Whether we have root access to a server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of a world server.
 * @returns {boolean} True if we have have root access to the given server;
 *     false otherwise.
 */
function has_root_access(ns, host) {
    return ns.getServer(host).hasAdminRights;
}

/**
 * Perform an HGW action against a target server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Perform an HGW action against this server.  Cannot be
 *     our home server.
 * @param {array<string>} botnet An array of world servers to which we have root
 *     access.  Use these servers to perform an HGW action against the given
 *     target.  Cannot be empty array.
 * @param {string} action The action we want to perform against the given target
 *     server.  Supported actions are:
 *     (1) "grow" := Grow money on the target server.
 *     (2) "weaken" := Weaken the security level of the target server.
 */
async function hgw_action(ns, host, botnet, action) {
    assert(host !== "");
    assert(host !== server.HOME);
    assert(botnet.length > 0);

    const time = hgw_wait_time(ns, host, action);
    const s = hgw_script(action);
    let has_ram_to_run_script = (serv) => can_run_script(ns, s, serv);
    const nthread = (serv) => num_threads(ns, s, serv);
    let run_script = (serv) => ns.exec(s, serv, nthread(serv), host);
    if (action === hgw.action.HACK) {
        has_ram_to_run_script = (obj) => can_run_script(ns, s, obj.host);
        run_script = (obj) => ns.exec(s, obj.host, obj.thread, host);
    }
    const pid = botnet.filter(has_ram_to_run_script).map(run_script);
    if (pid.length === 0) {
        return;
    }
    await ns.sleep(time);
    const second = 1000;
    while (!is_action_done(ns, pid)) {
        await ns.sleep(second);
    }
}

/**
 * The HGW script to use for a given HGW action.
 *
 * @param {string} action The action we want to perform against a target server.
 *     Supported actions are:
 *     (1) "grow" := Grow money on the target server.
 *     (2) "hack" := Steal money from the target server.
 *     (3) "weaken" := Weaken the security level of the target server.
 * @returns {string} The HGW script corresponding to the given action.
 */
function hgw_script(action) {
    switch (action) {
        case hgw.action.GROW:
            return hgw.script.GROW;
        case hgw.action.HACK:
            return hgw.script.HACK;
        case hgw.action.WEAKEN:
            return hgw.script.WEAKEN;
        default:
            // Should never reach here.
            assert(false);
    }
}

/**
 * The amount of time in milliseconds we must wait for an HGW action to
 * complete.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Perform an HGW action against this server.
 * @param {string} action The action we want to perform against the given target
 *     server.  Supported actions are:
 *     (1) "grow" := Grow money on the target server.
 *     (2) "hack" := Steal money from the target server.
 *     (3) "weaken" := Weaken the security level of the target server.
 * @return The amount of time required for the given action to complete on the
 *     target server.
 */
function hgw_wait_time(ns, host, action) {
    switch (action) {
        case hgw.action.GROW:
            return ns.getGrowTime(host);
        case hgw.action.HACK:
            return ns.getHackTime(host);
        case hgw.action.WEAKEN:
            return ns.getWeakenTime(host);
        default:
            // Should never reach here.
            assert(false);
    }
}

/**
 * Whether an HGW action is completed.
 *
 * @param {NS} ns The Netscript API.
 * @param {array<number>} pid An array of PIDs.
 * @returns {boolean} True if all processes having the given PIDs are done;
 *     false otherwise.
 */
function is_action_done(ns, pid) {
    assert(pid.length > 0);
    const is_done = (i) => !ns.isRunning(i);
    return pid.every(is_done);
}

/**
 * Scan the network of servers in the game world.  Each server must be
 * reachable from our home server.  We do not include purchased servers.
 *
 * @param {NS} ns The Netscript API.
 * @returns {array<string>} An array of servers that can be reached from home.
 *     Purchased servers are excluded.
 */
function network(ns) {
    const q = [server.HOME];
    const visit = new Set([server.HOME]);
    while (q.length > 0) {
        const u = q.shift();
        ns.scan(u)
            .filter((v) => !visit.has(v))
            .forEach((x) => {
                visit.add(x);
                q.push(x);
            });
    }
    visit.delete(server.HOME);
    return filter_pserv(ns, [...visit]);
}

/**
 * Whether to move on to another server to target.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of the server we are currently targeting.
 * @returns {boolean} True if we should abandon the current host and target
 *     another host; false otherwise.
 */
function next_host(ns, host) {
    switch (host) {
        case server.NOODLES:
            return abandon_noodles(ns);
        case server.JOES:
            return abandon_joesguns(ns);
        case server.PHANTASY:
            return false;
        default:
            // Should never reach here.
            assert(false);
    }
}

/**
 * Gain root access to as many world servers as we can.
 *
 * @param {NS} ns The Netscript API.
 * @returns {array<string>} An array of hostnames of servers.  We have root
 *     access to each server.
 */
function nuke_servers(ns) {
    return network(ns).filter((host) => gain_admin_access(ns, host));
}

/**
 * The maximum number of threads that can be used to run our script on a given
 * server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} s A script.  Assumed to be located on home server.
 * @param {string} host Hostname of a world server.
 * @returns {number} The maximum number of threads to run our script on the
 *     given server.
 */
function num_threads(ns, s, host) {
    const script_ram = ns.getScriptRam(s, server.HOME);
    const { maxRam, ramUsed } = ns.getServer(host);
    const server_ram = maxRam - ramUsed;
    if (server_ram < 1) {
        return 0;
    }
    return Math.floor(server_ram / script_ram);
}

/**
 * Prepare a server for hacking.  We use the following strategy.
 *
 * (1) Grow
 * (2) Weaken
 *
 * Apply the above strategy in a loop.  Repeat until the target server has
 * minimum security level and maximum money.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Prep this server.
 */
async function prep_gw(ns, host) {
    const is_prep = true;
    for (;;) {
        const botnet = assemble_botnet(ns, host, 0, is_prep);
        if (!has_max_money(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.GROW);
        }
        if (!has_min_security(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.WEAKEN);
        }
        if (has_min_security(ns, host) && has_max_money(ns, host)) {
            return;
        }
        await ns.sleep(0);
    }
}

/**
 * Prep a server.  Weaken the server to its minimum security level and grow the
 * server to its maximum amount of money.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Prep this server.
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
 * Prepare a server for hacking.  We use the following strategy.
 *
 * (1) Weaken
 * (2) Grow
 *
 * Apply the above strategy in a loop.  Repeat until the target server has
 * minimum security and maximum money.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Prep this server.
 */
async function prep_wg(ns, host) {
    const is_prep = true;
    for (;;) {
        const botnet = assemble_botnet(ns, host, 0, is_prep);
        if (!has_min_security(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.WEAKEN);
        }
        if (!has_max_money(ns, host)) {
            await hgw_action(ns, host, botnet, hgw.action.GROW);
        }
        if (has_min_security(ns, host) && has_max_money(ns, host)) {
            return;
        }
        await ns.sleep(0);
    }
}

/**
 * The amount of money to steal from a server.  We should refrain from emptying
 * a server of all of its money.  Instead, our objective should be to steal a
 * fraction of a server's money.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Steal money from this server.
 * @param {number} frac The fraction of money to steal.
 * @returns {number} The amount of money to steal from the given server.
 */
function target_money(ns, host, frac) {
    return Math.floor(frac * ns.getServer(host).moneyMax);
}

/**
 * The number of threads to use on a given server.
 *
 * @param {NS} ns The Netscript API.
 * @param {string} host Hostname of a server.
 * @param {number} current The current total number of threads.
 * @param {number} max The overall maximum number of threads we should use.
 * @returns {number} The number of threads to use on the given server to run our
 *     hack script.
 */
function threads_to_use(ns, host, current, max) {
    assert(current >= 0);
    assert(max > 0);
    const k = num_threads(ns, hgw.script.HACK, host);
    if (current + k <= max) {
        return k;
    }
    assert(current + k > max);
    const j = max - current;
    assert(j > 0 && j < k);
    assert(current + j <= max);
    return j;
}

/**
 * A sequential batcher.  Each of the hack, grow, and weaken functions is
 * separated into its own script.  When we need a particular HGW action, we
 * launch the appropriate script against a target server.  We pool the resources
 * of world servers, excluding our home server and purchased servers.
 *
 * Our purpose is to raise money and Hack XP.
 *
 * Usage: run hgw/world.js
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    for (;;) {
        const host = choose_target(ns);
        assert(ns.getServerMaxMoney(host) > 0);
        await hack(ns, host);
        await ns.sleep(0);
    }
}
