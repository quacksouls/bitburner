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

import { home } from "/lib/constant/server.js";

/**
 * Decide which criminal faction to join.  Our goal is to create a gang within
 * a criminal organization.  We can create a criminal gang within any of the
 * following criminal organizations:
 *
 * (1) Slum Snakes
 * (2) Tetrads
 * (3) The Syndicate
 * (4) The Dark Army
 * (5) Speakers for the Dead
 *
 * Slum Snakes has the lowest requirements for sending a faction invitation.
 * This fits well with BN2 because in that BitNode we only need to join a
 * criminal faction and then would be allowed to create a gang.  Thus, if we
 * are in BN2 we should join Slum Snakes as early as possible and then create
 * our gang.  In BitNodes other than BN2, we must satisfy 2 requirements to
 * create a gang:
 *
 * (1) Our karma must be -54,000 or lower.
 * (2) Satisfy the requirements for receiving an invitation from a criminal
 *     faction.
 *
 * Thus, in BitNodes other than BN2, we should lower our karma as quickly as
 * possible.  By the time our negative karma is at -54,000 or lower, it is
 * likely that we would have also satisfied the requirements to join one of the
 * other factions listed above.  We might be tempted to join Speakers for the
 * Dead and create our criminal gang within that faction.  One reason is that
 * Speakers for the Dead has the highest power multiplier of all criminal
 * factions:
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/power.ts
 *
 * The Black Hand has the same power multiplier as Speakers for the Dead.
 * These are the only 2 factions with the highest power multipliers.  Why
 * should we create our gang within any of these 2 factions?  The power
 * multiplier affects only NPC gangs, not the gang we create.  The higher is
 * the power multiplier of an NPC gang, the quicker would its power rise.
 * Creating a gang within either of the above 2 factions means we would only
 * need to worry about catching up with the power of the other powerful NPC
 * gang.  However, this can be a problem because the most powerful NPC gang
 * would devour the other less powerful NPC gangs and easily take over their
 * territories.  If we have 2 powerful NPC gangs, i.e. Speakers for the Dead
 * and The Black Hand, they can duke it out amongst themselves.  They might
 * swallow up the territories of other weaker NPC gangs, but when these 2
 * powerful gangs fight amongst themselves it can take a long time for one of
 * them to be vanguished.
 *
 * Anyway, join Slum Snakes regardless of the BitNode we are in.
 *
 * Usage: run gang/go.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Regardless of the BitNode we are in, join Slum Snakes and set up our
    // gang within that faction.
    const script = "/gang/slum-snakes.js";
    const nthread = 1;
    ns.exec(script, home, nthread);
    // If we want, we can create a criminal gang within Speakers for the Dead.
    // Note that it can take a very long time to satisfy all requirements for
    // joining this faction and setting up a gang within that faction.
    // const script = "/gang/dead-speakers.js";
    // ns.exec(script, home, nthread);
}
