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

// A bunch of constant values related to servers in the game world.  We exclude
// purchased servers.

/**
 * The home server of the player.
 */
export const home = "home";

/**
 * Various thresholds related to our home server.
 */
export const home_t = {
    /**
     * The maximum number of Cores on the home server.  This is not necessarily
     * the greatest number of Cores the home server can have.  Use this
     * constant to help us decide whether to upgrade our home server any
     * further.
     */
    CORE: 4,
    /**
     * The maximum amount of RAM on the home server.  This is not necessarily
     * the largest amount of RAM the home server can have.  Use this constant
     * to help us decide whether to upgrade our home server any further.
     */
    RAM: 262144, // 2^18
    /**
     * The minimum amount of RAM for a high-end home server.
     */
    RAM_HIGH: 512,
    /**
     * The minimum amount of RAM for a high-end home server, assuming that we
     * have level 2 of "Source-File 4: The Singularity".
     */
    RAM_HUGE: 1024,
    /**
     * The minimum amount of RAM for a high-end home server, assuming that we
     * have level at most 1 of "Source-File 4: The Singularity".
     */
    RAM_MASSIVE: 2048,
    /**
     * The minimum amount of RAM for a mid-sized home server.
     */
    RAM_MID: 128,
    /**
     * Reserve various amounts of RAM on the home server.
     */
    reserve: {
        /**
         * By default, we reserve this amount of RAM on the home server.
         */
        DEFAULT: 64,
        /**
         * If our home server is high-end or better, reserve this amount of RAM.
         */
        HIGH: 512,
        /**
         * If we have only level 2 of "Source-File 4: The Singularity".
         */
        HUGE: 1024,
        /**
         * If we have only level 1 of "Source-File 4: The Singularity".
         */
        MASSIVE: 2048,
        /**
         * If our home server is mid-end or thereabout, reserve this amount of
         * RAM.
         */
        MID: 128,
    },
};

/**
 * Various constants related to a server.
 */
export const server = {
    /**
     * The server joesguns.
     */
    JOES: "joesguns",
    /**
     * The name of a text file.  The file contains the hostname of the server we
     * are currently targetting.  We use our home RAM to hack the target.
     */
    HRAM: "hram.txt",
    /**
     * The server n00dles.
     */
    NOODLES: "n00dles",
    /**
     * The darkweb server, accessible after purchasing the Tor router.
     */
    ONION: "darkweb",
    /**
     * The server phantasy.
     */
    PHANTASY: "phantasy",
    /**
     * The name of a text file.  If a file with the given name appears on our
     * home server, then it means one of the following:
     *
     * (1) We are sharing our home server with a faction.  Doing so boosts our
     *     reputation gain within the faction.
     * (2) We want to suspend the most RAM intensive script in order to free up
     *     some RAM on the home server.
     */
    SHARE: "share.txt",
    /**
     * The name of the script for sharing our home server with a faction.
     */
    SHARE_SCRIPT: "share.js",
    /**
     * The w0r1d_d43m0n server.
     */
    WD: "w0r1d_d43m0n",
};

/**
 * Various thresholds related to servers.
 */
export const server_t = {
    /**
     * The number of low-end servers to target.  This number means we target n
     * servers that have the lowest Hack stat requirement.  This number is
     * divided into various tiers.  We use each tier, depending on various
     * criteria.
     */
    lowend: {
        LOW: 1,
        MID: 2,
        HIGH: 3,
    },
};
