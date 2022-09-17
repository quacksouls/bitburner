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

// Various constant values related to Coding Contracts.

/**
 * The time in milliseconds required for the game to randomly generate a random
 * Coding Contract on a random server, while in game.  While the game is
 * running, the probability for a Coding Contract to be spawned is 0.25.  Each
 * game cycle is 200 milliseconds.  The game randomly generates a Coding
 * Contract once every 3000 cycles.  Thus once every 200 x 3000 = 600000
 * milliseconds, or every 10 minutes, we have 25% chance for a Coding Contract
 * to spawn on a server.  These constants are taken from
 *
 * https://github.com/danielyxie/bitburner/blob/dev/src/engine.tsx
 */
export const cct_update_interval = 600000;
