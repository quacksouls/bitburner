// A library of classes and functions that can be imported into other scripts.

/****************************************************************************/
/** Class *******************************************************************/
/****************************************************************************/

/**
 * A class that holds all information about a player.
 */
export class Player {
	/**
	 * The name of the home server of this player.
	 */
	#home;
	/**
	 * The Netscript API.
	 */
	#ns;

	/**
	 * Initialize a Player object.
	 * 
	 * @param ns The Netscript API.
	 */
	constructor(ns) {
		this.#home = "home";
		this.#ns = ns;
	}

	/**
	 * The current Hack stat of the player.
	 */
	hacking_skill() {
		return this.#ns.getHackingLevel();
	}

	/**
	 * The home server of the player.
	 */
	home() {
		return this.#home;
	}

	/**
	 * The amount of money available to this player.
	 */
	money_available() {
		return this.#ns.getServerMoneyAvailable(this.home());
	}

	/**
	 * Determine the number of ports a player can currently open on servers in the game world.  This
	 * depends on whether the player has the necessary hacking programs on the home server.
	 */
	num_ports() {
		// These are programs that can be created after satisfying certain conditions.
		let program = ["BruteSSH.exe", "FTPCrack.exe", "HTTPWorm.exe", "relaySMTP.exe", "SQLInject.exe"];
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
	 * Create an object to represent a purchased server.
	 * 
	 * @param ns The Netscript API.
	 */
	constructor(ns) {
		this.#ns = ns;
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
	 * Whether the given amount of RAM (GB) is valid for a purchased server.
	 *
	 * @param ram The amount of RAM in GB.  Must be a power of 2.  Lowest is 2GB.
	 *     Will round down to the nearest whole number.
	 * @return true if the given amount of RAM is valid for a purchased server;
	 *     false otherwise.
	 */
	is_valid_ram(ram) {
		const n = Math.floor(ram);
		const valid_ram = new Set([2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384]);
		return valid_ram.has(n);
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
	 * @param hostname The hostname of the new purchased server.  If a player already
	 *     has a purchased server with the given hostname, append a numeric value
	 *     to the hostname.
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
	// The private properties below are adapated from the API documentation at
	// https://github.com/danielyxie/bitburner/blob/dev/markdown/bitburner.server.md

	/**
	 * Whether a player has installed a backdoor on this server.
	 */
	#backdoor;
	/**
	 * The number of CPU cores on this server.  Maximum is 8.
	 */
	#cores;
	/**
	 * Whether the FTP port is open.
	 */
	#ftp_port_open;
	/**
	 * The amount of Hack stat required to hack this server.
	 */
	#hacking_skill;
	/**
	 * The hostname of this server.
	 */
	#hostname;
	/**
	 * Whether the HTTP port is open.
	 */
	#http_port_open;
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
	 * Whether this is a purchased server.
	 */
	#pserv;
	/**
	 * The maximum amount of RAM (in GB) on this server.
	 */
	#ram_max;
	/**
	 * The minimum security level to which this server can be weaked.
	 */
	#security_min;
	/**
	 * Whether the SMTP port is open.
	 */
	#smtp_port_open;
	/**
	 * Whether the SQL port is open.
	 */
	#sql_port_open;
	/**
	 * Whether the SSH port is open.
	 */
	#ssh_port_open;

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
		this.#backdoor = server.backdoorInstalled;
		this.#cores = server.cpuCores;
		this.#ftp_port_open = server.ftpPortOpen;
		this.#hacking_skill = server.requiredHackingSkill;
		this.#hostname = server.hostname;
		this.#http_port_open = server.httpPortOpen;
		this.#money_max = server.moneyMax;
		this.#n_ports_required = server.numOpenPortsRequired;
		this.#ns = ns;
		this.#pserv = server.purchasedByPlayer;
		this.#ram_max = server.maxRam;
		this.#security_min = server.minDifficulty;
		this.#smtp_port_open = server.smtpPortOpen;
		this.#sql_port_open = server.sqlPortOpen;
		this.#ssh_port_open = server.sshPortOpen;
	}

	/**
	 * How much RAM (in GB) is available on this server.
	 */
	available_ram() {
		const ram = this.#ram_max - this.#ns.getServerUsedRam(this.hostname());
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
		if (this.#ns.hasRootAccess(this.hostname())) {
			return true;
		}
		return false;
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
		const max_money = Math.floor(this.#money_max);
		if (0 == max_money) {
			return true;
		}
		return false;
	}

	/**
	 * Whether this server is currently running a script.
	 *
	 * @param script Check to see if this script is currently running on the server.
	 * @return true if the given script is running on the server; false otherwise.
	 */
	is_running_script(script) {
		if (this.#ns.scriptRunning(script, this.hostname())) {
			return true;
		}
		return false;
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
	  *
	  * @param script We want to run this script on the server.  The script must
	  *     exist on our home server.
	  * @return The number of threads that can be used to run the given script on
	  *     this server.
	  */
	num_threads(script) {
		const player = new Player(this.#ns);
		const script_ram = this.#ns.getScriptRam(script, player.home());
		const server_ram = this.available_ram();
		const nthread = Math.floor(server_ram / script_ram);
		return nthread;
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
 * Determine the best server to hack.  The definition of "best" is subjective.  However, at the
 * moment the "best" server is the one that requires the highest hacking skill.
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
 * Determine a bunch of servers in the game world to hack.  A target server is chosen based on
 * these criteria:
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
 * Copy our hack and library scripts over to a server and run the hack script on
 * the server.
 * 
 * @param ns The Netscript API.
 * @param server Copy our hack and library scripts to this server.  Run our hack
 *     script on this server.
 * @param target We run our hack script against this target server.
 * @return true if our hack script is running on the server using at least one thread;
 *     false otherwise, e.g. no free RAM on the server or we don't have root access on
 *     either servers.
 */
export async function copy_and_run(ns, server, target) {
	const SUCCESS = true;      // Succeed at copying and/or running the hacking script.
	const FAILURE = !SUCCESS;  // Fail to copy and/or run the hacking script.
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
	const script = "hack.js";
	const library = "libbnr.js";
	if (!ns.fileExists(script, player.home())) {
		await ns.tprint("File " + script + " not found on server " + player.home());
		return FAILURE;
	}
	if (!ns.fileExists(library, player.home())) {
		await ns.tprint("File " + library + " not found on server " + player.home());
		return FAILURE;
	}
	// No free RAM on server to run our hack script.
	const nthread = serv.num_threads(script);
	if (nthread < 1) {
		await ns.tprint("No free RAM on server: " + server);
		return FAILURE;
	}

	// Copy our scripts over to a server.  Use the server to hack a target.
	await ns.scp(script, player.home(), server);
	await ns.scp(library, player.home(), server);
	await ns.exec(script, server, nthread, target);
	return SUCCESS;
}

/**
 * Remove bankrupt servers from a given array of servers.  A server is bankrupt if
 * the maximum amount of money it can hold is zero.
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
 * Whether a server is bankrupt.  A server is bankrupt if the maximum amount of money
 * it can hold is zero.
 * 
 * @param ns The Netscript API.
 * @param s Test this server for bankruptcy.
 * @return true if the server is bankrupt; false otherwise.
 */
function is_bankrupt(ns, s) {
	const server = new Server(ns, s);
	if (server.is_bankrupt()) {
		return true;
	}
	return false;
}

/**
 * Scan the network of servers in the game world.  Each server must be reachable
 * from our home server.
 * 
 * @param ns The Netscript API.
 * @return An array of servers that can be reached from home.
 */
export function network(ns) {
	// We scan the world network from a node, which is assumed to be our home server.
	// We refer to our home server as the root of the tree.
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
	// Remove the root node from our array.  We want all servers that are connected
	// either directly or indirectly to the root node.
	return server.filter(s => root != s);
}
