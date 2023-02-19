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

// Miscellaneous helper functions relating to random number generations.

import { assert } from "/quack/lib/util.js";

/**
 * A random integer between a minimum a and a maximum b, inclusive.  Code is
 * adapted from
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 *
 * @param a The minimum integer value.
 * @param b The maximum integer value.
 * @return A random integer in the range [a, b], inclusive.  The returned
 *     integer can be the given minimum or the given maximum.
 */
export function random_integer(a, b) {
    const min = Math.ceil(a);
    const max = Math.floor(b);
    const n = Math.floor(Math.random() * (max - min + 1) + min);
    assert(a <= n);
    assert(n <= b);
    return n;
}
