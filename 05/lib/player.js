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
