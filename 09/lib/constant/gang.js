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

// Boolean constants specific to gangs.

/**
 * A boolean constant that means we are (or should be) engaged in territory
 * warfare.
 */
export const WAR = true;

/**
 * A boolean constant that means we are not (or should not be) engaged in
 * territory warfare.
 */
export const NO_WAR = !WAR;

// A bunch of constant values relating to gangs.

/**
 * Various armour pieces that a gang member can equip.  Going from top to
 * bottom, the armour pieces are listed in order from least expensive to most
 * expensive.  These values are taken from the following page:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/upgrades.ts
 */
export const armour = {
    "VEST": "Bulletproof Vest",
    "FULL": "Full Body Armor",
    "LIQUID": "Liquid Body Armor",
    "GRAPHENE": "Graphene Plating Armor"
};

/**
 * The threshold for the combat stats that any new recruit must attain.  Each
 * new recruit is immediately assigned to train their combat stats.  They
 * graduate out of training after their combat stats are at least this
 * threshold.
 */
export const combat_tau = 15;

/**
 * The minimum threshold on a combat stat at which a gang member is to be
 * assigned to strongarm civilians.  For example, if a member has Strength at
 * least this number, then we might want to re-assign the member to strongarm
 * civilians.
 */
export const extortion_tau = 50;

/**
 * All Augmentations that can be equipped on a member of a criminal gang.  The
 * Augmentations are listed from least expensive to most expensive.  The data
 * are taken from this file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/upgrades.ts
 */
export const gang_aug_crime = {
    "ARMS": "Bionic Arms",
    "LEGS": "Bionic Legs",
    "WEAVE": "Nanofiber Weave",
    "SPINE": "Bionic Spine",
    "MUSCLE": "Synfibril Muscle",
    "BLADES": "BrachiBlades",
    "HEART": "Synthetic Heart",
    "BONE": "Graphene Bone Lacings"
};

/**
 * In BitNodes other than BN2.x we must decrease our karma to -54,000 or lower
 * as a pre-requisite for creating a gang.  This constant is taken from the
 * file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/Constants.ts
 */
export const gang_karma = -54000;

/**
 * The territory and power of each gang is updated approximately every 20
 * seconds.  We refer to this time period as a tick.
 */
export const gang_tick = 20 * 1000;

/**
 * The number of gangsters we can recruit upon creating our gang.  We must earn
 * more respect to recruit more gang members.
 */
export const initial_gangster = 3;

/**
 * The maximum number of members in a gang.  This number is taken from the file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/Constants.ts
 */
export const max_gangster = 12;

/**
 * The maximum number of gang members to assign to Vigilante Justice.
 */
export const max_vigilante = 4;

/**
 * The maximum number of gang members to assign to territory warfare.  This
 * threshold applies only when we are not engaged in territory warfare against
 * a rival gang.  If we are about to clash against a rival gang, we should
 * devote more members to warfare.  In general, this threshold helps to build
 * our power while we are not engaged in dispute against any rival gang.
 */
export const max_warrior = 4;

/**
 * The penalty percentage threshold at which we should lower our wanted level.
 * If our penalty percentage is at least this value, then we should re-assign
 * some gang members to jobs such as vigilante justice or ethical hacking to
 * help reduce our wanted level.
 */
export const penalty_high_tau = 10;

/**
 * The penalty percentage threshold at which we should move gang members out of
 * jobs that lower our wanted level.  Such jobs are vigilante justice and
 * ethical hacking.  In general, we strive to have as low wanted level as
 * possible.  However, if our wanted level is below this threshold, then we
 * should re-assign members to jobs that yield income.
 */
export const penalty_low_tau = 2;

/**
 * The minimum threshold on a combat stat at which a gang member is to be
 * assigned to armed robbery.  For example, if a member has Strength at least
 * this number, then we might want to re-assign the member to armed robbery.
 */
export const robbery_tau = 200;

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
 * The minimum threshold on a combat stat at which a gang member is to be
 * assigned to acts of terrorism.  For example, if a member has Strength at
 * least this number, then we might want to re-assign the member to commit acts
 * of terrorism.
 */
export const terrorism_tau = 400;

/**
 * The minimum threshold on a combat stat at which a gang member is to be
 * assigned to trafficking illegal arms.  For example, if a member has Strength
 * at least this number, then we might want to re-assign the member to
 * trafficking illegal arms.
 */
export const traffick_tau = 300;

/**
 * Various vehicles with which a gang member can be equipped.  Going from top
 * to bottom, the vehicles are listed from least expensive to most expensive.
 * The values are taken from this file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/upgrades.ts
 */
export const vehicle = {
    "FORD": "Ford Flex V20",
    "ATX": "ATX1070 Superbike",
    "MB": "Mercedes-Benz S9001",
    "FERRARI": "White Ferrari"
};

/**
 * Various weapons we can purchase for our gang members.  Going from top to
 * bottom in the given order, the weapons are listed from least expensive to
 * most expensive.  The weapon names are taken from this file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/upgrades.ts
 */
export const weapon = {
    "BAT": "Baseball Bat",
    "KATANA": "Katana",
    "GLOCK": "Glock 18C",
    "PNINE": "P90C",
    "STEYR": "Steyr AUG",
    "AK": "AK-47",
    "MFIFTEEN": "M15A10 Assault Rifle",
    "AWM": "AWM Sniper Rifle"
};

/**
 * The minimum chance of winning a clash against a rival gang.  This chance of
 * victory is expressed as an integer percentage.  In general, we should only
 * engage in turf warfare against another gang if our chance of victory is at
 * least this number.
 */
export const win_tau = 75;
