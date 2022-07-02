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

import { assert, log_cct_failure, matrix_to_string } from "./libbnr.js";

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
    // Top-left to top-right.
    let array = new Array();
    let elem = new Array();
    if (tlc <= brc) {
        array = m[tlr];
        elem = Array.from(array.slice(tlc, brc + 1));
    }
    // Is this a matrix of one row?
    if (tlr == brr) {
        return elem;
    }
    // Top-right to bottom-right.
    if (tlr < brr) {
        for (let r = tlr + 1; r <= brr; r++) {
            elem.push(m[r][brc]);
        }
    }
    // Do we have a matrix of one column?
    if (tlc == brc) {
        return elem;
    }
    // Bottom-right to bottom-left.
    if (tlc < brc) {
        array = m[brr];
        const arr = Array.from(array.slice(tlc, brc));
        elem = elem.concat(arr.reverse());
    }
    // Bottom-right to top-right.
    if (tlr < brr) {
        const arr = new Array();
        for (let r = tlr + 1; r < brr; r++) {
            arr.push(m[r][tlc]);
        }
        elem = elem.concat(arr.reverse());
    }
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
    // The spiral order of a matrix.
    let tlr = 0;         // top-left row
    let tlc = tlr;       // top-left column
    let brr = nrow - 1;  // bottom-right row
    let brc = ncol - 1;  // bottom-right column
    let elem = new Array();
    while ((tlr <= brr) && (tlc <= brc)) {
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
 * Usage: run spiral.js [cct] [hostname]
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
    const result = ns.codingcontract.attempt(
        spiral(matrix), cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/spiral.txt";
        const data = matrix_to_string(matrix);
        await log_cct_failure(ns, log, cct, host, data);
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
