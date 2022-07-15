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

// A library of classes and functions that can be imported into other scripts.

/****************************************************************************/
/** Class *******************************************************************/
/****************************************************************************/

/**
 * A server class that holds all information about a server, whether it be
 * a purchased server or a server found on the network in the game world.
 */
export class Server {
    /**
     * The amount of Hack stat required to hack this server.
     */
    #hacking_skill;
    /**
     * The hostname of this server.
     */
    #hostname;
    /**
     * The maximum amount of money this server can hold.
     */
    #money_max;
    /**
     * How many ports must be opened on this server in order to run
     * NUKE.exe on it.
     */
    #n_ports_required;
    /**
     * The Netscript API.
     */
    #ns;
    /**
     * The maximum amount of RAM (in GB) on this server.
     */
    #ram_max;
    /**
     * Reserve this amount of RAM.  We want the server to always have at least
     * this amount of RAM available.  The reserve RAM is important especially
     * if this is the player's home server.  We want to have a minimum amount
     * of RAM on the home server for various purposes.
     */
    #ram_reserve;
    /**
     * The minimum security level to which this server can be weaked.
     */
    #security_min;

    /**
     * Create a server object with the given hostname.
     *
     * @param ns The Netscript API.
     * @param hostname The hostname of a server.  The server must exist in the
     *     game world and can be either a purchased server or a server found on
     *     the network in the game world.
     */
    constructor(ns, hostname) {
        const server = ns.getServer(hostname);
        this.#hacking_skill = server.requiredHackingSkill;
        this.#hostname = server.hostname;
        this.#money_max = server.moneyMax;
        this.#n_ports_required = server.numOpenPortsRequired;
        this.#ns = ns;
        this.#ram_max = server.maxRam;
        this.#security_min = server.minDifficulty;
        // By default, we do not reserve any RAM.  However, if this is the
        // player's home server, then reserve some RAM.
        this.#ram_reserve = 0;
        const player = new Player(ns);
        if (this.hostname() == player.home()) {
            this.#ram_reserve = 50;
        }
    }

    /**
     * How much RAM (in GB) is available on this server.
     */
    available_ram() {
        const ram = this.ram_max() - this.#ns.getServerUsedRam(this.hostname());
        return ram;
    }

    /**
     * Try to gain root access on this server.
     *
     * @return true if the player has root access to this server; false if
     *     root access cannot be obtained.
     */
    async gain_root_access() {
        // Do we already have root access to this server?
        if (this.has_root_access()) {
            return true;
        }
        // Try to open all required ports and nuke the server.
        try { await this.#ns.brutessh(this.hostname()); } catch { }
        try { await this.#ns.ftpcrack(this.hostname()); } catch { }
        try { await this.#ns.httpworm(this.hostname()); } catch { }
        try { await this.#ns.relaysmtp(this.hostname()); } catch { }
        try { await this.#ns.sqlinject(this.hostname()); } catch { }
        try {
            await this.#ns.nuke(this.hostname());
            return true;
        } catch {
            assert(!this.has_root_access());
            return false;
        }
    }

    /**
     * Increase the amount of money available on this server.
     *
     */
    async grow() {
        await this.#ns.grow(this.hostname());
    }

    /**
     * Steal money from this server.
     *
     */
    async hack() {
        await this.#ns.hack(this.hostname());
    }

    /**
     * The amount of Hack stat required to hack this server.
     */
    hacking_skill() {
        return this.#hacking_skill;
    }

    /**
     * Whether we have root access to this server.
     *
     * @return true if we have root access to this server; false otherwise.
     */
    has_root_access() {
        return this.#ns.hasRootAccess(this.hostname());
    }

    /**
     * The hostname of this server.
     */
    hostname() {
        return this.#hostname;
    }

    /**
     * Determine whether the server is bankrupt, i.e. it can't hold any money.
     * This is not the same as there being zero money currently on the server.
     * The server can have zero money currently available, but we can grow the
     * server.  The server is bankrupt if the maximum amount of money it
     * can hold is zero.
     *
     * @return true if the server is bankrupt; false otherwise.
     */
    is_bankrupt() {
        const max_money = Math.floor(this.money_max());
        if (0 == max_money) {
            return true;
        }
        return false;
    }

    /**
     * Whether this server is currently running a script.
     *
     * @param script Check to see if this script is currently running on the
     *     server.
     * @return true if the given script is running on the server;
     *     false otherwise.
     */
    is_running_script(script) {
        return this.#ns.scriptRunning(script, this.hostname());
    }

    /**
     * The amount of money currently available on the server.
     *
     */
    money_available() {
        return this.#ns.getServerMoneyAvailable(this.hostname());
    }

    /**
     * The maximum amount of money this server can hold.
     */
    money_max() {
        return this.#money_max;
    }

    /**
     * The number of ports that must be opened in order to hack this server.
     */
    num_ports_required() {
        return this.#n_ports_required;
    }

    /**
     * Determine how many threads we can run a given script on this server.
     * This function takes care not to use all available RAM on the player's
     * home server.  If this is the player's home server, the function reserves
     * some amount of RAM on the home server and use the remaining available
     * RAM to calculate the number of threads to devote to the given script.
     *
     * @param script We want to run this script on the server.  The script must
     *     exist on our home server.
     * @return The number of threads that can be used to run the given script
     *     on this server.  Return 0 if the amount of RAM to reserve is higher
     *     than the available RAM.
     */
    num_threads(script) {
        const player = new Player(this.#ns);
        const script_ram = this.#ns.getScriptRam(script, player.home());
        const server_ram = this.available_ram() - this.#ram_reserve;
        if (server_ram < 1) {
            return 0;
        }
        const nthread = Math.floor(server_ram / script_ram);
        return nthread;
    }

    /**
     * The maximum amount of RAM (GB) of this server.
     */
    ram_max() {
        return this.#ram_max;
    }

    /**
     * The current security level of this server.
     *
     * @param ns The Netscript API.
     */
    security_level() {
        return this.#ns.getServerSecurityLevel(this.hostname());
    }

    /**
     * The minimum security level to which this server can be weakened.
     */
    security_min() {
        return this.#security_min;
    }

    /**
     * The number of threads to use for each instance of a script.  We want to
     * run various instances of a script, each instance uses a certain number
     * of threads.  Given the number of instances to run, we want to know how
     * many threads each instance can use.
     *
     * @param script The script to run on this server.
     * @param n We want to run this many instances of the given script.
     *     Must be a positive whole number.
     * @return The number of threads for each instance of the script.
     *     Return 0 if we cannot run any scripts on this server.
     */
    threads_per_instance(script, n) {
        // Sanity check.
        const ninstance = Math.floor(n);
        assert(ninstance > 0);
        const nthread = this.num_threads(script);
        const nthread_per_instance = Math.floor(nthread / ninstance);
        return nthread_per_instance;
    }

    /**
     * Weaken the security of this server.
     *
     */
    async weaken() {
        await this.#ns.weaken(this.hostname());
    }
}

/****************************************************************************/
/** Helper functions ********************************************************/
/****************************************************************************/

/**
 * Copy our hack and library scripts over to a server and run the hack script
 * on the server.
 *
 * @param ns The Netscript API.
 * @param server Copy our hack and library scripts to this server.  Run our
 *     hack script on this server.
 * @param target We run our hack script against this target server.
 * @return true if our hack script is running on the server using at least one
 *     thread; false otherwise, e.g. no free RAM on the server or we don't have
 *     root access on either servers.
 */
export async function copy_and_run(ns, server, target) {
    // Succeed at copying and/or running the hacking script.
    const SUCCESS = true;
    // Fail to copy and/or run the hacking script.
    const FAILURE = !SUCCESS;
    const player = new Player(ns);
    const serv = new Server(ns, server);
    const targ = new Server(ns, target);

    // Sanity checks.
    // No root access on either servers.
    if (!serv.has_root_access()) {
        await ns.tprint("No root access on server: " + server);
        return FAILURE;
    }
    if (!targ.has_root_access()) {
        await ns.tprint("No root access on server: " + target);
        return FAILURE;
    }
    // Hack and library scripts not found on our home server.
    if (!ns.fileExists(player.script(), player.home())) {
        const msg = "File " + player.script() + " not found on " + player.home();
        await ns.tprint(msg);
        return FAILURE;
    }
    if (!ns.fileExists(player.library(), player.home())) {
        const msg = "File " + player.library() + " not found on " + player.home();
        await ns.tprint(msg);
        return FAILURE;
    }
    // No free RAM on server to run our hack script.
    const nthread = serv.num_threads(player.script());
    if (nthread < 1) {
        await ns.tprint("No free RAM on server: " + server);
        return FAILURE;
    }

    // Copy our scripts over to a server.  Use the server to hack a target.
    await ns.scp(player.script(), player.home(), server);
    await ns.scp(player.library(), player.home(), server);
    await ns.exec(player.script(), server, nthread, target);
    return SUCCESS;
}

/**
 * Use Dijkstra's algorithm to determine the shortest path from a given node
 * to all nodes in a network.
 *
 * @param ns The Netscript API.
 * @param source The source node.  All shortest paths must start from this node.
 * @return These two data structures:
 *     (1) A map of the shortest number of nodes in a path to a target node.
 *         Each path starts from the given source node.  For example, the map
 *         element A[i] means the shortest number of nodes in the path to node
 *         i.
 *     (2) A map of the node preceeding a given node, in a shortest path.  For
 *         example, the map element M[i] gives a node that directly connects to
 *         node i, where M[i] and i are nodes in a shortest path.
 */
function dijkstra(ns, source) {
    // A map of the shortest number of nodes in a path to a target node.
    let dist = new Map();
    // A map of the node preceeding a given node.
    let prev = new Map();
    // A queue of nodes to visit.
    let queue = new Array();
    // Initialization.
    for (const v of network(ns)) {
        dist.set(v, Infinity);
        prev.set(v, undefined);
        queue.push(v);
    }
    // The distance from the source node to itself is zero.
    dist.set(source, 0);
    prev.set(source, undefined);
    queue.push(source);

    // Search for shortest paths from the source node to other nodes.
    // This is an unweighted network so the weight between a node
    // and any of its neighbours is 1.
    const weight = 1;
    while (queue.length > 0) {
        const u = minimumq(queue, dist);
        queue = queue.filter(s => s != u);
        // Consider the neighbours of u.  Each neighbour must still be in
        // the queue.
        let neighbour = [...filter_pserv(ns, ns.scan(u))];
        neighbour = neighbour.filter(s => queue.includes(s));
        for (const v of neighbour) {
            const alt = dist.get(u) + weight;
            // We have found a shorter path to v.
            if (alt < dist.get(v)) {
                dist.set(v, alt);
                prev.set(v, u);
            }
        }
    }
    return [dist, prev];
}

/**
 * Choose the node i with minimum dist[i].  This is a simple implementation.
 * For better performance, the queue should be implemented as a minimum
 * priority queue.
 *
 * @param queue An array of nodes to visit.
 * @param dist A map of the shortest number of nodes in a path to a target node.
 * @return The node i such that dist[i] is minimal.
 */
function minimumq(queue, dist) {
    assert(queue.length > 0);
    assert(dist.size > 0);
    let node = queue[0];
    for (const v of queue) {
        if (dist.get(v) < dist.get(node)) {
            node = v;
        }
    }
    return node;
}

/**
 * Convert the amount of time in minutes to milliseconds.
 *
 * @param time The amount of time in minutes.  Must be a positive whole number.
 * @return The given amount of time in milliseconds.
 */
export function minutes_to_milliseconds(time) {
    const n = Math.floor(time);
    assert(n > 0);
    const second = 1000;         // 1,000 milliseconds in 1 second.
    const minute = 60 * second;  // 60 seconds in 1 minute.
    return n * minute;
}

/**
 * Scan the network of servers in the game world.  Each server must be reachable
 * from our home server.
 *
 * @param ns The Netscript API.
 * @return An array of servers that can be reached from home.
 */
export function network(ns) {
    // We scan the world network from a node, which is assumed to be our home
    // server.  We refer to our home server as the root of the tree.
    const player = new Player(ns);
    const root = player.home();

    // A set of all servers we can visit at the moment.
    let server = new Set();
    // A stack of servers to visit.  We start from our home server.
    let stack = new Array(root);

    // Use depth-first search to navigate all servers we can visit.
    while (stack.length > 0) {
        const s = stack.pop();
        // Have we visited the server s yet?
        if (!server.has(s)) {
            // The server s is now visited.
            server.add(s);
            // Add all neighbours of s to the stack.  Take care to exclude the
            // purchased servers.
            stack.push(...filter_pserv(ns, ns.scan(s)));
        }
    }
    // Convert the set of servers to an array of servers.
    server = [...server];
    // Remove the root node from our array.  We want all servers that are
    // connected either directly or indirectly to the root node.
    return server.filter(s => root != s);
}

/**
 * Convert the amount of time in seconds to milliseconds.
 *
 * @param time The amount of time in seconds.  Must be a positive whole number.
 * @return The given amount of time in milliseconds.
 */
export function seconds_to_milliseconds(time) {
    const n = Math.floor(time);
    assert(n > 0);
    const second = 1000;  // 1,000 milliseconds in 1 second.
    return n * second;
}

/**
 * Determine the shortest path from the source to the target.
 *
 * @param ns The Netscript API.
 * @param source Start our path from this node.
 * @param target We want to reach this node.
 * @return An array of shortest path from source to target.  An
 *     empty array if the target is not reachable from the source.
 */
export function shortest_path(ns, source, target) {
    const [dist, prev] = dijkstra(ns, source);
    // Ensure the target is reachable from the source node.
    if (!dist.has(target)) {
        return [];
    }
    let stack = new Array();
    let u = target;
    // Start from the target and work backward to find the shortest
    // path from the source to the target.
    while (prev.get(u) != undefined) {
        stack.push(u);
        u = prev.get(u);
    }
    assert(stack.length > 0);
    stack.push(source);
    stack.reverse();
    return stack;
}
