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

import { log_cct_failure, print_error, print_success } from "/lib/cct.js";
import { Time } from "/lib/time.js";
import { assert } from "/lib/util.js";

/**
 * All valid mathematical expressions, each of which evaluates to a target
 * number.  Each expression results from inserting zero, one, or more of the
 * following operators between decimal digits: addition (+), subtraction (-),
 * multiplication (*).
 *
 * @param ns The Netscript API.
 * @param string A string of decimal digits.  Cannot be empty.
 * @param target An expression must evaluate to this number.
 * @return An array of strings, each of which is an expression that evaluates
 *     to the target number.
 */
async function all_expressions(ns, string, target) {
    assert(string.length > 0);
    // We try all possibilities.  Each partial solution is an array [i, expr]
    // as follows:
    //
    // (1) i := The highest index in the partial expression expr where an
    //     operator can be found.  If i < 0, then we have not inserted any
    //     operators into expr.
    // (2) expr := A partial expression, represented as a string.
    const stack = new Array();
    const solution = new Array();
    stack.push([-1, string]);
    const t = new Time();
    const time = t.millisecond();
    while (stack.length > 0) {
        // Create new expressions by inserting different operators at all
        // possible positions.
        const [i, expr] = stack.pop();
        const newexpr = insert_operators(expr, i);
        // No new expressions can be created from the given expression.
        if (0 == newexpr.length) {
            continue;
        }
        // Test each new expression to see whether it evaluates to the target
        // number.
        for (let j = 0; j < newexpr.length; j++) {
            const [idx, expression] = newexpr[j];
            stack.push([idx, expression]);
            if (!has_leading_zero(expression)
                && (target == evaluate(expression))
               ) {
                solution.push(expression);
            }
        }
        await ns.sleep(time);
    }
    return [...new Set(solution)];
}

/**
 * Evaluate a mathematical expression.
 *
 * @param str A string representation of a mathematical expression.
 * @return The value of the given mathematical expression.
 */
function evaluate(str) {
    return Function(`"use strict"; return (${str})`)();
}

/**
 * Whether an operand in an expression has a leading zero.  An operand can be
 * zero itself.  However, if an operand is made up of multiple digits, then the
 * very first digit cannot be zero.  For example, the expression "1+0-2" is
 * accepted because we have an operand that is zero.  However, the expression
 * "1+02" is invalid because the operand "02" has a leading zero.
 *
 * @param expr An expression represented as a string.  Cannot be an empty
 *     string.
 * @return true if an operand in the given expression has a leading zero;
 *     false otherwise.
 */
function has_leading_zero(expr) {
    assert(expr.length > 0);
    assert("0" != expr[0]);
    const whitespace = " ";
    let newexpr = new String(expr);
    for (const op of operators()) {
        newexpr = newexpr.replaceAll(op, whitespace);
    }
    const digit = newexpr.split(whitespace);
    for (const d of digit) {
        if (("0" == d[0]) && (d.length > 1)) {
            return true;
        }
    }
    return false;
}

/**
 * Insert all possible operators at each possible index.
 *
 * @param expr An expression, represented as a string.  Cannot be an empty
 *     string.
 * @param i The highest index in expr where an operator can be found.  The
 *     value of -1 means expr does not have any operators.
 * @return An array of new expressions, each expression is a string.  Each
 *     element of the array is an array [idx, newexpr] as follows.
 *
 *     (1) idx := The highest index in newexpr at which an operator is located.
 *     (2) newexpr := A string representing an expression created from the
 *         given expression.
 *
 *     Return an empty array if no new expressions can be created from the
 *     given expression.
 */
function insert_operators(expr, i) {
    // Sanity checks.
    assert(expr.length > 0);
    assert(i >= -1);
    const n = expr.length;
    const k = n - 1;
    assert(i < k);
    // No further expressions can be created from the given expression.
    if (i == (k - 1)) {
        return [];
    }
    // Let k be the index of the last character in the string expr.  Let i be
    // the highest index in expr where an operator can be found.  Let op be an
    // operator we want to insert into expr.  The operator is to be inserted
    // at an index j such that i < j < k.  To insert op at index j, first we
    // shift by one position rightward all characters having indices at least
    // j.  The character that previously had index j now has index j+1, the
    // character whose former index is j+1 now has index j+2, etc.  Then we
    // insert op at index j in the string.
    //
    // The lowest value for j is i+2.  Index i in expr has an operator so index
    // i+1 should have a decimal digit.  If op is inserted at index i+1, then
    // two adjacent indices would have operators, resulting in an invalid
    // mathematical expression.  For example, how are we to evaluate the
    // expression "1+*2"?  The highest value for j is k.  All possible values
    // for j are contained in the set Ind := {i+2, i+3, i+4, ..., k}.  We
    // insert op at each of the indices in Ind, each insertion creates a new
    // expression that can later be processed via backtracking.
    //
    // Now consider two decimal digits
    //
    // expr[j-1] expr[j]
    //
    // in expr and we want to insert op at index j.  Normally we can insert op
    // and obtain the new substring
    //
    // (i) expr[j-1] op expr[j+1]
    //
    // We can also perform the insertion as follows:
    //
    // (ii) expr[j-1] op neg expr[j+2]
    //
    // where "neg" means the negative sign.  The decimal digit expr[j+2] is now
    // a negative integer.  As implied by the problem statement, we are not
    // allowed to flip the sign of any digit.  Thus case (i) above is allowed,
    // but case (ii) is prohibited.
    const candidate = new Array();
    for (let j = i + 2; j < n; j++) {
        for (const op of operators()) {
            const newexpr = expr.slice(0, j) + op + expr.slice(j, n);
            candidate.push([j, newexpr]);
        }
    }
    return candidate;
}

/**
 * All valid operators that can be inserted into a digit string.  We do not
 * include the operator "--" because it is equivalent to the addition operator.
 * The operator "+-" is equivalent to the subtraction operator.  The operator
 * "*-" is excluded because it would flip the sign of a digit from positive to
 * negative.  We are prohibited from flipping the sign of each decimal digit.
 */
function operators() {
    return ["+", "-", "*"];
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
 * Usage: run cct/maths.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The hostname of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const [string, target] = ns.codingcontract.getData(cct, host);
    const solution = await all_expressions(ns, string, target);
    const result = ns.codingcontract.attempt(
        solution, cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/maths.txt";
        const data = string + ", " + target;
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
