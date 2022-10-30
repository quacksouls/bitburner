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
 * Decorate a custom line with our favourite colour.
 *
 * @param str We want to display this line in the HUD.  The line is represented
 *     as a string.
 * @param colour We want to use this colour to print the given line.  The colour
 *     string should be given as a Unicode escape sequence.  Refer to this page
 *     for more details:
 *     https://www.lihaoyi.com/post/BuildyourownCommandLinewithANSIescapecodes.html
 * @return The given line coloured using the given colour.
 */
function decorate(str, colour) {
    const reset = "\u001b[0m";
    return `${colour}${str}${reset}`;
}

/**
 * Add custom fields to the HUD.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // eslint-disable-next-line no-eval
    const doc = eval("document");
    const hook0 = doc.getElementById("overview-extra-hook-0");
    const hook1 = doc.getElementById("overview-extra-hook-1");
    // A 1 second update interval
    const time = 1000;
    for (;;) {
        try {
            // Custom numbers we want to display.  To add another custom field,
            // follow this format:
            //
            // header.push(headerName);
            // value.push(formattedValue);
            //
            // Here, "headerName" is a label that appears on the left.  The
            // label should be a word that tells us the meaning of the number on
            // the right.  Furthermore, "formattedValue" is a number formatted
            // in some way by using the function ns.nFormat(), which is a
            // wrapper of numeral.js.
            const header = [];
            const value = [];
            // The current negative karma value.
            header.push("Karma");
            value.push(ns.nFormat(ns.heart.break(), "0,0.00"));
            // The Hack XP of all scripts per second.
            header.push("Hack XP");
            value.push(ns.nFormat(ns.getTotalScriptExpGain(), "0,0.00"));
            // The income of all scripts per second.
            header.push("Income");
            value.push(ns.nFormat(ns.getTotalScriptIncome()[0], "$0,0.00"));
            // Apply line breaks (newline characters) to separate each custom
            // field.
            hook0.innerText = header.join("\n");
            hook1.innerText = value.join("\n");
        } catch (e) {
            // Use Unicode escape code to add colour.
            const red = "\u001b[31m";
            ns.print(decorate(`No update: ${String(e)}`, red));
        }
        await ns.sleep(time);
        // Make sure to clean up after ourselves.
        ns.atExit(() => {
            hook0.innerHTML = "";
            hook1.innerHTML = "";
        });
    }
}
