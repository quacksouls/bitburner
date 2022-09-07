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

// A bunch of constant values.  These can be numeric constants or string
// constants.

/**
 * All cities in the game world.
 */
export function all_cities() {
    const city = [
        "Aevum",
        "Chongqing",
        "Ishima",
        "New Tokyo",
        "Sector-12",
        "Volhaven"
    ];
    return city;
}

/**
 * All available crimes.
 */
export function all_crimes() {
    const crime = [
        "assassinate",
        "bond forgery",
        "deal drugs",
        "grand theft auto",
        "heist",
        "homicide",
        "kidnap and ransom",
        "larceny",
        "mug someone",
        "rob store",
        "shoplift",
        "traffick illegal arms"
    ];
    return crime;
}

/**
 * An array of all faction names.  The faction names are listed in a specific
 * order, usually along the following line of reasoning.
 *
 * (1) Sector-12 should be the first faction we must join.  The reason is
 *     simple.  This faction has the CashRoot Starter Kit Augmentation that
 *     grants us $1m and the BruteSSH.exe program after a soft reset.
 * (2) Netburners, CyberSec, and Tian Di Hui should be the next group of
 *     factions to join.  These factions have Augmentations that raise various
 *     hack-related stats.
 * (3) BitRunners has an Augmentation that allows us to start with the
 *     FTPCrack.exe and relaySMTP.exe programs after a soft reset.
 * (4) Aevum has the PCMatrix Augmentation that allows us to start with
 *     DeepscanV1.exe and AutoLink.exe after a soft reset.
 * (5) Chongqing, Ishima, and New Tokyo are not enemies with each other.  We
 *     can join all three factions at the same time, work toward purchasing all
 *     of their Augmentations, and install all Augmentations from all three
 *     factions at the same time.  Doing so can save us a lot of time as we do
 *     not need to go through a soft reset after purchasing all Augmentations
 *     from one faction.
 * (6) Volhaven should be the last city faction to join.
 * (7) NiteSec and The Black Hand are the remaining two hacking groups to join.
 *     They have Augmentations to boost various hack-related stats.
 * (8) We can join the megacorporation factions in any order we want.  These
 *     factions have various Augmentations that boost a number of
 *     social-related stats, i.e. reputation from factions and companies.
 * (9) Criminal organizations have Augmentations to boost various combat stats
 *     as well as social-related stats.
 * (10) The endgame factions should be the last to join.  We can join
 *     Illuminati or The Covenant in any order we want.  However, Daedalus
 *     should be the very last faction that we join.
 */
export function all_factions() {
    const faction = [
        // Early game factions, city factions, and hacking groups.
        "Sector-12",
        "Netburners",
        "CyberSec",
        "Tian Di Hui",
        "BitRunners",
        "Aevum",
        "Chongqing",
        "Ishima",
        "New Tokyo",
        "Volhaven",
        "NiteSec",
        "The Black Hand",
        // Megacorporations.
        "Bachman & Associates",
        "Blade Industries",
        "Clarke Incorporated",
        "ECorp",
        "Four Sigma",
        "Fulcrum Secret Technologies",
        "KuaiGong International",
        "MegaCorp",
        "NWO",
        "OmniTek Incorporated",
        // Criminal organizations.  The Syndicate has the Augmentation
        // BrachiBlades, which is a pre-requisite of an Augmentation from
        // Speakers for the Dead.
        "Silhouette",
        "Slum Snakes",
        "The Syndicate",
        "Speakers for the Dead",
        "Tetrads",
        "The Dark Army",
        // Endgame factions.
        "Illuminati",
        "The Covenant",
        "Daedalus"
    ];
    return faction;
}

/**
 * All programs that can be created.  These programs can also be purchased via
 * the dark web.
 */
export function all_programs() {
    // A map where the key/value pair is as follows:
    //
    // key := The name of a program.
    // value := The minimum Hack stat at which we are able to create the
    //     program.
    const program = new Map();
    program.set("BruteSSH.exe", 50);
    program.set("FTPCrack.exe", 100);
    program.set("HTTPWorm.exe", 500);
    program.set("relaySMTP.exe", 250);
    program.set("SQLInject.exe", 750);
    program.set("DeepscanV1.exe", 75);
    program.set("DeepscanV2.exe", 400);
    program.set("ServerProfiler.exe", 75);
    program.set("AutoLink.exe", 25);
    program.set("Formulas.exe", 1000);
    return program;
}

/**
 * The maximum number of Augmentations to purchase from a faction.  This number
 * does not include the NeuroFlux Governor.  We limit the number of
 * Augmentations to purchase to help speed up the process of buying all
 * Augmentations from a faction.  We purchase this number of Augmentations from
 * a faction and install them.  If the faction has any more Augmentations
 * (besides the NeuroFlux Governor), we purchase those after the installation.
 * Some Augmentations require a huge amount of faction reputation.  It can take
 * a very long time to accumulate enough reputation points, especially if an
 * Augmentation requires at least one million reputation points.  By purchasing
 * a given number of Augmentations and installing them, we gain some favour
 * with the faction.  In case our favour points are high enough, we would be
 * able to donate to the faction in exchange for reputation points.  This
 * should help to shorten the amount of time required to reach a certain amount
 * of reputation points.
 */
export const aug_purchase_limit = 5;

/**
 * Use ANSI escape codes to add colour.  Refer to this page for more details:
 *
 * https://www.lihaoyi.com/post/BuildyourownCommandLinewithANSIescapecodes.html
 */
export const colour = {
    "DARK_GREEN": "\u001b[38;5;22m",
    "GREEN":      "\u001b[32m",
    "RED":        "\u001b[31m",
    "RESET":      "\u001b[0m"
};

/**
 * The minimum amount of RAM for a high-end server.
 */
export const high_ram = 512;

/**
 * The home server of the player.
 */
export const home = "home";

/**
 * The amount of RAM for a mid-sized home server.
 */
export const mid_ram = 128;

/**
 * These programs are port openers.  Each program can be used to open a
 * specific port on a server.
 */
export const program = [
    "BruteSSH.exe",
    "FTPCrack.exe",
    "HTTPWorm.exe",
    "relaySMTP.exe",
    "SQLInject.exe"
];

/**
 * The prefix for the name of each purchased server.  The very first purchased
 * server is always named "pserv".  Any subsequent purchased server is named as
 * pserv-n, where n is a non-negative integer.
 */
export const pserv_prefix = "pserv";

/**
 * The hack script.  This script is used for hacking a server.
 */
export const script = "hack.js";

/**
 * A file name.  If the trade bot detects the existence of this file on the
 * home server, it would stop purchasing shares of stocks.  The behaviour is
 * subject to certain conditions.  See the trade-bot.js script for more details.
 */
export const trade_bot_stop = "trade_bot_stop_buy.txt";

/**
 * These are utility programs.  They are useful when we need to manually
 * traverse the network of world servers.
 */
export const utility_program = [
    "AutoLink.exe",
    "DeepscanV1.exe",
    "DeepscanV2.exe",
    "Formulas.exe",
    "ServerProfiler.exe"
];

/**
 * The minimum required Hack stat to enable a player to work at most companies.
 */
export const work_hack_lvl = 250;
