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
 * A directed graph.  There can be at most one directed edge from vertex u to
 * vertex v.
 */
export class DirectedGraph {
    /**
     * The adjacency map.  Each key is a vertex or node of the directed graph.
     * Each value is an array of vertices to which the key is adjacent.  For
     * example, given a node i, adj[i] is an array such that each node in the
     * array is a neighbour of i.
     */
    #adj;

    /**
     * A directed graph object.
     */
    constructor() {
        this.#adj = new Map();
    }

    /**
     * Add an edge to this directed graph.
     *
     * @param u, v A directed edge from vertex u to vertex v.
     * @return true if the edge was successfully added to the graph;
     *     false otherwise or the edge is already in the graph.
     */
    add_edge(u, v) {
        const SUCCESS = true;
        const FAILURE = !SUCCESS;
        // Already have the directed edge.
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
        // Now insert the directed edge (u, v).
        const neighbour = this.#adj.get(u);
        neighbour.push(v);
        this.#adj.set(u, neighbour);
        return SUCCESS;
    }

    /**
     * Add a vertex to this directed graph.
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
     * All edges of this directed graph, as an array of arrays.
     */
    edges() {
        const edge = new Array();
        for (const u of this.nodes()) {
            const neighbour = this.#adj.get(u);
            for (const v of neighbour) {
                edge.push([u, v]);
            }
        }
        return edge;
    }

    /**
     * Use Dijkstra's algorithm to determine the shortest directed path from a
     * given node to all nodes in a directed graph.
     *
     * @param source The source vertex.  All shortest directed paths must start
     *     from this node.
     * @return These two data structures:
     *     (1) A map of the shortest number of nodes in a directed path to a
     *         target node.  Each path starts from the given source node.  For
     *         example, the map element A[i] means the shortest number of nodes
     *         in the path to node i.
     *     (2) A map of the node preceeding a given node, in a shortest
     *         directed path.  For example, the map element M[i] gives a node
     *         that directly connects to node i, where M[i] and i are nodes in
     *         a shortest directed path.
     */
    #dijkstra(source) {
        // A map of the shortest number of nodes in a directed path to a
        // target node.
        let dist = new Map();
        // A map of the node preceeding a given node.
        let prev = new Map();
        // A queue of nodes to visit.
        let queue = new Array();
        // Initialization.
        for (const v of this.#adj.keys()) {
            dist.set(v, Infinity);
            prev.set(v, undefined);
            queue.push(v);
        }
        // The distance from the source node to itself is zero.
        dist.set(source, 0);
        prev.set(source, undefined);
        queue.push(source);

        // Search for shortest directed paths from the source node to other
        // nodes.  This is an unweighted graph so the weight between a node
        // and any of its neighbours is 1.
        const weight = 1;
        while (queue.length > 0) {
            const u = this.#minimumq(queue, dist);
            queue = queue.filter(s => s != u);
            // Consider the directed neighbours of u.  Each neighbour must
            // still be in the queue.
            let neighbour = Array.from(this.#adj.get(u));
            neighbour = neighbour.filter(s => queue.includes(s));
            for (const v of neighbour) {
                const alt = dist.get(u) + weight;
                // We have found a shorter directed path to v.
                if (alt < dist.get(v)) {
                    dist.set(v, alt);
                    prev.set(v, u);
                }
            }
        }
        return [dist, prev];
    }

    /**
     * Whether the graph has the given directed edge.
     *
     * @param u, v Check the graph for this directed edge.
     * @return true if the graph has the directed edge (u, v);
     *     false otherwise.
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
        const neighbour = this.#adj.get(u);
        return neighbour.includes(v);
    }

    /**
     * Whether the graph has the given vertex.
     *
     * @param v Check for the presence or absence of this vertex.
     * @return true if the graph already has the vertex;
     *     false otherwise.
     */
    has_node(v) {
        return this.#adj.has(v);
    }

    /**
     * Choose the node i with minimum dist[i].  This is a simple implementation.
     * For better performance, the queue should be implemented as a minimum
     * priority queue.
     *
     * @param queue An array of nodes to visit.
     * @param dist A map of the shortest number of nodes in a directed path to
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
     * All nodes of this directed graph, as an array.
     */
    nodes() {
        return [...this.#adj.keys()];
    }

    /**
     * Determine the shortest directed path from the source to the target.
     *
     * @param source Start our directed path from this node.
     * @param target We want to reach this node.
     * @return An array of shortest directed path from source to target.  An
     *     empty array if the target is not reachable from the source.
     */
    shortest_path(source, target) {
        assert(this.has_node(source));
        assert(this.has_node(target));
        const [dist, prev] = this.#dijkstra(source);
        // Ensure the target is reachable from the source node.
        if (!dist.has(target)) {
            return [];
        }
        let stack = new Array();
        let u = target;
        // Start from the target and work backward to find the shortest
        // directed path from the source to the target.
        while (prev.get(u) != undefined) {
            stack.push(u);
            u = prev.get(u);
        }
        // Target is not reachable from the source node.
        if (0 == stack.length) {
            return [];
        }

        assert(stack.length > 0);
        stack.push(source);
        stack.reverse();
        return stack;
    }
}

/**
 * An undirected graph.  There can be at most one edge from vertex u to
 * vertex v.
 */
export class UndirectedGraph {
    /**
     * The adjacency map.  Each key is a vertex or node of the undirected graph.
     * Each value is an array of vertices to which the key is adjacent.  For
     * example, given a node i, adj[i] is an array such that each node in the
     * array is a neighbour of i.
     */
    #adj;

    /**
     * An undirected graph object.
     */
    constructor() {
        this.#adj = new Map();
    }

    /**
     * Add an edge to this undirected graph.
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
        // Now insert the undirected edge (u, v).
        const u_neighbour = this.#adj.get(u);
        const v_neighbour = this.#adj.get(v);
        u_neighbour.push(v);
        v_neighbour.push(u);
        this.#adj.set(u, u_neighbour);
        this.#adj.set(v, v_neighbour);
        return SUCCESS;
    }

    /**
     * Add a vertex to this undirected graph.
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
     * All edges of this undirected graph, as an array of arrays.
     */
    edges() {
        const edge = new Set();
        for (const u of this.nodes()) {
            const neighbour = this.#adj.get(u);
            for (const v of neighbour) {
                // Assume nodes to be comparable, i.e. we can compare
                // the node values.  If each node is an integer, the
                // nodes are comparable because there is an ordering
                // of numbers.  If each node is a string of alphabetic
                // characters, the nodes are also comparable because we
                // can use lexicographic ordering.
                if (u < v) {
                    edge.add([u, v]);
                } else {
                    edge.add([v, u]);
                }
            }
        }
        return [...edge];
    }

    /**
     * Use Dijkstra's algorithm to determine a shortest undirected path from a
     * given node to all nodes in an undirected graph.
     *
     * @param source The source vertex.  All shortest undirected paths must
     *     start from this node.
     * @return These two data structures:
     *     (1) A map of the shortest number of nodes in an undirected path to a
     *         target node.  Each path starts from the given source node.  For
     *         example, the map element A[i] means the shortest number of nodes
     *         in the path to node i.
     *     (2) A map of the node preceeding a given node, in a shortest
     *         undirected path.  For example, the map element M[i] gives a node
     *         that directly connects to node i, where M[i] and i are nodes in
     *         a shortest undirected path.
     */
    #dijkstra(source) {
        // A map of the shortest number of nodes in an undirected path to a
        // target node.
        let dist = new Map();
        // A map of the node preceeding a given node.
        let prev = new Map();
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

        // Search for shortest undirected paths from the source node to other
        // nodes.  This is an unweighted graph so the weight between a node
        // and any of its neighbours is 1.
        const weight = 1;
        while (queue.length > 0) {
            const u = this.#minimumq(queue, dist);
            queue = queue.filter(s => s != u);
            // Consider the undirected neighbours of u.  Each neighbour must
            // still be in the queue.
            let neighbour = Array.from(this.#adj.get(u));
            neighbour = neighbour.filter(s => queue.includes(s));
            for (const v of neighbour) {
                const alt = dist.get(u) + weight;
                // We have found a shorter undirected path to v.
                if (alt < dist.get(v)) {
                    dist.set(v, alt);
                    prev.set(v, u);
                }
            }
        }
        return [dist, prev];
    }

    /**
     * Whether the graph has the given undirected edge.
     *
     * @param u, v Check the graph for this undirected edge.
     * @return true if the graph has the undirected edge (u, v);
     *     false otherwise.
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
        const u_neighbour = this.#adj.get(u);
        const v_neighbour = this.#adj.get(v);
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
     * @return true if the graph already has the vertex;
     *     false otherwise.
     */
    has_node(v) {
        return this.#adj.has(v);
    }

    /**
     * Choose the node i with minimum dist[i].  This is a simple implementation.
     * For better performance, the queue should be implemented as a minimum
     * priority queue.
     *
     * @param queue An array of nodes to visit.
     * @param dist A map of the shortest number of nodes in an undirected path
     *     to a target node.
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
     * All nodes of this undirected graph, as an array.
     */
    nodes() {
        return [...this.#adj.keys()];
    }

    /**
     * Determine a shortest undirected path from the source to the target.
     *
     * @param source Start our undirected path from this node.
     * @param target We want to reach this node.
     * @return An array representing a shortest undirected path from source
     *     to target.  An empty array if the target is not reachable from
     *     the source.
     */
    shortest_path(source, target) {
        assert(this.has_node(source));
        assert(this.has_node(target));
        const [dist, prev] = this.#dijkstra(source);
        // Ensure the target is reachable from the source node.
        if (!dist.has(target)) {
            return [];
        }
        let stack = new Array();
        let u = target;
        // Start from the target and work backward to find a shortest
        // undirected path from the source to the target.
        while (prev.get(u) != undefined) {
            stack.push(u);
            u = prev.get(u);
        }
        // Target is not reachable from the source node.
        if (0 == stack.length) {
            return [];
        }

        assert(stack.length > 0);
        stack.push(source);
        stack.reverse();
        return stack;
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
            "SQLInject.exe"];
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
            if (!this.#ns.fileExists(p, this.home())) {
                return false;
            }
        }
        return true;
    }

    /**
     * The home server of the player.
     */
    home() {
        return this.#home;
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
    money_available() {
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
            2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
            32768, 65536, 131072, 262144];
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
        const script_ram = this.#ns.getScriptRam(player.script(), player.home());
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
 * Whether the given array has only non-negative numbers.
 *
 * @param array An array of integers.  Cannot be empty array.
 * @return true if the given array has only non-negative integers;
 *     false otherwise.
 */
export function all_nonnegative(array) {
    assert(array.length > 0);
    for (const a of array) {
        if (a < 0) {
            return false;
        }
    }
    return true;
}

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
 *     (1) We meet the hacking skill requirement of the server.
 *     (2) We can open all ports required to gain root access to the server.
 *
 * @param ns The Netscript API.
 * @param candidate Use this array to search for targets to hack.
 * @return An array of target servers.
 */
export function choose_targets(ns, candidate) {
    // Sanity check.
    assert(candidate.length > 0);

    const player = new Player(ns);
    const nport = player.num_ports();
    let target = new Array();
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
