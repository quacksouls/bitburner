/**
 * Copyright (C) 2022--2023 Duck McSouls
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

import { Player } from "/quack/lib/player.js";

/**
 * Delete all purchased servers.  This would also kill all scripts running
 * on each purchased server.
 *
 * Usage: run quack/kill-server.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const player = new Player(ns);
    player.pserv().forEach((s) => {
        ns.killall(s);
        ns.deleteServer(s);
    });
}
