/**
 * Copyright (C) 2022--2023 Duck McSouls
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

import { MyArray } from "/quack/lib/array.js";
import { empty_string } from "/quack/lib/constant/misc.js";
import { script } from "/quack/lib/constant/script.js";
import { home } from "/quack/lib/constant/server.js";
import { darkweb } from "/quack/lib/constant/tor.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

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
     * These are usually network programs.
     */
    #program;

    /**
     * The hack script of the player.  Assumed to be located on the player's
     * home server.  Usually the early hacking template.
     */
    #script;

    /**
     * Initialize a Player object.
     *
     * @param {NS} ns The Netscript API.
     */
    constructor(ns) {
        this.#home = home;
        this.#ns = ns;
        this.#port_opener = Array.from(darkweb.program.popen);
        this.#program = ["DeepscanV1.exe", "DeepscanV2.exe", "NUKE.exe"];
        this.#script = script.HACK;
    }

    /**
     * The player's Agility level.
     *
     * @returns {number} The player's Agility stat.
     */
    agility() {
        return this.#ns.getPlayer().skills.agility;
    }

    /**
     * The BitNode in which the player currently inhabits.
     *
     * @returns {number} The current BitNode number.
     */
    bitnode() {
        return this.#ns.getResetInfo().currentNode;
    }

    /**
     * The player's current Charisma level.
     *
     * @returns {number} The player's Charisma stat.
     */
    charisma() {
        return this.#ns.getPlayer().skills.charisma;
    }

    /**
     * The current city where the player is located.
     *
     * @returns {string} The city in which the player is currently located.
     */
    city() {
        return this.#ns.getPlayer().city;
    }

    /**
     * The player's Defense level.
     *
     * @returns {number} The player's Defense stat.
     */
    defense() {
        return this.#ns.getPlayer().skills.defense;
    }

    /**
     * The player's Dexterity level.
     *
     * @returns {number} The player's Dexterity stat.
     */
    dexterity() {
        return this.#ns.getPlayer().skills.dexterity;
    }

    /**
     * An array of all factions to which the player is a member.
     *
     * @returns {array<string>} All factions to which the player belongs.
     */
    faction() {
        return this.#ns.getPlayer().factions;
    }

    /**
     * The current Hack stat of the player.
     *
     * @returns {number} The player's Hack stat.
     */
    hacking_skill() {
        return this.#ns.getHackingLevel();
    }

    /**
     * Whether the player has all programs to open all ports on any world
     * server.
     *
     * @returns {boolean} True if the player can open all ports on another
     *     server; false otherwise.
     */
    has_all_port_openers() {
        return this.num_ports() === this.#port_opener.length;
    }

    /**
     * Whether the player has all programs to visit all world servers and open
     * all ports on any world server.
     *
     * @returns {boolean} True if the player has all network programs and port
     *     openers; false otherwise.
     */
    has_all_programs() {
        const prog = Array.from(this.#port_opener).concat(this.#program);
        assert(!MyArray.is_empty(prog));
        for (const p of prog) {
            if (!this.has_program(p)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Whether we have a given program.
     *
     * @param {string} p A program we want to check.
     * @returns {boolean} True if we have the given program; false otherwise.
     */
    has_program(p) {
        return this.#ns.fileExists(p, this.home());
    }

    /**
     * Whether we have purchased the TOR router.
     *
     * @returns {boolean} True if we have the TOR router; false otherwise.
     */
    has_tor() {
        return this.#ns.hasTorRouter();
    }

    /**
     * The home server of the player.
     *
     * @returns {string} The player's home server.
     */
    home() {
        return this.#home;
    }

    /**
     * Whether the player is working for a company.
     *
     * @param {string} company The name of a company.
     * @returns {boolean} True if the player is working for the given company;
     *     false otherwise.
     */
    is_employer(company) {
        assert(!is_empty_string(company));
        const employer = new Set(Object.keys(this.#ns.getPlayer().jobs));
        return employer.has(company);
    }

    /**
     * Whether the player is a member of a faction.
     *
     * @param {string} fac The name of a faction.
     * @returns {boolean} True if the player belongs to the given faction;
     *     false otherwise.
     */
    is_member(fac) {
        assert(!is_empty_string(fac));
        return this.#ns.getPlayer().factions.includes(fac);
    }

    /**
     * The position the player holds at a given company.
     *
     * @param {string} company The name of a company.
     * @returns {string} The position the player currently holds at the given
     *     company.  An empty string if the player does not hold any position at
     *     the given company.
     */
    job(company) {
        assert(!is_empty_string(company));
        const stat = this.#ns.getPlayer();
        if (stat.jobs[company] === undefined) {
            return empty_string;
        }
        return stat.jobs[company];
    }

    /**
     * The player's karma.  This is an Easter egg, buried in the source code
     * of the game.  Refer to this file:
     *
     * https://github.com/danielyxie/bitburner/blob/dev/src/NetscriptFunctions/Extra.ts
     *
     * @returns {number} The player's karma stat.
     */
    karma() {
        return this.#ns.heart.break();
    }

    /**
     * The amount of money available to this player.
     *
     * @returns {number} The player's money.
     */
    money() {
        return this.#ns.getServerMoneyAvailable(this.home());
    }

    /**
     * The number of people the player has killed.
     *
     * @returns {number} How many people the player has killed.
     */
    nkill() {
        return this.#ns.getPlayer().numPeopleKilled;
    }

    /**
     * Determine the number of ports a player can currently open on servers in
     * the game world.  This depends on whether the player has the necessary
     * hacking programs on the home server.
     *
     * @returns {number} How many ports the player can open on any world server.
     */
    num_ports() {
        // These are programs that can be created after satisfying certain
        // conditions.
        let prog = Array.from(this.#port_opener);

        // Determine the number of ports we can open on other servers.
        prog = prog.filter((p) => this.#ns.fileExists(p, this.home()));
        return prog.length;
    }

    /**
     * All purchased servers of this player.
     *
     * @returns {array<string>} All purchased servers the player owns.
     */
    pserv() {
        return this.#ns.getPurchasedServers();
    }

    /**
     * The name of the hacking script of the player.
     *
     * @returns {string} The player's hacking script.
     */
    script() {
        return this.#script;
    }

    /**
     * The player's Strength level.
     *
     * @returns {number} The player's Strength stat.
     */
    strength() {
        return this.#ns.getPlayer().skills.strength;
    }
}
