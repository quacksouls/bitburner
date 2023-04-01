/**
 * Copyright (C) 2023 Duck McSouls
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

/// ///////////////////////////////////////////////////////////////////////
// A bunch of constant values related to programs that can be created or bought
// via the dark web.
/// ///////////////////////////////////////////////////////////////////////

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
            NAME: "BruteSSH.exe",
        },
        formulas: {
            NAME: "Formulas.exe",
        },
        ftpcrack: {
            COST: 1.5e6,
            NAME: "FTPCrack.exe",
        },
        httpworm: {
            COST: 30e6,
            NAME: "HTTPWorm.exe",
        },
        relaysmtp: {
            COST: 5e6,
            NAME: "relaySMTP.exe",
        },
        sqlinject: {
            COST: 250e6,
            NAME: "SQLInject.exe",
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
