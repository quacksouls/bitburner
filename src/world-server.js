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

import { bool } from "/lib/constant/bool.js";
import { wait_t } from "/lib/constant/time.js";
import { log } from "/lib/io.js";
import { network } from "/lib/network.js";
import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import { assert, compromised_servers, nuke_servers } from "/lib/util.js";

/**
 * A server that has the greatest hack desirability score.
 *
 * @param ns The Netscript API.
 * @return Hostname of the server to target.
 */
function choose_target_server(ns) {
    const desirable_server = (s, t) => (weight(ns, s) < weight(ns, t) ? t : s);
    return nuke_servers(ns).reduce(desirable_server);
}

/**
 * Deploy our hack script to a nuked server.  Use the server to hack the given
 * target.
 *
 * @param ns The Netscript API.
 * @param host Hostname of a world server where we will run our hacking script.
 *     Assumed to have root access to this server.
 * @param target Use our hack script to hack this target server.
 */
function deploy(ns, host, target) {
    const serv = new Server(ns, host);
    serv.deploy(target);
}

/**
 * Whether a given server is different from the server we are targetting.
 *
 * @param ns The Netscript API.
 * @param host Hostname of a possibly new target.
 * @return True if the given server is our new target.
 */
function is_new_target(ns, host) {
    const player = new Player(ns);
    const compromised = compromised_servers(ns, player.script(), network(ns));
    if (compromised.length === 0) {
        return bool.NEW;
    }
    const { filename, args } = ns.ps(compromised[0])[0];
    assert(player.script() === filename);
    return host !== args[0];
}

/**
 * Disable various messages in the script log.
 *
 * @param ns The Netscript API.
 */
function shush(ns) {
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("scan");
    ns.disableLog("sleep");
}

/**
 * Search for world servers to nuke.  Direct each compromised server to target a
 * common server.  We exclude purchased servers.
 *
 * @param ns The Netscript API.
 */
async function update(ns) {
    const target = choose_target_server(ns);
    if (!is_new_target(ns, target)) {
        return;
    }
    log(ns, `Redirect servers to hack common target: ${target}`);
    const player = new Player(ns);
    compromised_servers(ns, player.script(), network(ns)).forEach((s) => {
        ns.killall(s);
    });
    nuke_servers(ns).forEach((s) => deploy(ns, s, target));
}

/**
 * The weight, or hack desirability, of a server.  Higher weight is better.
 *
 * @param ns The Netscript API.
 * @param host The hostname of a server.
 * @return A non-negative number representing the hack desirability of the given
 *     server.
 */
function weight(ns, host) {
    const serv = new Server(ns, host);
    const player = new Player(ns);
    const threshold = player.hacking_skill() / 2;
    if (
        serv.is_home()
        || serv.is_pserv()
        || !serv.has_root_access()
        || serv.hacking_skill() > threshold
    ) {
        return 0;
    }
    assert(serv.security_min() > 0);
    return serv.money_max() / serv.security_min();
}

/**
 * Use each server in the game world to hack a common target.  We exclude
 * purchased servers.
 *
 * Usage: run world-server.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    shush(ns);
    // Continuously look for world servers to nuke.
    log(ns, "Searching for world servers to nuke and hack");
    for (;;) {
        await update(ns);
        await ns.sleep(5 * wait_t.MINUTE);
    }
}
