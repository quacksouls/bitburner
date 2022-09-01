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

/**
 * The tree structure of the directory quacksouls/bitburner/02 on github.com.
 */
function dir_structure() {
    const dir = [
        "buy-server.js",
        "hack.js"
    ];
    return dir;
}

/**
 * Pull all files (on github.com) under the directory
 * quacksouls/bitburner/02 into the game.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const home = "home";
    const github = "https://raw.githubusercontent.com/";
    const prefix = github + "quacksouls/bitburner/main/02/";
    for (const f of dir_structure()) {
        const file = prefix + f;
        ns.tprint(file);
        await ns.wget(file, f, home);
    }
}
