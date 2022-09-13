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
 * The territory and power of each gang is updated approximately every 20
 * seconds.  We refer to this time period as a tick.
 */
export const gang_tick = 20 * 1000;

/**
 * The maximum number of members in a gang.  This number is taken from the file:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/Constants.ts
 */
export const max_gangster = 12;

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
