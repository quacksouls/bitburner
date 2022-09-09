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
export const cities = [
    "Aevum",
    "Chongqing",
    "Ishima",
    "New Tokyo",
    "Sector-12",
    "Volhaven"
];

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
 * The maximum number of members in a gang.  This number is taken from the file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/Constants.ts
 */
export const max_gangster = 12;

/**
 * The amount of RAM for a mid-sized home server.
 */
export const mid_ram = 128;

/**
 * Always have this amount of money in reserve.  When engaging in any
 * purchasing activities, we do not want to spend all our money.  We spend only
 * if doing so would leave us with at least this amount of money left over.
 */
export const money_reserve = 50 * (10**6);

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
 * Various tasks to which a gang member can be assigned.  The task names are
 * taken from this file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/tasks.ts
 */
export const task = {
    // Set a gang member to the idle state.  This is the default state upon
    // recruitment.
    // Gang: criminal, hacking
    "IDLE": "Unassigned",
    //
    // Hacking gangs.
    //
    // Set a gang member to commit cyberterrorism.
    // Gang: hacking
    // Money: N/A
    // Respect: great
    // Wanted: great
    "CYBERTERROR": "Cyberterrorism",
    // Set a gang member to attempt distributed denial of service (DDoS)
    // attacks.
    // Gang: hacking
    // Money: N/A
    // Respect: yes
    // Wanted: yes
    "DDOS": "DDoS Attacks",
    // Set a gang member as an ethical hacker.
    // Gang: hacking
    // Money: yes
    // Respect: N/A
    // Wanted: negative
    "EHACK": "Ethical Hacking",
    // Set a gang member to commit financial fraud and digital counterfeiting.
    // Gang: hacking
    // Money: yes
    // Respect: slight
    // Wanted: slight
    "FRAUD": "Fraud & Counterfeiting",
    // Set a gang member to attempt identity theft.
    // Gang: hacking
    // Money: yes
    // Respect: yes
    // Wanted: yes
    "ID_THEFT": "Identity Theft",
    // Set a gang member to launder money.
    // Gang: hacking
    // Money: yes
    // Respect: yes
    // Wanted: yes
    "LAUNDER": "Money Laundering",
    // Set a gang member to attempt phishing scams and attacks.
    // Gang: hacking
    // Money: yes
    // Respect: slight
    // Wanted: slight
    "PHISHING": "Phishing",
    // Set a gang member to create and distribute ransomware.
    // Gang: hacking
    // Money: yes
    // Respect: slight
    // Wanted: slight
    "RANSOMWARE": "Ransomware",
    // Set a gang member to create and distribute malicious viruses.
    // Gang: hacking
    // Money: N/A
    // Respect: yes
    // Wanted: yes
    "VIRUS": "Plant Virus",
    //
    // Criminal gangs.
    //
    // Set a gang member to threaten and blackmail high-profile targets.
    // Gang: criminal
    // Money: yes
    // Respect: slight
    // Wanted: slight
    "BLACKMAIL": "Threaten & Blackmail",
    // Set a gang member to run cons.
    // Gang: criminal
    // Money: yes
    // Respect: yes
    // Wanted: yes
    "CON": "Run a Con",
    // Set a gang member to sell drugs.
    // Gang: criminal
    // Money: yes
    // Respect: slight
    // Wanted: slight
    "DRUGS": "Deal Drugs",
    // Set a gang member to extort civilians in our turf.
    // Gang: criminal
    // Money: yes
    // Respect: slight
    // Wanted: yes
    "EXTORT": "Strongarm Civilians",
    // Set a gang member to randomly mug a person.
    // Gang: criminal
    // Money: yes
    // Respect: slight
    // Wanted: very slight
    "MUG": "Mug People",
    // Set a gang member to commit armed robbery.
    // Gang: criminal
    // Money: yes
    // Respect: yes
    // Wanted: yes
    "ROBBERY": "Armed Robbery",
    // Set a gang member to commit acts of terrorism.
    // Gang: criminal
    // Money: N/A
    // Respect: great
    // Wanted: great
    "TERROR": "Terrorism",
    // Set a gang member to traffick illegal arms.
    // Gang: criminal
    // Money: yes
    // Respect: yes
    // Wanted: yes
    "TRAFFICK_ARMS": "Traffick Illegal Arms",
    // Set a gang member to attempt human trafficking.
    // Gang: criminal
    // Money: yes
    // Respect: yes
    // Wanted: yes
    "TRAFFICK_HUMAN": "Human Trafficking",
    //
    // Both criminal and hacking gangs.
    //
    // Set a gang member to train their Charisma stat.
    // Gang: criminal, hacking
    // Money: N/A
    // Wanted: N/A
    "CHARISMA": "Train Charisma",
    // Set a gang member to train their combat stats, i.e. Str, Def, Dex, Agi.
    // Gang: criminal, hacking
    // Money: N/A
    // Wanted: N/A
    "COMBAT": "Train Combat",
    // Set a gang member to train their Hack stat.
    // Gang: criminal, hacking
    // Money: N/A
    // Wanted: N/A
    "HACK": "Train Hacking",
    // Set a gang member to engage in territorial warfare against other gangs.
    // Gang: criminal, hacking
    // Money: N/A
    // Wanted: N/A
    "TURF_WAR": "Territory Warfare",
    // Set a gang member to be a vigilante and protect the city from criminals.
    // Gang: criminal, hacking
    // Money: N/A
    // Respect: N/A
    // Wanted: negative
    "VIGILANTE": "Vigilante Justice"
};

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
