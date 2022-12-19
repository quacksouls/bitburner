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
 * The bases for various number systems.
 */
export const base = {
    /**
     * The base of the binary number system.
     */
    BINARY: 2,
    /**
     * The base of the decimal number system.
     */
    DECIMAL: 10,
};

/**
 * Use ANSI escape codes to add colour.  Refer to this page for more details:
 *
 * https://www.lihaoyi.com/post/BuildyourownCommandLinewithANSIescapecodes.html
 */
export const colour = {
    DARK_GREEN: "\u001b[38;5;22m",
    GREEN: "\u001b[32m",
    RED: "\u001b[31m",
    RESET: "\u001b[0m",
};

/**
 * Various constants related to the dark web.
 */
export const darkweb = {
    /**
     * Constants related to various programs that can be purchased via the dark
     * web.  The cost data are taken from this file:
     *
     * https://github.com/bitburner-official/bitburner-src/blob/dev/src/DarkWeb/DarkWebItems.ts
     */
    program: {
        brutessh: {
            COST: 500e3,
        },
    },
    /**
     * The Tor router.
     */
    tor: {
        /**
         * Cost of the Tor router.  Data from this file:
         *
         * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Constants.ts
         */
        COST: 200e3,
    },
};

/**
 * Various constants in the model of hack/grow/weaken (HGW).
 */
export const hgw = {
    /**
     * Various actions in the HGW model.
     */
    action: {
        GROW: "grow",
        HACK: "hack",
        WEAKEN: "weaken",
    },
    /**
     * Wait this extra amount of time in milliseconds when we perform an HGW
     * action.
     */
    BUFFER_TIME: 100,
    /**
     * The fraction amount of money to steal from a server.  If it is 0.5, then
     * we steal 50% of the server's money.
     */
    MONEY_PERCENT: 0.5,
    /**
     * Various scripts in the HGW model.
     */
    script: {
        /**
         * The grow script.  Use this script to grow money on a server.
         */
        GROW: "/hgw/grow.js",
        /**
         * The hack script.  Use this script to hack a server.
         */
        HACK: "/hgw/hack.js",
        /**
         * The weaken script.  Use this script to lower the security of a
         * server.
         */
        WEAKEN: "/hgw/weaken.js",
    },
    /**
     * Various strategies for preparing a server.
     */
    strategy: {
        /**
         * Grow first, followed by weaken.  Repeat in a loop.
         */
        GW: "gw",
        /**
         * Get a server to maximum money first.  Then repeatedly weaken the
         * server.
         */
        MGW: "mgw",
        /**
         * Get a server to minimum security first.  Then apply the strategy GW.
         */
        MWG: "mwg",
        /**
         * Weaken first, followed by grow.  Repeat in a loop.
         */
        WG: "wg",
    },
};

/**
 * Always have this amount of money in reserve.  When engaging in any
 * purchasing activities, we do not want to spend all our money.  We spend only
 * if doing so would leave us with at least this amount of money left over.
 */
export const money_reserve = 50e6;

/**
 * The hack script.  This script is used for hacking a server.
 */
export const script = "hack.js";

/**
 * The minimum required Hack stat to enable a player to work at most companies.
 */
export const work_hack_lvl = 250;
