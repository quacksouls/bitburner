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

import { log_cct_failure, print_error, print_success } from "/quack/lib/cct.js";
import { base } from "/quack/lib/constant/misc.js";
import { assert, is_empty_string } from "/quack/lib/util.js";

/**
 * All valid mathematical expressions, each of which evaluates to a target
 * number.  Each expression results from inserting zero, one, or more of the
 * following operators between decimal digits: addition (+), subtraction (-),
 * multiplication (*).
 *
 * @param {string} digit A string of decimal digits.  Cannot be empty.
 * @param {number} target An expression must evaluate to this number.
 * @returns {array<string>} An array of strings, each of which is an expression
 *     that evaluates to the target number.
 */
function all_expressions(digit, target) {
    assert(!is_empty_string(digit));
    return Array.from(expressions(digit, target));
}

/**
 * Generate all mathematical expressions that evaluate to a target value.  An
 * expression can use each of these symbols zero, one, or more times:
 *
 * (1) addition (+)
 * (2) subtraction (-)
 * (3) multiplication (*)
 *
 * The algorithm is due to Janne Karila, who provided a Python implementation at
 *
 * https://codereview.stackexchange.com/a/163303
 *
 * This generator function is a JavaScript translation of Karila's Python code.
 *
 * @param {string} digit A string containing a bunch of decimal digits.
 * @param {number} target Any mathematical expression created from the given
 *     digits must evaluate to this number.
 * @param {number} k The multiplication factor.
 */
function* expressions(digit, target, k = 1) {
    for (let i = 1; i < digit.length; i++) {
        // For any given index i in the digit string, we split the string into
        // 2 parts:
        //
        // (1) left := The left part of the digit string consists of all digits
        //     from index 0 up to and including index i - 1.  We can think of
        //     the left part as already been evaluated, searched, or
        //     considered.  The left part is therefore the prefix upon which
        //     new expressions can be built.
        // (2) right := The right part of the digit string consists of all
        //     digits from index i onward.  Think of the right part as digits
        //     we have yet to consider.  We use digits in the right part to
        //     construct longer expressions based upon the left part.
        const left = digit.slice(0, i);
        const right = digit.slice(i);
        const n = k * parseInt(left, base.DECIMAL);
        for (const e of expressions(right, target, n)) {
            yield `${left}*${e}`;
        }
        for (const e of expressions(right, target - n)) {
            yield `${left}+${e}`;
        }
        for (const e of expressions(right, target - n, -1)) {
            yield `${left}-${e}`;
        }
        // Do we have a leading zero?
        if (left === "0") {
            return;
        }
    }
    if (k * parseInt(digit, base.DECIMAL) === target) {
        yield digit;
    }
}

/**
 * Find All Valid Math Expressions: You are given an array containing two
 * elements.  The first element is a string that contains only digits between
 * 0 and 9.  The second element is a target number.  Return all possible ways
 * you can add the +, -, and * operators to the string of digits such that it
 * evaluates to the target number.  The answer should be provided as an array
 * of strings containing the valid expressions.
 * NOTE: Numbers in an expression cannot have leading 0s.
 * NOTE: The order of evaluation expects script operator precedence.
 *
 * Example 1:
 * Input: digits = "123", target = 6
 * Output: [1+2+3, 1*2*3]
 *
 * Example 2:
 * Input: digits = "105", target = 5
 * Output: [1*0+5, 10-5]
 *
 * In Example 1, we have two possible valid solutions.  Note that the
 * expression "1*-2*-3" also evaluates to 6.  From the problem description, we
 * infer the following restrictions on any solution we output.
 *
 * (1) Each decimal digit is non-negative.
 * (2) We are not allowed to flip the sign of a digit.  For example, in the
 *     expression "1*-2*-3" we flipped the sign of the digit "2" from positive
 *     to negative.  Thus the expression "1*-2*-3" is an invalid solution,
 *     although it evaluates to the target number.
 * (3) We are not allowed to insert the operator "-" at index 0 of the digit
 *     string.
 * (4) The digit string does not have "0" at index 0.
 * (5) An operand can be zero, but it cannot have a leading zero.  For example,
 *     an expression such as "1+0+3" is accepted, but the expression "1+03" is
 *     invalid because the operand "03" has a leading zero.
 *
 * Usage: run quack/cct/maths.js [cct] [hostname]
 *
 * @param {NS} ns The Netscript API.
 */
export async function main(ns) {
    const [cct, host] = ns.args;

    // Solve the coding contract.
    const [string, target] = ns.codingcontract.getData(cct, host);
    const solution = all_expressions(string, target);
    const result = ns.codingcontract.attempt(solution, cct, host);

    // Log the result in case of failure.
    if (is_empty_string(result)) {
        const log = "/quack/cct/maths.txt";
        const data = `${string}, ${target}`;
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
