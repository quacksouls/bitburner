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
 * A combinatorial graph, commonly referrred to as a graph.
 */
export class Graph {
    /**
     * The adjacency map.  Each key is a vertex or node of the graph.  Each
     * value is an array of vertices to which the key is adjacent.  For
     * example, given a node i, adj[i] is an array such that each node in the
     * array is a neighbour of i.
     */
    #adj;
    /**
     * A boolean signifying whether each edge is directed or undirected.
     */
    #directed;

    /**
     * A graph object.
     *
     * @param directed A boolean indicating whether each edge of the graph is
     *     directed or undirected.  If true, then each edge is directed.  If
     *     false, then each edge is undirected.
     */
    constructor(directed) {
        this.#adj = new Map();
        this.#directed = false;
        if (directed) {
            this.#directed = true;
        }
    }

    /**
     * Add an edge to this graph.
     *
     * @param u, v An edge between vertices u and v.
     * @return true if the edge was successfully added to the graph;
     *     false otherwise or the edge is already in the graph.
     */
    add_edge(u, v) {
        const SUCCESS = true;
        const FAILURE = !SUCCESS;
        // Already have the edge.
        if (this.has_edge(u, v)) {
            return FAILURE;
        }
        // First, add the nodes if we don't have them already.
        if (!this.has_node(u)) {
            assert(this.add_node(u));
        }
        if (!this.has_node(v)) {
            assert(this.add_node(v));
        }
        // Now insert the edge (u, v).
        // If the graph is directed, only need to add the edge (u, v).
        // If the graph is undirected, also must add the edge (v, u).
        const u_neighbour = this.neighbour(u);
        u_neighbour.push(v);
        this.#adj.set(u, u_neighbour);
        // Undirected graph.
        if (!this.#directed) {
            const v_neighbour = this.neighbour(v);
            v_neighbour.push(u);
            this.#adj.set(v, v_neighbour);
        }
        return SUCCESS;
    }

    /**
     * Add a vertex to this graph.
     *
     * @param v Add this node.
     * @return true if the given node was successfully added;
     *     false otherwise or the node already exists in the graph.
     */
    add_node(v) {
        const SUCCESS = true;
        const FAILURE = !SUCCESS;
        if (this.has_node(v)) {
            return FAILURE;
        }
        this.#adj.set(v, new Array());
        return SUCCESS;
    }

    /**
     * Use Dijkstra's algorithm to determine a shortest path from a given
     * node to all nodes in a graph.
     *
     * @param source The source vertex.  All shortest paths must start
     *     from this node.
     * @return These two data structures:
     *     (1) A map of the shortest number of nodes in a path to a target
     *         node.  Each path starts from the given source node.  For
     *         example, the map element A[i] means the shortest number of nodes
     *         in a path to node i.
     *     (2) A map of the node preceeding a given node, in a shortest path.
     *         For example, the map element M[i] gives a node that directly
     *         connects to node i, where M[i] and i are nodes in a shortest
     *         path.
     */
    #dijkstra(source) {
        // The implementation is the same for both directed and undirected
        // graphs.
        // A map of the shortest number of nodes in a path to a target node.
        const dist = new Map();
        // A map of the node preceeding a given node.
        const prev = new Map();
        // A queue of nodes to visit.
        let queue = new Array();
        // Initialization.
        for (const v of this.nodes()) {
            dist.set(v, Infinity);
            prev.set(v, undefined);
            queue.push(v);
        }
        // The distance from the source node to itself is zero.
        dist.set(source, 0);
        prev.set(source, undefined);
        queue.push(source);
        // Search for shortest paths from the source node to other nodes.  This
        // is an unweighted graph so the weight between a node and any of its
        // neighbours is 1.
        const weight = 1;
        while (queue.length > 0) {
            const u = this.#minimumq(queue, dist);
            queue = queue.filter(s => s != u);
            // Consider the neighbours of u.  Each neighbour must still be in
            // the queue.
            let neighbour = Array.from(this.neighbour(u));
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
     * All edges of this graph, as an array of arrays.
     */
    edges() {
        // Directed graph.
        if (this.#directed) {
            const edge = new Array();
            for (const u of this.nodes()) {
                for (const v of this.neighbour(u)) {
                    edge.push([u, v]);
                }
            }
            return edge;
        }
        // Undirected graph.
        assert(!this.#directed);
        const edge = new Set();
        for (const u of this.nodes()) {
            for (const v of this.neighbour(u)) {
                // Assume nodes to be comparable, i.e. we can compare the node
                // values.  If each node is an integer, the nodes are
                // comparable because there is an ordering of numbers.  If each
                // node is a string of alphabetic characters, the nodes are
                // also comparable because we can use lexicographic ordering.
                if (u > v) {
                    continue;
                }
                assert(!edge.has([u, v]));
                edge.add([u, v]);
            }
        }
        return [...edge];
    }

    /**
     * Whether the graph has the given edge.
     *
     * @param u, v Check the graph for this edge.
     * @return true if the graph has the edge (u, v); false otherwise.
     */
    has_edge(u, v) {
        const HAS_EDGE = true;
        const DONT_HAVE_EDGE = !HAS_EDGE;
        if (!this.has_node(u)) {
            return DONT_HAVE_EDGE;
        }
        if (!this.has_node(v)) {
            return DONT_HAVE_EDGE;
        }
        // Directed graph.
        if (this.#directed) {
            const neighbour = this.neighbour(u);
            return neighbour.includes(v);
        }
        // Undirected graph.
        assert(!this.#directed);
        const u_neighbour = this.neighbour(u);
        const v_neighbour = this.neighbour(v);
        if (u_neighbour.includes(v)) {
            assert(v_neighbour.includes(u));
            return HAS_EDGE;
        }
        return DONT_HAVE_EDGE;
    }

    /**
     * Whether the graph has the given vertex.
     *
     * @param v Check for the presence or absence of this vertex.
     * @return true if the graph already has the vertex; false otherwise.
     */
    has_node(v) {
        return this.#adj.has(v);
    }

    /**
     * Choose the node i with minimum dist[i].  This is a simple
     * implementation.  For better performance, the queue should be implemented
     * as a minimum priority queue.
     *
     * @param queue An array of nodes to visit.
     * @param dist A map of the shortest number of nodes in a path to
     *     a target node.
     * @return The node i such that dist[i] is minimal.
     */
    #minimumq(queue, dist) {
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
     * The neighbours of a vertex.
     *
     * @param v A node of this graph.
     * @return An array representing the neighbours of the given node.
     */
    neighbour(v) {
        assert(this.has_node(v));
        return this.#adj.get(v);
    }

    /**
     * All nodes of this graph, as an array.
     */
    nodes() {
        const vertex = [...this.#adj.keys()];
        vertex.sort();
        return vertex;
    }

    /**
     * Determine a shortest path from the source to the target.
     *
     * @param source Start our path from this node.
     * @param target We want to reach this node.
     * @return An array representing a shortest path from source to target.
     *     An empty array if the target is not reachable from the source.
     */
    shortest_path(source, target) {
        // The implementation is the same for directed and undirected graphs.
        assert(this.has_node(source));
        assert(this.has_node(target));
        const [dist, prev] = this.#dijkstra(source);
        // Ensure the target is reachable from the source node.
        if (!dist.has(target)) {
            return [];
        }
        const stack = new Array();
        let u = target;
        // Start from the target and work backward to find a shortest path from
        // the source to the target.
        while (prev.get(u) != undefined) {
            stack.push(u);
            u = prev.get(u);
        }
        // Target is not reachable from the source node.
        if (0 == stack.length) {
            return [];
        }
        // Reconstruct the full path from source to target.
        assert(stack.length > 0);
        stack.push(source);
        stack.reverse();
        return stack;
    }
}

/**
 * A class to hold information about money.
 */
export class Money {
    /**
     * The value for one million.
     */
    #million;
    /**
     * Initialize a money object.
     */
    constructor() {
        this.#million = 10 ** 6;
    }

    /**
     * One billion, i.e. 10^9.
     */
    billion() {
        return 1000 * this.million();
    }

    /**
     * One million, i.e. 10^6.
     */
    million() {
        return this.#million;
    }

    /**
     * One quadrillion, i.e. 10^15.
     */
    quadrillion() {
        return 1000 * this.trillion();
    }

    /**
     * One trillion, i.e. 10^12.
     */
    trillion() {
        return 1000 * this.billion();
    }
}

/**
 * A class to hold various utility methods for dealing with arrays.  Cannot
 * name it "Array" because there is already a class called "Array" in the
 * standard API library.
 */
export class MyArray {
    /**
     * Initialize an array object.
     */
    constructor() {
        // Nothing to do here.
    }

    /**
     * Whether the given array has only non-negative numbers.
     *
     * @param array An array of integers.  Cannot be an empty array.
     * @return true if the given array has only non-negative integers;
     *     false otherwise.
     */
    all_nonnegative(array) {
        assert(array.length > 0);
        for (const a of array) {
            if (a < 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * The maximum element of an array.
     *
     * @param We want to determine the maximum element of this array.  Cannot
     *     be an empty array.
     * @return The largest element of the given array.
     */
    max(array) {
        assert(array.length > 0);
        const init_value = -Infinity;
        const mx = array.reduce(
            function (x, y) {
                return Math.max(x, y);
            },
            init_value
        );
        return mx;
    }

    /**
     * A sequence of non-negative integers, starting from zero.  Each number in
     * the sequence is one more than the previous number.
     *
     * @param num How many numbers in the sequence.  Must be positive.  If
     *     num := 4, then our sequence is [0, 1, 2, 3].
     * @return An array representing a sequence of num numbers starting from 0.
     */
    sequence(num) {
        const n = Math.floor(num);
        assert(n > 0);
        return Array(n).fill().map((_, index) => index);
    }

    /**
     * Sort an array in ascending order.
     *
     * @param array We want to sort this array.  Cannot be an empty array.
     * @return A new array whose elements are sorted in ascending order.  If
     *     the array has duplicate elements, we are actually sorting in
     *     non-decreasing order.
     */
    sort_ascending(array) {
        assert(array.length > 0);
        const arr = Array.from(array);
        arr.sort(
            function (a, b) {
                return a - b;
            }
        );
        return arr;
    }

    /**
     * Sort an array in descending order.
     *
     * @param array We want to sort this array.  Cannot be an empty array.
     * @return A new array whose elements are sorted in descending order.  If
     *     the array has duplicate elements, then we are actually sorting the
     *     array in non-increasing order.
     */
    sort_descending(array) {
        assert(array.length > 0);
        const arr = Array.from(array);
        arr.sort(
            function (a, b) {
                return b - a;
            }
        );
        return arr;
    }

    /**
     * Sum the elements of an array.
     *
     * @param array We want to add the elements of this array.  Cannot be an
     *     empty array.
     * @return The sum of the elements in the given array.
     */
    sum(array) {
        assert(array.length > 0);
        const init_value = 0;
        const total = array.reduce(
            function (sum, current) {
                return sum + current;
            },
            init_value
        );
        return total;
    }
}

/**
 * A class that holds all information about a player.
 */
export class Player {
    /**
     * The name of the home server of this player.
     */
    #home;
    /**
     * The player's library of useful classes and functions.  Assumed to be
     * located on the player's home server.
     */
    #library;
    /**
     * The Netscript API.
     */
    #ns;
    /**
     * Programs that allow a player to open ports on a world server.
     * These are port openers.
     */
    #port_opener;
    /**
     * Programs necessary for visiting the network of world servers.
     * These are usuallly network programs.
     */
    #program;
    /**
     * The hack script of the player.  Assumed to be located on the player's
     * home server.
     */
    #script;

    /**
     * Initialize a Player object.
     *
     * @param ns The Netscript API.
     */
    constructor(ns) {
        this.#home = "home";
        this.#library = "libbnr.js";
        this.#ns = ns;
        this.#port_opener = [
            "BruteSSH.exe", "FTPCrack.exe", "HTTPWorm.exe", "relaySMTP.exe",
            "SQLInject.exe"
        ];
        this.#program = ["DeepscanV1.exe", "DeepscanV2.exe", "NUKE.exe"];
        this.#script = "hack.js";
    }

    /**
     * The current Hack stat of the player.
     */
    hacking_skill() {
        return this.#ns.getHackingLevel();
    }

    /**
     * Whether the player has all programs to open all ports on any world
     * server.
     *
     * @return true if the player can open all ports on another server;
     *     false otherwise.
     */
    has_all_port_openers() {
        const limit = this.#port_opener.length;
        const nport = this.num_ports();
        if (nport == limit) {
            return true;
        }
        assert(nport < limit);
        return false;
    }

    /**
     * Whether the player has all programs to visit all world servers and open
     * all ports on any world server.
     *
     * @return true if the player has all network programs and port openers;
     *     false otherwise.
     */
    has_all_programs() {
        let program = Array.from(this.#port_opener);
        program = program.concat(this.#program);
        assert(program.length > 0);
        for (const p of program) {
            if (!this.has_program(p)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Whether we have a given program.
     *
     * @param p A program we want to check.
     */
    has_program(p) {
        return this.#ns.fileExists(p, this.home());
    }

    /**
     * The home server of the player.
     */
    home() {
        return this.#home;
    }

    /**
     * The player's karma.  This is an Easter egg, buried in the source code
     * of the game.  Refer to this file:
     * https://github.com/danielyxie/bitburner/blob/dev/src/NetscriptFunctions/Extra.ts
     */
    karma() {
        return this.#ns.heart.break();
    }

    /**
     * The name of the player's library of utility classes and functions.
     */
    library() {
        return this.#library;
    }

    /**
     * The amount of money available to this player.
     */
    money() {
        return this.#ns.getServerMoneyAvailable(this.home());
    }

    /**
     * Determine the number of ports a player can currently open on servers in
     * the game world.  This depends on whether the player has the necessary
     * hacking programs on the home server.
     */
    num_ports() {
        // These are programs that can be created after satisfying certain
        // conditions.
        let program = Array.from(this.#port_opener);
        // Determine the number of ports we can open on other servers.
        program = program.filter(p => this.#ns.fileExists(p, this.home()));
        return program.length;
    }

    /**
     * All purchased servers of this player.
     */
    pserv() {
        return this.#ns.getPurchasedServers();
    }

    /**
     * The name of the hacking script of the player.
     */
    script() {
        return this.#script;
    }

    /**
     * WARNING: This method assumes that we have access to the Singularity API.
     *
     * Study at Rotham University to raise our Hack stat.  Use this method
     * under the following situations:
     *
     * (1) Immediately after installing one or more Augmentations.
     * (2) When we start all over on a different BitNode.
     */
    async study() {
        // Study the free computer science course at a university.
        const uni = "Rothman University";
        const course = "Study Computer Science";
        const focus = true;
        assert(this.#ns.singularity.universityCourse(uni, course, focus));
        // Stop our study when our Hack stat has reached a certain amount.  We
        // stop when our Hack stat is at least 50 because that is the threshold
        // at which we are able to create the BruteSSH.exe program.
        const threshold = 50;
        const time = new Time();
        const t = time.minute();
        while (this.hacking_skill() < threshold) {
            await this.#ns.sleep(t);
        }
        assert(this.#ns.singularity.stopAction());
    }
}

/**
 * A class that holds information specific to purchased servers.
 */
export class PurchasedServer {
    /**
     * The Netscript API.
     */
    #ns;
    /**
     * Possible amount of RAM (GB) for a purchased server.
     */
    #valid_ram;

    /**
     * Create an object to represent a purchased server.
     *
     * @param ns The Netscript API.
     */
    constructor(ns) {
        this.#ns = ns;
        this.#valid_ram = [
            32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536,
            131072, 262144, 524288, 1048576
        ];
    }

    /**
     * The cost of buying a server with the given amount of RAM (GB).
     *
     * @param ram The amount of RAM (GB) to buy with this purchased server.
     *     RAM is assumed to be given as a power of 2.
     */
    cost(ram) {
        assert(this.is_valid_ram(ram));
        return this.#ns.getPurchasedServerCost(ram);
    }

    /**
     * Choose the default amount of RAM (in GB) for a new purchased server.
     * The chosen amount of RAM should allow the purchased server to run our
     * hacking script using at least 2 threads.
     */
    default_ram() {
        const player = new Player(this.#ns);
        const script_ram = this.#ns.getScriptRam(
            player.script(), player.home()
        );
        let i = 0;
        while (script_ram > this.#valid_ram[i]) {
            i++;
        }
        assert((i + 1) <= this.#valid_ram.length);
        return this.#valid_ram[i + 1];
    }

    /**
     * Whether the given amount of RAM (GB) is valid for a purchased server.
     *
     * @param ram The amount of RAM in GB.  Must be a power of 2.  Lowest is
     *     2GB.  Will round down to the nearest whole number.
     * @return true if the given amount of RAM is valid for a purchased server;
     *     false otherwise.
     */
    is_valid_ram(ram) {
        const n = Math.floor(ram);
        return this.#valid_ram.includes(n);
    }

    /**
     * Delete all purchased servers.  This would also kill all scripts running
     * on each purchased server.
     */
    kill_all() {
        const player = new Player(this.#ns);
        for (const server of player.pserv()) {
            // Kill all scripts running on a purchased server.
            this.#ns.killall(server);
            // Delete the purchased server.
            this.#ns.deleteServer(server);
        }
    }

    /**
     * The maximum number of purchased servers that can be bought.
     */
    limit() {
        return this.#ns.getPurchasedServerLimit();
    }

    /**
     * Purchase a new server with the given hostname and amount of RAM (GB).
     *
     * @param hostname The hostname of the new purchased server.  If a player
     *     already has a purchased server with the given hostname, append a
     *     numeric value to the hostname.
     * @param ram The amount of RAM (GB) of the purchased server.
     * @return The hostname of the newly purchased server.
     */
    purchase(hostname, ram) {
        return this.#ns.purchaseServer(hostname, ram);
    }

    /**
     * The possible amount of RAM a purchased server can have.  According to this page
     *
     * https://github.com/danielyxie/bitburner/blob/dev/markdown/bitburner.ns.getpurchasedservercost.md
     *
     * the highest amount of RAM for a purchased server is 1048576.
     */
    valid_ram() {
        return this.#valid_ram;
    }
}

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
            // By default, we reserve 50GB RAM on the player's home server.  If
            // the home server has less than this amount of RAM, we do not
            // reserve any RAM at all.
            const default_ram = 50;
            this.#ram_reserve = default_ram;
            // Reserve a higher amount of RAM, depending on the maximum RAM on
            // the home server.
            if (this.ram_max() >= 512) {
                this.#ram_reserve = 200;
            } else if (this.ram_max() >= 256) {
                this.#ram_reserve = 100;
            } else if (this.ram_max() < default_ram) {
                this.#ram_reserve = 0;
            }
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
     * Whether the server has enough RAM to run a given script, using at
     * least one thread.  We ignore any amount of RAM that has been reserved,
     * using all available RAM to help us make a decision.
     *
     * @param script We want to run this script on this server.
     * @return true if the given script can be run on this server;
     *     false otherwise.
     */
    can_run_script(script) {
        const CAN_RUN = true;
        const CANNOT_RUN = !CAN_RUN;
        const player = new Player(this.#ns);
        const script_ram = this.#ns.getScriptRam(script, player.home());
        const server_ram = this.available_ram();
        if (server_ram < 1) {
            return CANNOT_RUN;
        }
        const nthread = Math.floor(server_ram / script_ram);
        if (nthread < 1) {
            return CANNOT_RUN;
        }
        return CAN_RUN;
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
        return 0 == max_money;
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

/**
 * A class for handling time.
 */
export class Time {
    /**
     * Initialize a time object.
     */
    constructor() {
        // There isn't anything we need to do here.
    }

    /**
     * One millisecond.
     */
    millisecond() {
        return 1;
    }

    /**
     * The number of milliseconds in one minute.
     */
    minute() {
        return 60 * this.second();
    }

    /**
     * The number of milliseconds in one second.
     */
    second() {
        return 1000 * this.millisecond();
    }
}

/****************************************************************************/
/** Helper functions ********************************************************/
/****************************************************************************/

/**
 * A function for assertion.
 *
 * @param cond Assert that this condition is true.
 * @return Throw an assertion error if the given condition is false.
 */
export function assert(cond) {
    if (!cond) {
        throw new Error("Assertion failed.");
    }
}

/**
 * Determine the best server to hack.  The definition of "best" is subjective.
 * However, at the moment the "best" server is the one that requires the
 * highest hacking skill.
 *
 * @param ns The Netscript API.
 * @param candidate Choose from among the servers in this array.
 * @return The best server to hack.
 */
export function choose_best_server(ns, candidate) {
    assert(candidate.length > 0);
    let best = new Server(ns, candidate[0]);
    for (const s of candidate) {
        const serv = new Server(ns, s);
        if (best.hacking_skill() < serv.hacking_skill()) {
            best = serv;
        }
    }
    return best.hostname();
}

/**
 * Determine a bunch of servers in the game world to hack.  A target server is
 * chosen based on these criteria:
 *
 * (1) We meet the hacking skill requirement of the server.
 * (2) We can open all ports required to gain root access to the server.
 *
 * @param ns The Netscript API.
 * @param candidate Use this array to search for targets to hack.
 * @return An array of target servers.
 */
export function choose_targets(ns, candidate) {
    // Sanity check.
    assert(candidate.length > 0);
    // Find a bunch of target servers to hack.
    const player = new Player(ns);
    const nport = player.num_ports();
    const target = new Array();
    for (const s of candidate) {
        const server = new Server(ns, s);
        // Do we have the minimum hacking skill required?
        if (player.hacking_skill() < server.hacking_skill()) {
            continue;
        }
        // Can we open all required ports?
        if (server.num_ports_required() > nport) {
            continue;
        }
        // We have found a target server.
        target.push(s);
    }
    return target;
}

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
 * Count the total occurrence of 1 in a bit string.  This function does not
 * necessarily count all 1s in a bit string.  Some positions can be skipped.
 *
 * @param msg A bit string, representing a possibly incomplete encoded message.
 *     The message is encoded using Hamming code.  If the bit string is an
 *     incomplete encoded message, the location of each parity bit has been
 *     filled with rubbish.
 * @param p The position of a parity (or redundant) bit.  Its value is always
 *     a power of 2.  We start counting from this position in the bit string.
 *     The value of p also tells us how many consecutive positions to skip.
 *     In Hamming code, when checking parity we check p consecutive positions
 *     and skip p consecutive positions, giving us a window of 2p consecutive
 *     positions.  To reach the next window, we should skip 2p positions.
 * @return The number of 1s in the given bit string, while skipping over
 *     some positions.
 */
export function count_one(msg, p) {
    assert(msg.length > 0);
    assert(p > 0);
    let n1 = 0;
    let i = p;
    const skip = 2 * p;
    while (i < msg.length) {
        for (let j = i; j < i + p; j++) {
            if (1 == msg[j]) {
                n1++;
            }
        }
        i += skip;
    }
    return n1;
}

/**
 * Remove bankrupt servers from a given array of servers.  A server is bankrupt
 * if the maximum amount of money it can hold is zero.
 *
 * @param ns The Netscript API.
 * @param candidate An array of servers to filter.
 * @return An array of servers, each of which is not bankrupt.
 */
export function filter_bankrupt_servers(ns, candidate) {
    assert(candidate.length > 0);
    return candidate.filter(s => !is_bankrupt(ns, s));
}

/**
 * Exclude the purchased servers.
 *
 * @param ns The Netscript API.
 * @param server An array of server names.
 * @return An array of servers, but minus the purchased servers.
 */
export function filter_pserv(ns, server) {
    // All purchased servers.
    const player = new Player(ns);
    const pserv = new Set(player.pserv());
    // Filter out the purchased servers.
    const serv = Array.from(server);
    return serv.filter(s => !pserv.has(s));
}

/**
 * Whether a server is bankrupt.  A server is bankrupt if the maximum amount
 * of money it can hold is zero.
 *
 * @param ns The Netscript API.
 * @param s Test this server for bankruptcy.
 * @return true if the server is bankrupt; false otherwise.
 */
function is_bankrupt(ns, s) {
    const server = new Server(ns, s);
    return server.is_bankrupt();
}

/**
 * Log a failure when attempting to solve a coding contract.
 *
 * @param ns The Netscript API.
 * @param fname Write our log to this file.  Must be a text file with
 *     file extension ".txt".
 * @param cct The file name of the coding contract.
 * @param host The hostname of the server where the coding contract is located.
 * @param data The data used for solving the coding contract.
 */
export async function log_cct_failure(ns, fname, cct, host, data) {
    const append = "a";
    const newline = "\n";
    const date = new Date(Date.now());
    await ns.write(fname, date.toISOString(), append);
    await ns.write(fname, ", " + host + ", " + cct + newline, append);
    await ns.write(fname, data + newline, append);
}

/**
 * Format a matrix as a string.
 *
 * @param mat A matrix, i.e. an array of arrays.
 * @return The given matrix as a string.
 */
export function matrix_to_string(mat) {
    let string = "";
    const delim = ", ";
    for (let i = 0; i < mat.length; i++) {
        string += "[" + mat[i] + "]" + delim;
    }
    string = string.slice(0, string.length - delim.length);
    string = "[" + string + "]";
    return string;
}

/**
 * The maximum profit to be made when we are restricted to at most one
 * transaction.  The algorithm is similar to Kadane's algorithm.  However, we
 * must keep track of the minimum price as well as the maximum profit.
 * Essentially, we want to buy low and sell high, but we are restricted to one
 * transaction.  This means we are restricted by these rules:
 *
 * (1) Only one buy action.
 * (2) Only one sell action.
 * (3) Must first buy before we can sell.
 *
 * The idea is to determine two days i and j, where i < j and
 * price[i] < price[j], such that the difference price[j] - price[i] is
 * maximized.
 *
 * Refer to the following for more details:
 *
 * https://betterprogramming.pub/dynamic-programming-interview-questions-how-to-maximize-stock-profits-8ed4966c2206
 *
 * @param price An array where price[i] represents the price of a stock on
 *     day i.  All prices are for the same stock.
 * @return The maximum profit we can make, assuming at most one transaction.
 *       Return 0 if no profit can be made or the price array is empty.
 */
export function max_profit_kadane(price) {
    // Empty price array means zero profit.
    if (0 == price.length) {
        return 0;
    }
    let max_profit = 0;
    let min_price = price[0];
    // Must start on the second day.  On the first day, we have only one
    // price value so the minimum of one value is that value itself.
    for (let i = 1; i < price.length; i++) {
        // We need to keep track of the minimum price.  Let mp be the minimum
        // price so far.  If the price on day i is lower than mp, we set mp to
        // to the new minimum price.  Otherwise, we move to the price on the
        // next day.
        min_price = Math.min(min_price, price[i]);
        // Why do we need to keep track of the minimum price so far?  Let mp be
        // the minimum price up to and including day i.  Let price[i] be the
        // price on day i.  The profit pf is defined as the price on day i
        // minus the running minimium price:
        //
        // pf := price[i] - mp
        //
        // Here, the minimum price mp occurs during one of the days from the
        // first to the current day, i.e. mp is one of the price values
        //
        // price[0], price[1], ..., price[i]
        //
        // If we were to buy the stock on some day j (0 <= j <= i) at the
        // minimum price of mp, we can sell the stock on day i to make a profit
        // of pf.  The following can happen:
        //
        // (1) mp < price[i].  We make a profit pf.  Let mpf be the maximum
        //     profit we can make on day i.  We compare the profit pf on day i
        //     to the maximum profit mpf we can make on day i.  If mpf < pf,
        //     then we adjust our maximum profit so far to the value of pf.
        //     Otherwise, we keep the value of mpf as is.  The maximum profit
        //     we can make so far is the maximum of mpf and pf.
        // (2) mp = price[i].  We break even.  No loss, no profit.
        // (3) mp > price[i].  We make a loss because we are selling our stock
        //     at a price lower than when we bought the stock.  Our minimum
        //     price should be adjusted to the price on day i.  The minimum
        //     price so far is the minimum of mp and price[i].
        //
        const profit = price[i] - min_price;
        max_profit = Math.max(max_profit, profit);
    }
    return max_profit;
}

/**
 * Scan the network of servers in the game world.  Each server must be
 * reachable from our home server.
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
    const stack = new Array(root);
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
 * The positions (or indices) where the parity bits are placed in a bit string
 * that has been encoded using Hamming code.  These parity bits are also known
 * as redundant bits to distinguish them from the overall parity bit placed at
 * index 0 in the encoded bit string.
 *
 * @param p The number of parity bits.
 * @return An array, where each element represents the position or index of a
 *     parity bit.  These parity bits are also called redundant bits.
 *     This array does not include the position of the overall parity
 *     bit, which is assumed to be at index 0 in the encoded message.
 */
export function parity_position(p) {
    assert(p > 0);
    const array = new Array();
    for (let i = 0; i < p; i++) {
        array.push(2 ** i);
    }
    return array;
}

/**
 * Determine a shortest path from the source server to the target server
 * in the network of world servers.
 *
 * @param ns The Netscript API.
 * @param source Start our path from this server.
 * @param target We want to reach this server.
 * @return An array of shortest path from source to target.  An
 *     empty array if the target is not reachable from the source.
 */
export function shortest_path(ns, source, target) {
    // Represent the network of world servers as an undirected graph.
    const stack = new Array();
    const visit = new Set();
    stack.push(source);
    const directed = false;
    const graph = new Graph(directed);
    // Use breath-first search to navigate the network.
    while (stack.length > 0) {
        const s = stack.pop();
        // Have we visited the server s yet?
        if (visit.has(s)) {
            continue;
        }
        visit.add(s);
        // All neighbours of s, excluding the purchased servers.
        const neighbour = [...filter_pserv(ns, ns.scan(s))];
        stack.push(...neighbour);
        for (const t of neighbour) {
            // Have we visited the server t yet?
            if (visit.has(t)) {
                continue;
            }
            assert(graph.add_edge(s, t));
        }
    }
    // A shortest path from source to target.
    return graph.shortest_path(source, target);
}

/**
 * The maximimum profit that can be made when we are restricted to at most two
 * transactions.  Transactions must occur one after the other.  Suppose we buy
 * one share of a stock on day i and sell the share on day j, where i < j.  We
 * cannot buy another share of the same stock on any day between i and j.
 * However, we are allowed to buy another share of the stock from day j+1
 * onward.
 *
 * The above description hints at a simple solution.  We partition the price
 * array into two non-overlapping parts:
 *
 * (1) The left part starts from day 0 and ends at day k, inclusive.  Run
 *     Kadane's algorithm on the left subarray to get mpl as our maximum profit
 *     for the left subarray.
 * (2) The right part starts from day k+1 and ends at the last day in the price
 *     array.  Run Kadane's algorithm on the right subarray to get mpr as our
 *     maximum profit for the right subarray.
 *
 * The maximum profit is mpl + mpr.  This maximum profit is for one particular
 * partition of the price array.  There are many other partitions, one for each
 * value of k.  Calculate the maximum profit for each partition.  The true
 * maximum profit is the maximum of the results of all partitions.
 *
 * @param price An array of prices, where price[i] is the price of one share of
 *     a stock on day i.  All prices relate to the same stock.
 * @return The maximum profit to be made, assumming we can perform at most
 *     two transactions.  Return 0 if no profit can be made.
 */
export function stock_traderIII(price) {
    assert(price.length > 0);
    // Obtain all possible partitions of the price array.  Each partition
    // divides the array into two parts: the left subarray and the right
    // subarray.
    let max_profit = 0;
    for (let k = 0; k < price.length; k++) {
        // The left and right subarrays in the partition.
        const left = price.slice(0, k + 1);
        const right = price.slice(k + 1, price.length);
        // The maximum profit of each subarray in the partition.
        const mpl = max_profit_kadane(left);
        const mpr = max_profit_kadane(right);
        // The running maximum profit.
        max_profit = Math.max(max_profit, mpl + mpr);
    }
    return max_profit;
}
