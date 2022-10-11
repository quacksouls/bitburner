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
 * The home server of the player.
 */
export const home = "home";

/**
 * Always have this amount of money in reserve.  When engaging in any
 * purchasing activities, we do not want to spend all our money.  We spend only
 * if doing so would leave us with at least this amount of money left over.
 */
export const money_reserve = 50 * 10 ** 6;

/**
 * The hack script.  This script is used for hacking a server.
 */
export const script = "hack.js";

/**
 * The Stock Market updates approximately every 6 seconds.
 */
export const stock_tick = 6000;
