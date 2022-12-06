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
 * Hackish way to implement shell scripting in Bitburner.
 *
 * @param cmd A string containing the Terminal commands we want to run.
 */
function shell(cmd) {
    const input = globalThis["document"].getElementById("terminal-input"); // eslint-disable-line
    input.value = cmd;
    const handler = Object.keys(input)[1];
    input[handler].onChange({
        target: input,
    });
    input[handler].onKeyDown({
        key: "Enter",
        preventDefault: () => null,
    });
}

/**
 * Simulate Terminal input.  This is like a convoluted way to implement shell
 * scripting in the game.
 *
 * Usage: run terminal.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    ns.tprint("Simulate Terminal input.");
    shell("connect n00dles; analyze");
}
