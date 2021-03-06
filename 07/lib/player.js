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

import { home, program, script } from "/lib/constant.js";
import { assert } from "/lib/util.js";

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
        this.#home = home;
        this.#ns = ns;
        this.#port_opener = Array.from(program);
        this.#program = ["DeepscanV1.exe", "DeepscanV2.exe", "NUKE.exe"];
        this.#script = script;
    }

    /**
     * The player's agility level.
     */
    agility() {
        const stat = this.#ns.getPlayer();
        return stat.agility;
    }

    /**
     * The player's current Charisma level.
     */
    charisma() {
        const stat = this.#ns.getPlayer();
        return stat.charisma;
    }

    /**
     * The current city where the player is located.
     */
    city() {
        const stat = this.#ns.getPlayer();
        return stat.city;
    }

    /**
     * The player's defense level.
     */
    defense() {
        const stat = this.#ns.getPlayer();
        return stat.defense;
    }

    /**
     * The player's dexterity level.
     */
    dexterity() {
        const stat = this.#ns.getPlayer();
        return stat.dexterity;
    }

    /**
     * An array of all factions to which the player is a member.
     */
    faction() {
        const stat = this.#ns.getPlayer();
        return stat.factions;
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
        return nport == limit;
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
     * The position the player holds at a given company.
     *
     * @param company The name of a company.
     * @return The position the player currently holds at the given company.
     *     Return an empty string if the player does not hold any position at
     *     the given company.
     */
    job(company) {
        const stat = this.#ns.getCharacterInformation();
        const i = stat.jobs.findIndex(c => c == company);
        if (i < 0) {
            return "";
        }
        return stat.jobTitles[i];
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
     * The amount of money available to this player.
     */
    money() {
        return this.#ns.getServerMoneyAvailable(this.home());
    }

    /**
     * The number of people the player has killed.
     */
    nkill() {
        const stat = this.#ns.getPlayer();
        return stat.numPeopleKilled;
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
     * The player's strength level.
     */
    strength() {
        const stat = this.#ns.getPlayer();
        return stat.strength;
    }
}
