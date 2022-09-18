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
 * Various named Augmentations.
 */
export const augment = {
    "TRP": "The Red Pill"
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
export const factions = [
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