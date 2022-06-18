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

import { assert } from "./libbnr.js";

/**
 * Trace out a ring inside a 2-D matrix.
 *
 * @param m A 2-D matrix, represented as an array of arrays.
 * @param [tlr, tlc] The coordinates of the top-left element of the ring.
 *     "r" and "c" mean row and column, respectively.
 * @param [brr, brc] The coordinates of the bottom-right element of the ring.
 *     "r" and "c" mean row and column, respectively.
 */
function ring(m, tlr, tlc, brr, brc) {
    // Left to right.
    let array = m[tlr];
    let elem = Array.from(array.slice(tlc, brc + 1));
    if (tlr == brr) {
        return elem;
    }
    // Top to bottom.
    for (let r = tlr + 1; r <= brr; r++) {
        elem.push(m[r][brc]);
    }
    // Right to left.
    array = m[brr];
    let arr = Array.from(array.slice(tlc, brc));
    elem = elem.concat(arr.reverse());
    // Bottom to top.
    arr = new Array();
    for (let r = tlr + 1; r < brr; r++) {
        arr.push(m[r][tlc]);
    }
    elem = elem.concat(arr.reverse());
    return elem;
}

/**
 * The elements of a 2-D matrix in spiral order, going in clockwise direction.
 *
 * @param m A 2-D matrix, represented as an array of arrays.
 * @return An array rerepsenting the elements of the matrix in spiral order.
 */
function spiral(m) {
    // Sanity checks.
    assert(m.length > 0);
    const array = m[0];
    const nrow = m.length;
    const ncol = array.length;
    for (const a of m) {
        // Ensure each row has the same number of elements.
        assert(a.length > 0);
        assert(ncol == a.length);
    }

    let tlr = 0;         // top-left row
    let tlc = tlr;       // top-left column
    let brr = nrow - 1;  // bottom-right row
    let brc = ncol - 1;  // bottom-right column
    let elem = new Array();
    while (tlr <= brr) {
        elem = elem.concat(ring(m, tlr, tlc, brr, brc));
        tlr++;
        tlc++;
        brr--;
        brc--;
    }
    return elem;
}

/**
 * Spiralize Matrix: Given an array of array of numbers representing a 2D
 * matrix, return the elements of that matrix in clockwise spiral order.
 *
 * Output the elements of a 2-D matrix in spiral order, going in clockwise
 * direction.
 *
 * Usage: run cct-spiral.js [cct] [hostName]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The host name of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const matrix = ns.codingcontract.getData(cct, host);
    const array = spiral(matrix);
    assert(ns.codingcontract.attempt(array.toString(), cct, host));
}
