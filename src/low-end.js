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

import { MyArray } from "/lib/array.js";
import { bool } from "/lib/constant/bool.js";
import {
    home, home_t, server, server_t,
} from "/lib/constant/server.js";
import { wait_t } from "/lib/constant/time.js";
import { log } from "/lib/io.js";
import { network } from "/lib/network.js";
import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import {
    assert,
    compromised_servers,
    filter_bankrupt_servers,
    filter_pserv,
} from "/lib/util.js";

/**
 * Whether a server is nuked.
 *
 * @param ns The Netscript API.
 * @param s The hostname of a world server.
 * @return True if we have nuked the given server; false otherwise.
 */
function is_nuked(ns, s) {
    const serv = new Server(ns, s);
    serv.gain_root_access();
    return serv.has_root_access();
}

/**
 * The low-end servers to target.  We exclude bankrupt servers and purchased
 * servers.  A server is said to be bankrupt if the maximum amount of money it
 * can hold is zero.
 *
 * @param ns The Netscript API.
 * @return An array of hostnames of low-end servers.  This array is never empty.
 */
function low_end(ns) {
    // Sort the servers in ascending order of hack difficulty,
    // i.e. security level.
    let lowend = [];
    const candidate = filter_bankrupt_servers(
        ns,
        filter_pserv(ns, network(ns))
    ).filter((s) => s !== server.ONION);
    candidate.forEach((s) => {
        const security_lvl = ns.getServer(s).hackDifficulty;
        lowend.push([security_lvl, s]);
    });
    lowend = MyArray.sort_ascending_tuple(lowend);
    // Choose how many low-end servers to target.
    const home_ram = ns.getServer(home).maxRam;
    let ntarget = 0;
    if (home_ram >= 3 * home_t.RAM_HIGH) {
        ntarget = server_t.lowend.HIGH;
    } else if (home_ram > home_t.RAM_HIGH) {
        ntarget = server_t.lowend.MID;
    } else {
        assert(home_ram <= home_t.RAM_HIGH);
        ntarget = server_t.lowend.LOW;
    }
    // Get the hostnames of low-end servers to target.
    lowend = lowend.slice(0, ntarget).map((a) => a[1]);
    assert(lowend.length > 0);
    return lowend;
}

/**
 * Try to gain root access to a bunch of servers in the game world.  We exclude
 * purchased servers.
 *
 * @param ns The Netscript API.
 * @return An array of newly nuked servers.  We gained root access to these
 *     servers during this update.
 */
function nuke_servers(ns) {
    // An array of servers that were successfully nuked during this update.
    const player = new Player(ns);
    const nuked = filter_pserv(ns, network(ns))
        .filter((s) => !skip_server(ns, s, player.script()))
        .filter((t) => is_nuked(ns, t));
    if (nuked.length > 0) {
        log(ns, `Compromised server(s): ${nuked.join(", ")}`);
    }
    return nuked;
}

/**
 * Whether we should skip the server.  A server might be skipped over for
 * various reasons.
 *
 * @param ns The Netscript API.
 * @param s Should we skip this server?
 * @param script The name of our hacking script.
 * @return True if we are to skip over the given server; false otherwise.
 */
function skip_server(ns, s, script) {
    const serv = new Server(ns, s);
    const player = new Player(ns);
    // Determine the maximum number of ports we can open on a server.
    const nport = player.num_ports();
    assert(nport >= 0);
    // Skip over a server that requires more ports than we can open.
    if (serv.num_ports_required() > nport) {
        return bool.SKIP;
    }
    // If our hack script is already running on the server, then skip the
    // server.
    if (serv.is_running_script(script)) {
        return bool.SKIP;
    }
    // Determine how many threads we can run our script on a server.  If we
    // can't run our script on the server, then we skip the server.
    const nthread = serv.num_threads(script);
    if (nthread < 1) {
        return bool.SKIP;
    }
    // Skip over a server if its hacking skill requirement is too high.
    if (player.hacking_skill() < serv.hacking_skill()) {
        return bool.SKIP;
    }
    return bool.NO_SKIP;
}

/**
 * Search for world servers and direct them to hack low-end servers.  We exclude
 * purchased servers.
 *
 * @param ns The Netscript API.
 */
function update(ns) {
    // A list of servers that have been successfully nuked.
    const player = new Player(ns);
    const compromised = compromised_servers(ns, player.script(), network(ns));
    // Gain root access to new servers in the game world.  Exclude all purchased
    // servers.
    const new_nuked = nuke_servers(ns);
    if (new_nuked.length < 1) {
        return;
    }
    // Direct all nuked servers to target a small number of low-end servers.
    // First, kill all scripts on the compromised servers.  Then redirect the
    // compromised and newly nuked servers to target some low-end servers.
    compromised.forEach((s) => ns.killall(s));
    const lowend = low_end(ns);
    let n = 0;
    compromised.concat(new_nuked).forEach((s) => {
        const serv = new Server(ns, s);
        const i = n % lowend.length;
        serv.deploy(lowend[i]);
        log(ns, `Redirect ${s} to hack low-end server: ${lowend[i]}`);
        n++;
    });
}

/**
 * Use each server in the game world to hack low-end servers.  We exclude
 * purchased servers.  A server is low-end if its Hack stat requirement is low,
 * possibly less than 10 Hack requirement.  Early in a BitNode when our stats
 * and money are low, we need a good source of passive income.  Hacking low-end
 * servers provides a good source of income.  We do not target all low-end
 * servers, only a small number of these.
 *
 * Usage: run low-end.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Make the log less verbose.
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("scan");
    ns.disableLog("sleep");
    // Continuously look for world servers to hack low-end servers.
    log(ns, "Hacking low-end servers");
    for (;;) {
        update(ns);
        await ns.sleep(wait_t.MINUTE);
    }
}
