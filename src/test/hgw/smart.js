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
     * Various scripts in the HGW model.
     */
    script: {
        /**
         * The grow script.  Use this script to grow money on a server.
         */
        GROW: "/quack/hgw/grow.js",
        /**
         * The hack script.  Use this script to hack a server.
         */
        HACK: "/quack/hgw/hack.js",
        /**
         * The weaken script.  Use this script to lower the security of a
         * server.
         */
        WEAKEN: "/quack/hgw/weaken.js",
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
 * A function for assertion.
 *
 * @param cond Assert that this condition is true.
 * @return Throw an assertion error if the given condition is false.
 */
function assert(cond) {
    if (!cond) {
        throw new Error("Assertion failed.");
    }
}

/**
 * Whether we can run a script on a given server.
 *
 * @param ns The Netscript API.
 * @param s A script to run.  Assumed to exist on our home server as well
 *     as the target host.
 * @param host The target host.
 * @return True if the given target server can run the script; false otherwise.
 */
function can_run_script(ns, s, host) {
    return num_threads(ns, s, host) > 0;
}

/**
 * Exclude the purchased servers.
 *
 * @param ns The Netscript API.
 * @param serv An array of hostnames.
 * @return An array of hostnames, but minus the purchased servers.
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
 * @param ns The Netscript API.
 * @param host Hostname of a world server.
 * @return True if we have root access to the given server; false otherwise.
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
 * @param ns The Netscript API.
 * @param host Hostname of a world server.
 * @return True if we have root access to the given server; false otherwise.
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
 * Continuously hack a server.
 *
 * @param ns The Netscript API.
 * @param host Hack this server.
 */
async function hack(ns, host) {
    // How much money a server should have before we hack it.  Even if the
    // server is bankrupt, successfully hacking it would increase our Hack XP,
    // although we would not receive any money.  Set the money threshold at 75%
    // of the server's maximum money.
    const money_threshold = Math.floor(ns.getServerMaxMoney(host) * 0.75);
    // The threshold for the server's security level.  If the target's
    // security level is higher than the threshold, weaken the target
    // before doing anything else.
    const security_threshold = ns.getServerMinSecurityLevel(host) + 5;
    // Continuously hack/grow/weaken the target server.
    const money = () => ns.getServerMoneyAvailable(host);
    for (;;) {
        if (ns.getServerSecurityLevel(host) > security_threshold) {
            await hgw_action(ns, host, hgw.action.WEAKEN);
        } else if (money() < money_threshold) {
            await hgw_action(ns, host, hgw.action.GROW);
        } else {
            await hgw_action(ns, host, hgw.action.HACK);
        }
    }
}

/**
 * Whether we have root access to a server.
 *
 * @param ns The Netscript API.
 * @param host Hostname of a world server.
 * @return True if we have have root access to the given server;
 *     false otherwise.
 */
function has_root_access(ns, host) {
    return ns.getServer(host).hasAdminRights;
}

/**
 * Perform an HGW action against a target server.
 *
 * @param ns The Netscript API.
 * @param host Perform an HGW action against this server.  Cannot be our home
 *     server.
 * @param action The action we want to perform against the given target server.
 *     Supported actions are:
 *     (1) "hack" := Hack a server.
 *     (2) "grow" := Grow money on the target server.
 *     (3) "weaken" := Weaken the security level of the target server.
 */
async function hgw_action(ns, host, action) {
    assert(host !== "");
    assert(host !== server.HOME);

    const botnet = nuke_servers(ns);
    const time = hgw_wait_time(ns, host, action);
    const s = hgw_script(action);
    const has_ram_to_run_script = (serv) => can_run_script(ns, s, serv);
    const nthread = (serv) => num_threads(ns, s, serv);
    const run_script = (serv) => {
        const option = { preventDuplicates: true, threads: nthread(serv) };
        return ns.exec(s, serv, option, host);
    };
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
 * @param action The action we want to perform against a target server.
 *     Supported actions are:
 *     (1) "grow" := Grow money on the target server.
 *     (2) "hack" := Steal money from the target server.
 *     (3) "weaken" := Weaken the security level of the target server.
 * @return The HGW script corresponding to the given action.
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
 * @param ns The Netscript API.
 * @param host Perform an HGW action against this server.
 * @param action The action we want to perform against the given target server.
 *     Supported actions are:
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
 * @param ns The Netscript API.
 * @param pid An array of PIDs.
 * @return True if all processes having the given PIDs are done;
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
 * @param ns The Netscript API.
 * @return An array of servers that can be reached from home.  Purchased
 *     servers are excluded.
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
 * Gain root access to as many world servers as we can.
 *
 * @param ns The Netscript API.
 * @return An array of hostnames of servers.  We have root access to each
 *     server.
 */
function nuke_servers(ns) {
    return network(ns).filter((host) => gain_admin_access(ns, host));
}

/**
 * The maximum number of threads that can be used to run our script on a given
 * server.
 *
 * @param ns The Netscript API.
 * @param s A script.  Assumed to be located on home server.
 * @param host Hostname of a world server.
 * @return The maximum number of threads to run our script on the given server.
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
 * The smart strategy.  Same as the naive strategy, but each of the
 * hack/grow/weaken functions is separated into its own script.  This script
 * accepts a command line argument:
 *
 * (1) target := Hostname of server to target.
 *
 * Usage: run quack/test/hgw/smart.js [target]
 * Example: run quack/test/hgw/smart.js n00dles
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const target = ns.args[0];
    assert(ns.getServerMaxMoney(target) > 0);
    await hack(ns, target);
}
