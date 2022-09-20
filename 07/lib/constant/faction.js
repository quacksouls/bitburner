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

// A bunch of constant values related to factions and their Augmentations.

/**
 * Various constants and thresholds related to Augmentations.
 */
export const augment = {
    // The maximum number of Augmentations to purchase from a faction.  This
    // number does not include the NeuroFlux Governor.  We limit the number of
    // Augmentations to purchase to help speed up the process of buying all
    // Augmentations from a faction.  We purchase this number of Augmentations
    // from a faction and install them.  If the faction has any more
    // Augmentations (besides the NeuroFlux Governor), we purchase those after
    // the installation.  Some Augmentations require a huge amount of faction
    // reputation.  It can take a very long time to accumulate enough
    // reputation points, especially if an Augmentation requires at least one
    // million reputation points.  By purchasing a given number of
    // Augmentations and installing them, we gain some favour with the faction.
    // In case our favour points are high enough, we would be able to donate to
    // the faction in exchange for reputation points.  This should help to
    // shorten the amount of time required to reach a certain amount of
    // reputation points.
    "BUY_TAU": 5,
    // Named Augmentations.
    "TRP": "The Red Pill"
};

/**
 * Stat requirements for receiving an invitation from a faction.  Here is an
 * explanation of each requirement.  The value of "undefined" means this
 * particular attribute is not part of the requirements for the given faction.
 *
 * (1) backdoor := Must install a backdoor on this server.
 * (2) city := Must be located in this city.
 * (3) combat := Lower threshold for each combat stat.  Each of our Strength,
 *     Defense, Dexterity, and Agility must be at least this value.
 * (4) hack := Lower threshold for our Hack stat.  Our Hack stat must be at
 *     least this value.
 * (5) karma := Our negative karma must be this value or lower.
 * (6) kill := Must have killed at least this many people.
 * (7) money := Must have at least this amount of money.
 */
export const faction_req = {
    "Aevum": {
        "backdoor": undefined,
        "city": "Aevum",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": 40 * 1e6
    },
    "Bachman & Associates": {
        "backdoor": "b-and-a",
        "city": "Aevum",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    "BitRunners": {
        "backdoor": "run4theh111z",
        "city": undefined,
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    "Blade Industries": {
        "backdoor": "blade",
        "city": "Sector-12",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    "Chongqing": {
        "backdoor": undefined,
        "city": "Chongqing",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": 20 * 1e6
    },
    "Clarke Incorporated": {
        "backdoor": "clarkinc",
        "city": "Aevum",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    "CyberSec": {
        "backdoor": "CSEC",
        "city": undefined,
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    // This faction has a requirement not listed below.  We must install a
    // certain number of Augmentations.  This number can vary from one BitNode
    // to the next.
    "Daedalus": {
        "backdoor": undefined,
        "city": undefined,
        "combat": 1500,
        "hack": 2500,
        "karma": undefined,
        "kill": undefined,
        "money": 100 * 1e9
    },
    "ECorp": {
        "backdoor": "ecorp",
        "city": "Aevum",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    "Four Sigma": {
        "backdoor": "4sigma",
        "city": "Sector-12",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    "Fulcrum Secret Technologies": {
        "backdoor": "fulcrumassets",
        "city": "Aevum",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    // This faction has a requirement not listed below.  We must install at
    // least 30 Augmentations.
    "Illuminati": {
        "backdoor": undefined,
        "city": undefined,
        "combat": 1200,
        "hack": 1500,
        "karma": undefined,
        "kill": undefined,
        "money": 150 * 1e9
    },
    "Ishima": {
        "backdoor": undefined,
        "city": "Ishima",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": 30 * 1e6
    },
    "KuaiGong International": {
        "backdoor": "kuai-gong",
        "city": "Chongqing",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    "MegaCorp": {
        "backdoor": "megacorp",
        "city": "Sector-12",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    // This faction has another requirement not listed below.  Nodes in our
    // Hacknet farm must have a collective level of at least 100, a collective
    // RAM of at least 8, and a collective Cores of at least 4. For example, if
    // we have 3 Hacknet nodes then the Level of all 3 nodes should add up to
    // at least 100. One node can be at Level 50, another node can be at
    // Level 30, and the third node can be at Level 21.
    "Netburners": {
        "backdoor": undefined,
        "city": undefined,
        "combat": undefined,
        "hack": 80,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    "New Tokyo": {
        "backdoor": undefined,
        "city": "New Tokyo",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": 20 * 1e6
    },
    "NiteSec": {
        "backdoor": "avmnite-02h",
        "city": undefined,
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    "NWO": {
        "backdoor": "nwo",
        "city": "Volhaven",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    "OmniTek Incorporated": {
        "backdoor": "omnitek",
        "city": "Volhaven",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    "Sector-12": {
        "backdoor": undefined,
        "city": "Sector-12",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    // This faction has another requirement not listed below.  We must be a
    // CTO, CFO, or CEO of a company.
    "Silhouette": {
        "backdoor": undefined,
        "city": undefined,
        "combat": undefined,
        "hack": undefined,
        "karma": -22,
        "kill": undefined,
        "money": 15 * 1e6
    },
    "Slum Snakes": {
        "backdoor": undefined,
        "city": undefined,
        "combat": 30,
        "hack": undefined,
        "karma": -9,
        "kill": undefined,
        "money": 1e6
    },
    "Speakers for the Dead": {
        "backdoor": undefined,
        "city": undefined,
        "combat": 300,
        "hack": 100,
        "karma": -45,
        "kill": 30,
        "money": undefined
    },
    "Tetrads": {
        "backdoor": undefined,
        "city": "Ishima",
        "combat": 75,
        "hack": undefined,
        "karma": -18,
        "kill": undefined,
        "money": undefined
    },
    "The Black Hand": {
        "backdoor": "I.I.I.I",
        "city": undefined,
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": undefined
    },
    // This faction has a requirement not listed below.  We must have installed
    // at least 20 Augmentations.
    "The Covenant": {
        "backdoor": undefined,
        "city": undefined,
        "combat": 850,
        "hack": 850,
        "karma": undefined,
        "kill": undefined,
        "money": 75 * 1e9
    },
    "The Dark Army": {
        "backdoor": undefined,
        "city": "Chongqing",
        "combat": 300,
        "hack": 300,
        "karma": -45,
        "kill": 5,
        "money": undefined
    },
    "The Syndicate": {
        "backdoor": undefined,
        "city": "Sector-12",
        "combat": 200,
        "hack": 200,
        "karma": -90,
        "kill": undefined,
        "money": 10 * 1e6
    },
    "Tian Di Hui": {
        "backdoor": undefined,
        "city": "Ishima",
        "combat": undefined,
        "hack": 50,
        "karma": undefined,
        "kill": undefined,
        "money": 1e6
    },
    "Volhaven": {
        "backdoor": undefined,
        "city": "Volhaven",
        "combat": undefined,
        "hack": undefined,
        "karma": undefined,
        "kill": undefined,
        "money": 50 * 1e6
    }
};

/**
 * Augmentations that are exclusive to various factions.  We can purchase some
 * Augmentations provided that we are a member of the corresponding faction.
 */
export const exclusive_aug = {
    "Bachman & Associates": ["SmartJaw"],
    "BitRunners": [
        "BitRunners Neurolink",
        "Cranial Signal Processors - Gen V",
        "Neural Accelerator"
    ],
    "Blade Industries": ["Neotra"],
    "Chongqing": ["Neuregen Gene Modification"],
    "Clarke Incorporated": [
        "Neuronal Densification",
        "nextSENS Gene Modification"
    ],
    "CyberSec": [
        "Cranial Signal Processors - Gen I",
        "Neurotrainer I", "Synaptic Enhancement Implant"
    ],
    "Daedalus": ["The Red Pill"],
    "ECorp": ["ECorp HVMind Implant"],
    "Fulcrum Secret Technologies": [
        "PC Direct-Neural Interface NeuroNet Injector"
    ],
    "Illuminati": ["QLink"],
    "Ishima": ["INFRARET Enhancement"],
    "KuaiGong International": ["Photosynthetic Cells"],
    "MegaCorp": ["CordiARC Fusion Reactor"],
    "Netburners": [
        "Hacknet Node Cache Architecture Neural-Upload",
        "Hacknet Node Core Direct-Neural Interface",
        "Hacknet Node CPU Architecture Neural-Upload",
        "Hacknet Node Kernel Direct-Neural Interface",
        "Hacknet Node NIC Architecture Neural-Upload"
    ],
    "New Tokyo": ["NutriGen Implant"],
    "NiteSec": [
        "CRTX42-AA Gene Modification",
        "Neural-Retention Enhancement"
    ],
    "NWO": ["Xanipher"],
    "OmniTek Incorporated": ["OmniTek InfoLoad"],
    "Sector-12": ["CashRoot Starter Kit"],
    "Silhouette": ["TITN-41 Gene-Modification Injection"],
    "Slum Snakes": ["SmartSonar Implant"],
    "Speakers for the Dead": ["Graphene BrachiBlades Upgrade"],
    "Tetrads": ["Bionic Arms"],
    "Tian Di Hui": ["Social Negotiation Assistant (S.N.A)"],
    "The Black Hand": ["The Black Hand"],
    "The Covenant": ["SPTN-97 Gene Modification"],
    "The Dark Army": ["Graphene Bionic Arms Upgrade"],
    "The Syndicate": ["BrachiBlades"],
    "Volhaven": ["DermaForce Particle Barrier"]
};

/**
 * An array of all faction names.  The faction names are listed in a specific
 * order, usually along the following line of reasoning.
 *
 * (1) Sector-12 should be the first faction we must join.  The reason is
 *     simple.  This faction has the CashRoot Starter Kit Augmentation that
 *     grants us $1m and the BruteSSH.exe program after a soft reset.
 * (2) Netburners, CyberSec, and Tian Di Hui should be the next group of
 *     factions to join.  These factions have Augmentations that raise various
 *     hack-related stats.  In particular, Tian Di Hui has 4 Augmentations that
 *     boost the amount of reputation we gain from factions and companies.
 * (3) BitRunners has an Augmentation that allows us to start with the
 *     FTPCrack.exe and relaySMTP.exe programs after a soft reset.
 * (4) The Syndicate has the Augmentation BrachiBlades, which is a
 *     pre-requisite of an Augmentation from Speakers for the Dead.
 *     Furthermore, The Syndicate has 2 Augmentations that boost the reputation
 *     we gain from factions and companies.
 * (5) Bachman & Associates has 5 Augmentations that boost the amount of
 *     reputation we gain from factions and companies.
 * (6) Aevum has the PCMatrix Augmentation that allows us to start with
 *     DeepscanV1.exe and AutoLink.exe after a soft reset.  These are strictly
 *     not necessary in an automated game play.
 * (7) Chongqing, Ishima, and New Tokyo are not enemies with each other.  We
 *     can join all three factions at the same time, work toward purchasing all
 *     of their Augmentations, and install all Augmentations from all three
 *     factions at the same time.  Doing so can save us a lot of time as we do
 *     not need to go through a soft reset after purchasing all Augmentations
 *     from one faction.  However, we some way to generate a massive amount of
 *     income within a short amount of time.
 * (8) Volhaven should be the last city faction to join.
 * (9) NiteSec and The Black Hand are the remaining two hacking groups to join.
 *     They have Augmentations to boost various hack-related stats.
 * (10) We can join the remaining megacorporation factions in any order we
 *      want.  These factions have various Augmentations that boost a number of
 *      social-related stats, i.e. reputation from factions and companies.
 *      However, we should have purchased most or all of these from
 *      Bachman & Associates.
 * (11) Criminal organizations have Augmentations to boost various combat stats
 *      as well as social-related stats.  We should have bought from
 *      The Syndicate all or most of the Augmentations that boost our
 *      reputation gain from factions and companies.
 * (12) The endgame factions should be the last to join.  We can join
 *      Illuminati or The Covenant in any order we want.  However, Daedalus
 *      should be the very last faction that we join.
 */
export const factions = [
    // Early game factions, city factions, and hacking groups.
    "Sector-12",
    "Netburners",
    "CyberSec",
    "Tian Di Hui",
    "BitRunners",
    // Criminal organization.
    "The Syndicate",
    // Megacorporation.
    "Bachman & Associates",
    // City factions.
    "Aevum",
    "Chongqing",
    "Ishima",
    "New Tokyo",
    "Volhaven",
    // Hacking factions.
    "NiteSec",
    "The Black Hand",
    // Megacorporations.
    "Blade Industries",
    "Clarke Incorporated",
    "ECorp",
    "Four Sigma",
    "Fulcrum Secret Technologies",
    "KuaiGong International",
    "MegaCorp",
    "NWO",
    "OmniTek Incorporated",
    // Criminal organizations.
    "Silhouette",
    "Slum Snakes",
    "Speakers for the Dead",
    "Tetrads",
    "The Dark Army",
    // Endgame factions.
    "Illuminati",
    "The Covenant",
    "Daedalus"
];
