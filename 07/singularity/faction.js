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

import { home } from "/lib/constant.js";
import { Money } from "/lib/money.js";
import { Player } from "/lib/player.js";
import { Server } from "/lib/server.js";
import { connect_to, study } from "/lib/singularity.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

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
function all_factions() {
    const faction = [
        // Early game factions, city factions, and hacking groups.
        "Sector-12", "Netburners", "CyberSec", "Tian Di Hui", "BitRunners",
        "Aevum", "Chongqing", "Ishima", "New Tokyo", "Volhaven", "NiteSec",
        "The Black Hand",
        // Megacorporations.
        "Bachman & Associates", "Blade Industries", "Clarke Incorporated",
        "ECorp", "Four Sigma", "Fulcrum Secret Technologies",
        "KuaiGong International", "MegaCorp", "NWO", "OmniTek Incorporated",
        // Criminal organizations.  The Syndicate has the Augmentation
        // BrachiBlades, which is a pre-requisite of an Augmentation from
        // Speakers for the Dead.
        "Silhouette", "Slum Snakes", "The Syndicate", "Speakers for the Dead",
        "Tetrads", "The Dark Army",
        // Endgame factions.
        "Illuminati", "The Covenant", "Daedalus"
    ];
    return faction;
}

/**
 * Which Augmentations we still need to purchase from a faction.
 *
 * @param ns The Netscript API.
 * @param fac We want to purchase all Augmentations from this faction.
 * @return A map {aug: cost} as follows:
 *
 *     (1) aug := The key is the name of an Augmentation.
 *     (2) cost := The value is the cost of the corresponding Augmentation.
 *
 *     Return an empty map if we already have purchased all Augmentations from
 *     the given faction.
 */
function augmentations_to_buy(ns, fac) {
    assert(is_valid_faction(fac));
    // All Augmentations we have not yet purchased from the given faction.
    const purchased = true;
    const owned_aug = new Set(ns.singularity.getOwnedAugmentations(purchased));
    let fac_aug = ns.singularity.getAugmentationsFromFaction(fac);
    fac_aug = fac_aug.filter(a => !owned_aug.has(a));
    const augment = new Map();
    if (0 == fac_aug.length) {
        return augment;
    }
    // A map {aug: cost} of Augmentations and their respective costs.  Use the
    // ceiling function to avoid comparison of floating point numbers.
    for (const aug of fac_aug) {
        const cost = Math.ceil(ns.singularity.getAugmentationPrice(aug));
        augment.set(aug, cost);
    }
    return augment;
}

/**
 * Wait for an invitation from the target faction.
 *
 * @param ns The Netscript API.
 * @param fac We want an invitation from this faction.
 */
async function await_invitation(ns, fac) {
    assert(is_valid_faction(fac));
    let invite = ns.singularity.checkFactionInvitations();
    const t = new Time();
    const time = 5 * t.second();
    while (!invite.includes(fac)) {
        await ns.sleep(time);
        invite = ns.singularity.checkFactionInvitations();
    }
}

/**
 * Choose the most expensive Augmentation to buy.  Why should we buy the most
 * expensive Augmentation first?  The answer is simple.  After we have
 * purchased an Augmentation from a faction, the cost of each remaining
 * Augmentation is raised by a multiplier.  Had we not purchase the most
 * expensive Augmentation, its cost would now be much higher than previously.
 *
 * @param augment A map {aug: cost} where the key is the name of an
 *     Augmentation and the value is the cost of the Augmentation.  Cannot be
 *     an empty map.
 * @return An array [aug, cost] where aug is the most expensive Augmentation
 *     from the given map.
 */
function choose_augmentation(augment) {
    assert(augment.size > 0);
    let max = -Infinity;
    let aug = "";
    for (const [a, cost] of augment) {
        if (max < cost) {
            max = cost;
            aug = a;
        }
    }
    return [aug, max];
}

/**
 * Choose a faction to join and join that faction.  Work for the faction to
 * earn enough reputation points to allow us to purchase all Augmentations from
 * the faction.  We typically choose a faction for these reasons:
 *
 * (1) We have not yet joined the faction.
 * (2) We have not yet purchased and installed all Augmentations from the
 *     faction.
 *
 * @param ns The Netscript API.
 */
async function choose_faction(ns) {
    // Determine which faction to join next.
    let faction = "";
    for (const f of all_factions()) {
        if (join_next(ns, f)) {
            faction = f;
            break;
        }
    }
    // Join a faction.
    const m = new Money();
    let city = "";
    let company = "";
    let money = 0;
    let rep = 200000;
    let server = "";
    switch (faction) {
    case "Aevum":
        city = faction;
        money = 40 * m.million();
        await city_faction(ns, city, money);
        break;
    case "Bachman & Associates":
        city = "Aevum";
        company = faction;
        await megacorporation(ns, city, company, faction, rep);
        break;
    case "BitRunners":
        server = "run4theh111z";
        await hacking_group(ns, faction, server);
        break;
    case "Blade Industries":
        city = "Sector-12";
        company = faction;
        await megacorporation(ns, city, company, faction, rep);
        break;
    case "Chongqing":
        city = faction;
        money = 20 * m.million();
        await city_faction(ns, city, money);
        break;
    case "Clarke Incorporated":
        city = "Aevum";
        company = faction;
        await megacorporation(ns, city, company, faction, rep);
        break;
    case "CyberSec":
        server = "CSEC";
        await hacking_group(ns, faction, server);
        break;
    case "Daedalus":
        await daedalus(ns);
        break;
    case "ECorp":
        city = "Aevum";
        company = faction;
        await megacorporation(ns, city, company, faction, rep);
        break;
    case "Four Sigma":
        city = "Sector-12";
        company = faction;
        await megacorporation(ns, city, company, faction, rep);
        break;
    case "Fulcrum Secret Technologies":
        city = "Aevum";
        company = "Fulcrum Technologies";
        rep = 250000;
        await megacorporation(ns, city, company, faction, rep);
        break;
    case "Illuminati":
        await illuminati(ns);
        break;
    case "Ishima":
        city = faction;
        money = 30 * m.million();
        await city_faction(ns, city, money);
        break;
    case "KuaiGong International":
        city = "Chongqing";
        company = faction;
        await megacorporation(ns, city, company, faction, rep);
        break;
    case "MegaCorp":
        city = "Sector-12";
        company = faction;
        await megacorporation(ns, city, company, faction, rep);
        break;
    case "Netburners":
        await netburners(ns);
        break;
    case "New Tokyo":
        city = faction;
        money = 20 * m.million();
        await city_faction(ns, city, money);
        break;
    case "NiteSec":
        server = "avmnite-02h";
        await hacking_group(ns, faction, server);
        break;
    case "NWO":
        city = "Volhaven";
        company = faction;
        await megacorporation(ns, city, company, faction, rep);
        break;
    case "OmniTek Incorporated":
        city = "Volhaven";
        company = faction;
        await megacorporation(ns, city, company, faction, rep);
        break;
    case "Sector-12":
        city = faction;
        money = 15 * m.million();
        await city_faction(ns, city, money);
        break;
    case "Silhouette":
        await silhouette(ns);
        break;
    case "Slum Snakes":
        await slum_snakes(ns);
        break;
    case "Speakers for the Dead":
        await speakers_for_the_dead(ns);
        break;
    case "Tetrads":
        await tetrads(ns);
        break;
    case "The Black Hand":
        server = "I.I.I.I";
        await hacking_group(ns, faction, server);
        break;
    case "The Covenant":
        await the_covenant(ns);
        break;
    case "The Dark Army":
        await the_dark_army(ns);
        break;
    case "The Syndicate":
        await the_syndicate(ns);
        break;
    case "Tian Di Hui":
        await tian_di_hui(ns);
        break;
    case "Volhaven":
        city = faction;
        money = 50 * m.million();
        await city_faction(ns, city, money);
        break;
    default:
        break;
    }
}

/**
 * Join a city faction.  We have the following city factions: Aevum, Chongqing,
 * Ishima, New Tokyo, Sector-12, Volhaven.  The requirements for receiving an
 * invitation usually follow this pattern:
 *
 * (1) Must be located in a particular city.
 * (2) Have at least a certain amount of money.
 *
 * Here are the requirements for each city faction:
 *
 * (1) Aevum: must be in Aevum; have at least $40m.
 * (2) Chongqing: must be in Chongqing; have at least $20m.
 * (3) Ishima: must be in Ishima; have at least $30m.
 * (4) New Tokyo: must be in New Tokyo; have at least $20m.
 * (5) Sector-12: must be in Sector-12; have at least $15m.
 * (6) Volhaven: must be in Volhaven; have at least $50m.
 *
 * @param ns The Netscript API.
 * @param city We must be located in this city.
 * @param money We must have at least this amount of money.
 */
async function city_faction(ns, city, money) {
    await visit_city(ns, city);
    // Commit crimes to boost our income.
    const player = new Player(ns);
    if (player.money() < money) {
        await commit_crime(ns, money);
    }
    const work_type = "Hacking Contracts";
    await join_work_and_buy(ns, city, work_type);
}

/**
 * Commit various crimes to raise our income to a given threshold.
 *
 * @param ns The Netscript API.
 * @param threshold Continue to commit crime as long as our income is below
 *     this threshold.
 */
async function commit_crime(ns, threshold) {
    assert(threshold > 0);
    const script = "/singularity/crime.js";
    const nthread = 1;
    ns.exec(script, home, nthread, threshold);
    const t = new Time();
    const time = 30 * t.second();
    const player = new Player(ns);
    while ((player.money() < threshold) || ns.singularity.isBusy()) {
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}

/**
 * Join the endgame faction Daedalus.  The requirements for receiving an
 * invitation:
 *
 * (1) Must have installed at least 30 Augmentations.
 * (2) Have at least $100b.
 * (3) Either of the following:
 *     (a) At least 2,500 Hack; or
 *     (b) Each combat stat must be at least 1,500.
 *
 * @param ns The Netscript API.
 */
async function daedalus(ns) {
    // Ensure we have already installed at least 30 Augmentations.
    const augment = owned_augmentations(ns);
    assert(augment.size >= 30);
    // Have at least $100b.
    const m = new Money();
    const threshold = 100 * m.billion();
    await work(ns, threshold);
    // At least 2,500 Hack.
    const hack_lvl = 2500;
    await raise_hack(ns, hack_lvl);
    const faction = "Daedalus";
    const work_type = "Hacking Contracts";
    await join_work_and_buy(ns, faction, work_type);
}

/**
 * Join a hacking group.  The requirement for receiving an invitation is to
 * install a backdoor on a target server.  The requirement can be broken up
 * into the following mini-requirements:
 *
 * (1) Have at least the hacking skill required by the target server.  This is
 *     usually a mid-level server, typically requiring a hacking skill of
 *     several 100s.
 * (2) Gain root access on the target server.  As this is a mid-level server,
 *     it requires between 2 to 4 ports to be opened before we can nuke the
 *     server.  We need some time to acquire at most 4 port opener programs.
 * (3) Manually install a backdoor on the target server.
 *
 * The hacking groups are BitRunners, NiteSec, and The Black Hand.  The
 * exception is CyberSec, which is an early game faction but it has the same
 * requirement for receiving an invitation as the three hacking groups.
 *
 * @param ns The Netscript API.
 * @param fac We want to join this hacking group.
 * @param server We must install a backdoor on this server as a pre-requisite
 *     for receiving an invitation from the given faction.
 */
async function hacking_group(ns, fac, server) {
    const player = new Player(ns);
    assert(player.city() == "Sector-12");
    await install_backdoor(ns, server);
    const work_type = "Hacking Contracts";
    await join_work_and_buy(ns, fac, work_type);
}

/**
 * Whether we have a given Augmentation.
 *
 * @param ns The Netscript API.
 * @param aug Check this Augmentation.
 * @return true if we have already purchased the given Augmentation;
 *     false otherwise.
 */
function has_augmentation(ns, aug) {
    const purchased = true;
    const augment = new Set(ns.singularity.getOwnedAugmentations(purchased));
    return augment.has(aug);
}

/**
 * Join the endgame faction Illuminati.  The requirements for receiving an
 * invitation:
 *
 * (1) Must have installed at least 30 Augmentations.
 * (2) Have at least $150b.
 * (3) At least 1,500 Hack.
 * (4) Each combat stat must be at least 1,200.
 *
 * @param ns The Netscript API.
 */
async function illuminati(ns) {
    // Ensure we have already installed at least 30 Augmentations.
    const augment = owned_augmentations(ns);
    assert(augment.size >= 30);
    // Have at least $150b.
    const m = new Money();
    const threshold = 150 * m.billion();
    await work(ns, threshold);
    // At least 1,500 Hack.
    const hack_lvl = 1500;
    await raise_hack(ns, hack_lvl);
    // Each combat stat at least 1,200.
    const combat_lvl = 1200;
    await raise_combat_stats(ns, combat_lvl);
    const faction = "Illuminati";
    const work_type = "Hacking Contracts";
    await join_work_and_buy(ns, faction, work_type);
}

/**
 * Install a backdoor on a world server.
 *
 * @param ns The Netscript API.
 * @param hostname We want to install a backdoor on the server having this
 *     hostname.
 */
async function install_backdoor(ns, hostname) {
    // Ensure we have at least the required Hack stat.
    const server = new Server(ns, hostname);
    const player = new Player(ns);
    if (player.hacking_skill() < server.hacking_skill()) {
        await study(ns, server.hacking_skill());
    }
    assert(player.hacking_skill() >= server.hacking_skill());
    // Gain root access on the target server.  Manually connect to the server
    // and install a backdoor.  Then return home.
    const t = new Time();
    const time = 5 * t.second();
    while (!server.has_root_access()) {
        await server.gain_root_access();
        await ns.sleep(time);
    }
    assert(server.has_root_access());
    connect_to(ns, player.home(), server.hostname());
    await ns.singularity.installBackdoor();
    connect_to(ns, server.hostname(), player.home());
}

/**
 * Whether the given name represents a valid faction.
 *
 * @param fac A string representing the name of a faction.
 * @return true if the given name represents a valid faction;
 *     false otherwise.
 */
function is_valid_faction(fac) {
    assert(fac.length > 0);
    const faction = new Set(all_factions());
    return faction.has(fac);
}

/**
 * Whether to join a given faction.
 *
 * @param ns The Netscript API.
 * @param fac The name of the faction to consider.
 * @return true if the given faction should be joined next; false otherwise.
 */
function join_next(ns, fac) {
    assert(is_valid_faction(fac));
    const JOIN = true;
    const NO_JOIN = !JOIN;
    const owned_aug = owned_augmentations(ns);
    const fac_aug = ns.singularity.getAugmentationsFromFaction(fac);
    for (const aug of fac_aug) {
        if (!owned_aug.has(aug)) {
            return JOIN;
        }
    }
    return NO_JOIN;
}

/**
 * Join a faction and work to earn reputation points.  Wait until we have
 * enough reputation points to purchase all Augmentations from the faction.
 *
 * @param ns The Netscript API.
 * @param fac We want to join this faction.
 * @param work_type The type of work to carry out for the given faction.
 *     Either "Hacking Contracts" or "Field Work".
 */
async function join_work_and_buy(ns, fac, work_type) {
    assert(is_valid_faction(fac));
    const player = new Player(ns);
    const joined_faction = player.faction();
    if (!joined_faction.includes(fac)) {
        await await_invitation(ns, fac);
        ns.singularity.joinFaction(fac);
    }
    await work_and_buy(ns, fac, work_type);
}

/**
 * Accumulate negative karma.  Stop when our negative karma is at or lower than
 * a given threshold.
 *
 * @param ns The Netscript API.
 * @param threshold We want our negative karma to be at or lower than this
 *     threshold.  Must be a negative integer.
 * @param crime The crime we must carry out to lower our karma.
 *     Either "shoplift" or "homicide".
 * @param nkill If crime := "homicide", then we must also provide the target
 *     number of people to kill.  Pass in 0 if the crime is not homicide.  Must
 *     be a non-negative integer.
 */
async function lower_karma(ns, threshold, crime, nkill) {
    // Sanity checks.
    assert(threshold < 0);
    assert(("shoplift" == crime) || ("homicide" == crime));
    assert(nkill >= 0);
    // Shoplift.  Use the ceiling function to convert the karma value to an
    // integer.  It is safer to compare integers than it is to compare floating
    // point numbers.
    const t = new Time();
    const time = t.second();
    const player = new Player(ns);
    if ("shoplift" == crime) {
        while (Math.ceil(player.karma()) > threshold) {
            ns.singularity.commitCrime(crime);
            while (ns.singularity.isBusy()) {
                await ns.sleep(time);
            }
        }
        assert(Math.ceil(player.karma()) < 0);
        assert(Math.ceil(player.karma()) <= threshold);
        return;
    }
    // Homicide.
    assert("homicide" == crime);
    assert(nkill > 0);
    while (
        (Math.ceil(player.karma()) > threshold)
            || (player.nkill() < nkill)
    ) {
        ns.singularity.commitCrime(crime);
        while (ns.singularity.isBusy()) {
            await ns.sleep(time);
        }
    }
    assert(Math.ceil(player.karma()) < 0);
    assert(Math.ceil(player.karma()) <= threshold);
    assert(player.nkill() >= nkill);
}

/**
 * Join a megacorporation faction.  The requirements for receiving an
 * invitation are:
 *
 * (1) Travel to a particular city where a megacorporation is located.
 * (2) Work for the megacorporation to earn a given amount of reputation points.
 *
 * The exception is Fulcrum Technologies.  In addition to the above two
 * requirements, this megacorporation also requires us to install a backdoor on
 * the fulcrumassets server.  The invitation is sent from Fulcrum Secret
 * Technologies, not Fulcrum Technologies.
 *
 * @param ns The Netscript API.
 * @param city We want to travel to this city.
 * @param company We want to work for this company and raise our reputation
 *     within the company.
 * @param fac Our aim is to join this faction.
 * @param rep Must earn at least this amount of reputation point within the
 *     company.
 */
async function megacorporation(ns, city, company, fac, rep) {
    await visit_city(ns, city);
    // Work for the company to earn the required reputation points.  Join the
    // faction, earn reputation points, and purchase all Augmentations.
    await work_for_company(ns, company, rep);
    if ("Fulcrum Secret Technologies" == fac) {
        await install_backdoor(ns, "fulcrumassets");
    }
    const work_type = "Hacking Contracts";
    await join_work_and_buy(ns, fac, work_type);
}

/**
 * Join the early game faction Netburners.  Requirements to receive an
 * invitation:
 *
 * (1) Be anywhere in the game world.  Stay put where we started,
 *     i.e. Sector-12.
 * (2) At least 80 Hack.
 * (3) A total Hacknet Level of 100.  This means that all of our Hacknet nodes
 *     have a collective Level of 100.
 * (4) A total Hacknet RAM of 8GB.  All of our Hacknet nodes have a collective
 *     RAM of 8GB.
 * (5) A total Hacknet Cores of 4.  All of our Hacknet nodes collectively have
 *     at least 4 Cores.
 *
 * @param ns The Netscript API.
 */
async function netburners(ns) {
    const player = new Player(ns);
    assert(player.city() == "Sector-12");
    // Ensure we have at least the required Hack stat.
    const hack_lvl = 80;
    if (player.hacking_skill() < hack_lvl) {
        await study(ns, hack_lvl);
    }
    assert(player.hacking_skill() >= hack_lvl);
    // Join the faction provided we are currently not a member.
    const target = "Netburners";
    const joined_faction = player.faction();
    if (!joined_faction.includes(target)) {
        // Upgrading our Hacknet farm requires a huge amount of money.  Commit
        // crimes to boost our income.  Continue to commit crimes as long as we
        // have not yet received an invitation from the Netburners faction.
        let threshold = 2 * player.money();
        let invite = ns.singularity.checkFactionInvitations();
        while (!invite.includes(target)) {
            await commit_crime(ns, threshold);
            threshold = 2 * player.money();
            invite = ns.singularity.checkFactionInvitations();
        }
        ns.singularity.joinFaction(target);
    }
    const work_type = "Hacking Contracts";
    await work_and_buy(ns, target, work_type);
}

/**
 * All Augmentations we own and have already installed.
 *
 * @param ns The Netscript API.
 * @return A set of all Augmentations we own.
 */
function owned_augmentations(ns) {
    const purchased = false;
    return new Set(ns.singularity.getOwnedAugmentations(purchased));
}

/**
 * All pre-requisites of an Augmentation.  Include only pre-requisites we have
 * not yet purchased.
 *
 * @param ns The Netscript API.
 * @param aug A string representing the name of an Augmentation.
 * @return A map {a: cost} as follows:
 *
 *     (1) a := An Augmentation that is a pre-requisite of the given
 *         Augmentation.
 *     (2) cost := The cost of the given pre-requisite.
 *
 *     Return an empty map if the given Augmentation has no pre-requisites or
 *     we already purchased all of its pre-requisites.
 */
function prerequisites(ns, aug) {
    assert(!has_augmentation(ns, aug));
    const augment = new Map();
    const prereq = ns.singularity.getAugmentationPrereq(aug);
    if (0 == prereq.length) {
        return augment;
    }
    // A map {a: cost} of Augmentations and their respective costs.
    for (const a of prereq) {
        if (has_augmentation(ns, a)) {
            continue;
        }
        const cost = ns.singularity.getAugmentationPrice(a);
        augment.set(a, cost);
    }
    return augment;
}

/**
 * Purchase all Augmentations from a faction.
 *
 * @param ns The Netscript API.
 * @param fac We want to buy all Augmentations from this faction.
 */
async function purchase_augmentations(ns, fac) {
    assert(is_valid_faction(fac));
    const augment = augmentations_to_buy(ns, fac);
    if (0 == augment.size) {
        return;
    }
    // Below is our purchasing strategy.
    //
    // (1) Purchase the most expensive Augmentation first.
    // (2) If an Augmentation has a pre-requisite that we have not yet bought,
    //     purchase the pre-requisite first.
    while (augment.size > 0) {
        // Choose the most expensive Augmentation.
        const [aug, cost] = choose_augmentation(augment);
        if (has_augmentation(ns, aug)) {
            assert(augment.delete(aug));
            continue;
        }
        // If the most expensive Augmentation has no pre-requisites or we have
        // already purchased all of its pre-requisites, then purchase the
        // Augmentation.
        const prereq = prerequisites(ns, aug);
        if (0 == prereq.size) {
            await purchase_aug(ns, aug, cost, fac);
            assert(augment.delete(aug));
            continue;
        }
        // If the Augmentation has one or more pre-requisites we have not yet
        // purchased, then first purchase the pre-requisites.
        while (prereq.size > 0) {
            const [pre, price] = choose_augmentation(prereq);
            await purchase_aug(ns, pre, price, fac);
            assert(prereq.delete(pre));
        }
        await purchase_aug(ns, aug, cost, fac);
        assert(augment.delete(aug));
    }
}

/**
 * Purchase an Augmentation.
 *
 * @param ns The Netscript API.
 * @param aug We want to purchase this Augmentation.
 * @param cost The cost of the given Augmentation.
 * @param fac We want to purchase the given Augmentation from this faction.
 */
async function purchase_aug(ns, aug, cost, fac) {
    let success = false;
    const player = new Player(ns);
    while (!success) {
        assert(!has_augmentation(ns, aug));
        if (player.money() < cost) {
            await commit_crime(ns, cost);
        }
        success = ns.singularity.purchaseAugmentation(fac, aug);
    }
    assert(has_augmentation(ns, aug));
}

/**
 * Work for a company to raise our Charisma to a given amount.
 *
 * @param ns The Netscript API.
 * @param hack_lvl The minimum amount of Hack we must have.
 * @param threshold Continue working until our Charisma is at this level or
 *     higher.  Assume to be a positive integer.
 */
async function raise_charisma(ns, hack_lvl, threshold) {
    assert(threshold > 0);
    const city = "Sector-12";
    await visit_city(ns, city);
    const player = new Player(ns);
    assert(player.city() == city);
    // Ensure we have the minimum Hack stat.
    if (player.hacking_skill() < hack_lvl) {
        await study(ns, hack_lvl);
    }
    assert(player.hacking_skill() >= hack_lvl);
    // Work for a company as a software engineer until we have accumulated the
    // given amount of Charisma level.
    const company = "MegaCorp";
    const field = "Software";
    const focus = true;
    ns.singularity.applyToCompany(company, field);
    const t = new Time();
    const time = t.minute();
    while (player.charisma() < threshold) {
        ns.singularity.workForCompany(company, focus);
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}

/**
 * Raise each of our combat stats to a given level.  An easy way to raise our
 * combat stats is to join a faction and carry out field work for the faction.
 *
 * @param ns The Netscript API.
 * @param threshold Each of our combat stats should be raised to at least this
 *     value.  Must be a positive integer.
 */
async function raise_combat_stats(ns, threshold) {
    assert(threshold > 0);
    // Join a faction.
    const player = new Player(ns);
    const joined_faction = player.faction();
    const target = "MegaCorp";
    if (!joined_faction.includes(target)) {
        await await_invitation(ns, target);
        ns.singularity.joinFaction(target);
    }
    // Perform field work for the faction.
    const work_type = "Field Work";
    const focus = true;
    const t = new Time();
    const time = t.minute();
    while (
        (player.strength() < threshold)
            || (player.defense() < threshold)
            || (player.dexterity() < threshold)
            || (player.agility() < threshold)
    ) {
        ns.singularity.workForFaction(target, work_type, focus);
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}

/**
 * Raise our Hack stat.  Stop when our Hack stat is at least a given level.
 *
 * @param ns The Netscript API.
 * @param threshold We want our Hack stat to be at least this level.  Must be a
 *     positive integer.
 */
async function raise_hack(ns, threshold) {
    assert(threshold > 0);
    const player = new Player(ns);
    if (player.hacking_skill() >= threshold) {
        return;
    }
    // Join a faction.
    const joined_faction = player.faction();
    const target = "MegaCorp";
    if (!joined_faction.includes(target)) {
        await await_invitation(ns, target);
        ns.singularity.joinFaction(target);
    }
    // Carry out field work for the faction.
    const work_type = "Field Work";
    const focus = true;
    const t = new Time();
    const time = t.minute();
    while (player.hacking_skill() < threshold) {
        ns.singularity.workForFaction(target, work_type, focus);
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}

/**
 * Work at a company and rise to a top position via promotion.
 *
 * @param ns The Netscript API.
 */
async function rise_to_top(ns) {
    // Ensure we have the minimum Hack and Charisma stats.
    const player = new Player(ns);
    const hack_lvl = 250;
    const charisma_lvl = 250;
    assert(player.hacking_skill() >= hack_lvl);
    assert(player.charisma() >= charisma_lvl);
    // Work for the company in a business position.  Once in a while, apply for
    // a promotion until we reach the position of Chief Financial Officer.
    const company = "MegaCorp";
    const field = "Business";
    const focus = true;
    const target_job = "Chief Financial Officer";
    ns.singularity.applyToCompany(company, field);
    const t = new Time();
    const time = t.minute();
    while (player.job(company) != target_job) {
        ns.singularity.workForCompany(company, focus);
        await ns.sleep(time);
        ns.singularity.applyToCompany(company, field);
    }
    ns.singularity.stopAction();
}

/**
 * Join the Silhouette criminal organization.  The requirements for receiving
 * an invitation:
 *
 * (1) Must be a CTO, CFO, or CEO of a company.  An easy way to meet this
 *     requirement is to work our way up within a company.  Choose Megacorp in
 *     Sector-12.  Have at least 250 Hack.  Work a software job to raise our
 *     Charisma to at least 250.  Then apply for a business job.  Work the job
 *     and after a while apply for a promotion.  Rinse and repeat until we
 *     reach the level of CFO.  The promotion chain at Megacorp is: Business
 *     Intern, Business Manager, Operations Manager, Chief Financial Officer,
 *     Chief Executive Officer.
 * (2) Have at least $15m.
 * (3) Karma at -22 or lower.
 *
 * @param ns The Netscript API.
 */
async function silhouette(ns) {
    // Rise to a top position at a company.
    const hack_lvl = 250;
    const charisma_lvl = 250;
    await raise_charisma(ns, hack_lvl, charisma_lvl);
    await rise_to_top(ns);
    // Karma at -22 or lower.
    const karma = -22;
    const crime = "shoplift";
    const nkill = 0;
    await lower_karma(ns, karma, crime, nkill);
    // Have at least $15m.
    const m = new Money();
    const threshold = 15 * m.million();
    await work(ns, threshold);
    const faction = "Silhouette";
    const work_type = "Hacking Contracts";
    await join_work_and_buy(ns, faction, work_type);
}

/**
 * Join the criminal organization Slum Snakes.  The requirements for receiving
 * an invitation:
 *
 * (1) Each combat stat must be at least 30.  By now we should already have
 *     joined and purchased all megacorporation factions.  To raise our combat
 *     stats, we simply re-join one of these factions and carry out field work.
 * (2) Karma at or lower than -9.
 * (3) Have at least $1m.
 *
 * @param ns The Netscript API.
 */
async function slum_snakes(ns) {
    // Karma at -9 or lower.
    const karma = -9;
    const crime = "shoplift";
    const nkill = 0;
    await lower_karma(ns, karma, crime, nkill);
    // Each combat stat must be at least 30.
    const stat_threshold = 30;
    await raise_combat_stats(ns, stat_threshold);
    // Have at least $1m.
    const m = new Money();
    const money_threshold = m.million();
    await work(ns, money_threshold);
    const faction = "Slum Snakes";
    const work_type = "Field Work";
    await join_work_and_buy(ns, faction, work_type);
}

/**
 * Join the criminal organization Speakers for the Dead.  The requirements for
 * receiving an invitation:
 *
 * (1) At least 100 Hack.
 * (2) Each combat stat must be at least 300.
 * (3) Must have killed at least 30 people.
 * (4) Karma is at -45 or lower.
 * (5) Not working for CIA or NSA.
 *
 * @param ns The Netscript API.
 */
async function speakers_for_the_dead(ns) {
    // Karma at -45 or lower.
    const karma = -45;
    const crime = "homicide";
    const nkill = 30;
    await lower_karma(ns, karma, crime, nkill);
    // Each combat stat must be at least 300.
    const stat_threshold = 300;
    await raise_combat_stats(ns, stat_threshold);
    // Raise our Hack stat.
    const hack_threshold = 100;
    await raise_hack(ns, hack_threshold);
    const faction = "Speakers for the Dead";
    const work_type = "Field Work";
    await join_work_and_buy(ns, faction, work_type);
}

/**
 * Join the criminal organization Tetrads.  The requirements for receiving an
 * invitation:
 *
 * (1) Must be located in Chongqing, New Tokyo, or Ishima.
 * (2) Each combat stat must be at least 75.
 * (3) Karma is at -18 or lower.
 *
 * @param ns The Netscript API.
 */
async function tetrads(ns) {
    // Karma at -18 or lower.
    const karma = -18;
    const crime = "shoplift";
    const nkill = 0;
    await lower_karma(ns, karma, crime, nkill);
    // Each combat stat must be at least 75.
    const threshold = 75;
    await raise_combat_stats(ns, threshold);
    // Visit New Tokyo.
    const city = "New Tokyo";
    await visit_city(ns, city);
    const faction = "Tetrads";
    const work_type = "Field Work";
    await join_work_and_buy(ns, faction, work_type);
}

/**
 * Join the endgame faction The Covenant.  The requirements for receiving an
 * invitation:
 *
 * (1) Must have installed at least 20 Augmentations.
 * (2) Have at least $75b.
 * (3) At least 850 Hack.
 * (4) Each combat stat must be at least 850.
 *
 * @param ns The Netscript API.
 */
async function the_covenant(ns) {
    // Ensure we have already installed at least 20 Augmentations.
    const augment = owned_augmentations(ns);
    assert(augment.size >= 20);
    // Have at least $75b.
    const m = new Money();
    const threshold = 75 * m.billion();
    await work(ns, threshold);
    // At least 850 Hack.
    const stat_lvl = 850;
    await raise_hack(ns, stat_lvl);
    // Each combat stat at least 850.
    await raise_combat_stats(ns, stat_lvl);
    const faction = "The Covenant";
    const work_type = "Hacking Contracts";
    await join_work_and_buy(ns, faction, work_type);
}

/**
 * Join the criminal organization The Dark Army.  The requirements for
 * receiving an invitation:
 *
 * (1) At least 300 Hack.
 * (2) Each combat stat must be at least 300.
 * (3) Must be located in Chongqing.
 * (4) Must have killed at least 5 people.
 * (5) Karma at -45 or lower.
 * (6) Not working for CIA or NSA.
 *
 * @param ns The Netscript API.
 */
async function the_dark_army(ns) {
    // Raise our Hack and combat stats.
    const threshold = 300;
    await raise_hack(ns, threshold);
    await raise_combat_stats(ns, threshold);
    // Karma at -45 or lower.
    const karma = -45;
    const crime = "homicide";
    const nkill = 5;
    await lower_karma(ns, karma, crime, nkill);
    // Visit Chongqing.
    const city = "Chongqing";
    await visit_city(ns, city);
    const faction = "The Dark Army";
    const work_type = "Field Work";
    await join_work_and_buy(ns, faction, work_type);
}

/**
 * Join the criminal organization The Syndicate.  The requirements for
 * receiving an invitation:
 *
 * (1) At least 200 Hack.
 * (2) Each combat stat must be at least 200.
 * (3) Must be located in Aevum or Sector-12.
 * (4) Have at least $10m.
 * (5) Karma at -90 or lower.
 * (6) Not working for CIA or NSA.
 *
 * @param ns The Netscript API.
 */
async function the_syndicate(ns) {
    // Raise our Hack and combat stats.
    const threshold = 200;
    await raise_hack(ns, threshold);
    await raise_combat_stats(ns, threshold);
    // Karma at -90 or lower.
    const karma = -90;
    const crime = "homicide";
    const nkill = 5;
    await lower_karma(ns, karma, crime, nkill);
    // Have at least $10m.
    const m = new Money();
    const money_threshold = 10 * m.million();
    await work(ns, money_threshold);
    // Visit Sector-12.
    const city = "Sector-12";
    await visit_city(ns, city);
    const faction = "The Syndicate";
    const work_type = "Field Work";
    await join_work_and_buy(ns, faction, work_type);
}

/**
 * Join the early game faction Tian Di Hui.  Requirements for receiving an
 * invitation:
 *
 * (1) Have at least $1m.
 * (2) At least 50 Hack.
 * (3) Located in Chongqing, New Tokyo, or Ishima.
 *
 * @param ns The Netscript API.
 */
async function tian_di_hui(ns) {
    // First, ensure we have at least the required Hack stat.
    const hack_lvl = 50;
    const player = new Player(ns);
    if (player.hacking_skill() < hack_lvl) {
        await study(ns, hack_lvl);
    }
    assert(player.hacking_skill() >= hack_lvl);
    // Travel to Ishima and wait for our income to be at least $1m.
    const city = "Ishima";
    await visit_city(ns, city);
    const m = new Money();
    const threshold = m.million();
    if (player.money() < threshold) {
        await commit_crime(ns, threshold);
    }
    const faction = "Tian Di Hui";
    const work_type = "Hacking Contracts";
    await join_work_and_buy(ns, faction, work_type);
}

/**
 * The total amount of reputation points we need to earn in order to purchase
 * all Augmentations from a faction.
 *
 * @param ns The Netscript API.
 * @param fac We want to earn reputation points from this faction.
 * @return The maximum amount of reputation points we must earn from a faction.
 */
function total_reputation(ns, fac) {
    // A list of Augmentations from the faction.  Filter out those
    // Augmentations we already own.
    const my_aug = owned_augmentations(ns);
    let fac_aug = ns.singularity.getAugmentationsFromFaction(fac);
    fac_aug = fac_aug.filter(a => !my_aug.has(a));
    // Calculate the total reputation points we need to earn.
    let max = 0;
    for (const aug of fac_aug) {
        const rep = ns.singularity.getAugmentationRepReq(aug);
        if (max < rep) {
            max = rep;
        }
    }
    return max;
}

/**
 * Travel to a city.
 *
 * @param ns The Netscript API.
 * @param city We want to travel to this city.
 */
async function visit_city(ns, city) {
    const player = new Player(ns);
    if (player.city() == city) {
        return;
    }
    const t = new Time();
    const time = 5 * t.second();
    let success = ns.singularity.travelToCity(city);
    while (!success) {
        await ns.sleep(time);
        success = ns.singularity.travelToCity(city);
    }
}

/**
 * Work to boost our income.  Stop working when we have accumulated a given
 * amount of money.
 *
 * @param ns The Netscript API.
 * @param threshold Continue working as long as our money is less than this
 *     threshold.
 */
async function work(ns, threshold) {
    const player = new Player(ns);
    if (player.money() >= threshold) {
        return;
    }
    const hack_lvl = 250;
    const charisma_lvl = hack_lvl;
    assert(player.hacking_skill() >= hack_lvl);
    // Work for a company until our money is at least the given threshold.
    // Every once in a while, apply for a promotion to earn more money per
    // second.  By default, we work a business job.  However, if our Charisma
    // level is low, work a software job instead to raise our Charisma.
    const company = "MegaCorp";
    let field = "Business";
    if (player.charisma() < charisma_lvl) {
        field = "Software";
    }
    const focus = true;
    ns.singularity.applyToCompany(company, field);
    const t = new Time();
    const time = t.minute();
    while (player.money() < threshold) {
        ns.singularity.workForCompany(company, focus);
        await ns.sleep(time);
        ns.singularity.applyToCompany(company, field);
    }
    ns.singularity.stopAction();
}

/**
 * Work for a faction to earn reputation points.  Wait until we have enough
 * reputation points to purchase all Augmentations from the faction.
 *
 * @param ns The Netscript API.
 * @param fac The name of a faction.
 * @param work_type The type of work to carry out for the given faction.
 *     Either "Hacking Contracts" or "Field Work".
 */
async function work_and_buy(ns, fac, work_type) {
    await work_for_faction(ns, fac, work_type);
    await purchase_augmentations(ns, fac);
}

/**
 * Work for a company.  Stop working when we have accumulated a given amount of
 * reputation points.
 *
 * @param ns The Netscript API.
 * @param company We want to work for this company.
 * @param rep Work for the company to earn this amount of reputation points.
 */
async function work_for_company(ns, company, rep) {
    // Ensure we have the minimum Hack stat.
    const hack_lvl = 250;
    const player = new Player(ns);
    if (player.hacking_skill() < hack_lvl) {
        await study(ns, hack_lvl);
    }
    assert(player.hacking_skill() >= hack_lvl);
    // Work for the company as a software engineer until we have accumulated
    // the given amount of reputation points.  Occasionally apply for a
    // promotion to earn even more reputation points per second.
    const field = "Software";
    const focus = true;
    ns.singularity.applyToCompany(company, field);
    const t = new Time();
    const time = t.minute();
    while (ns.singularity.getCompanyRep(company) < rep) {
        ns.singularity.workForCompany(company, focus);
        await ns.sleep(time);
        ns.singularity.applyToCompany(company, field);
    }
    ns.singularity.stopAction();
}

/**
 * Work for a faction.  Stop working when we have accumulated enough reputation
 * points to purchase all Augmentations from the faction.
 *
 * @param ns The Netscript API.
 * @param fac We want to work for this faction.
 * @param work_type The type of work to carry out for the given faction.
 *     Either "Hacking Contracts" or "Field Work".
 */
async function work_for_faction(ns, fac, work_type) {
    assert(is_valid_faction(fac));
    assert(("Hacking Contracts" == work_type) || ("Field Work" == work_type));
    const threshold = total_reputation(ns, fac);
    const focus = true;
    const t = new Time();
    const time = t.minute();
    while (ns.singularity.getFactionRep(fac) < threshold) {
        ns.singularity.workForFaction(fac, work_type, focus);
        await ns.sleep(time);
    }
    ns.singularity.stopAction();
}

/**
 * WARNING: This script requires a huge amount of RAM because it uses many
 * functions from the Singularity API.  To reduce the RAM cost of this script,
 * destroy BN4.2 and BN4.3.
 *
 * Join a faction and purchase all of its Augmentations.
 *
 * Usage: run singularity/faction.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Suppress various log messages.
    ns.disableLog("sleep");

    await choose_faction(ns);
    // The next script in the load chain.
    const script = "/singularity/home.js";
    const nthread = 1;
    ns.exec(script, home, nthread);
}
