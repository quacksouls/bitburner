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

import { log_cct_failure } from "/lib/cct.js";
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
    // We try all possibilities.  We use depth-first search for backtracking.
    // Each partial solution is an array [i, expr] as follows:
    //
    // i := The highest index in the partial expression expr where an operator
    //     can be found.  If i < 0, then we have not inserted any operators
    //     into expr.
    // expr := A partial expression, represented as a string.
    const stack = new Array();
    const seen = new Set();
    const solution = new Array();
    const candidate = [-1, string];
    stack.push(candidate);
    seen.add(candidate);
    const time = new Time();
    const t = time.millisecond();
    while (stack.length > 0) {
        const [i, expr] = stack.pop();
        // Create new expressions by inserting different operators at the next
        // available position.
        const newexpr = insert_operators(expr, i);
        // No new expressions can be created from the given expression.
        if (0 == newexpr.length) {
            continue;
        }
        // Test each new expression to see whether it evaluates to the target
        // number.
        for (let j = 0; j < newexpr.length; j++) {
            const [idx, expression] = newexpr[j];
            // Have we seen this expression already?
            if (seen.has(expression)) {
                continue;
            }
            seen.add(expression);
            stack.push([idx, expression]);
            // Found a leading 0 in a number.  We have two cases to consider:
            //
            // (1) The index of the digit 0 is less than the last index in the
            //     expression string.  Here, it is safe to skip the evaluation
            //     of the expression.
            // (2) The digit 0 is located at the last index in the expression
            //     string.  If idx is the highest index at which an operator is
            //     found and k is the last index of the expression string, then
            //     k = idx + 1.  In this case, we evaluate the expression.
            if ("0" == expression[idx + 1]) {
                const lastidx = expression.length - 1;
                if (idx + 1 != lastidx) {
                    continue;
                }
            }
            // Does this expression evaluate to the target number?
            if (target == evaluate(expression)) {
                solution.push(expression);
            }
        }
        await ns.sleep(t);
    }
    return solution;
}

/**
 * Insert all possible operators at the next available index.
 *
 * @param expr An expression, represented as a string.  Cannot be an empty
 *     string.
 * @param i The highest index in expr where an operator can be found.  The
 *     value of -1 means expr does not have any operators.
 * @return An array of new expressions, each expression is a string.  Each
 *     element of the array is an array of the form [idx, newexpr], where idx
 *     is the highest index in newexpr at which an operator is located.  Return
 *     an empty array if no new expressions can be created from the given
 *     expression.
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
    // A simpler solution is to define the empty operator.  We extend our list
    // of operators [+, -, *] to include the empty operator.  Our list of
    // operators is now: +, -, *, "".  We insert each operator at index j := i+2
    // and create 4 new expressions:
    //
    // (1) exp[j-1] + exp[j]
    // (2) exp[j-1] - exp[j]
    // (3) exp[j-1] * exp[j]
    // (4) exp[j-1] "" exp[j]
    //
    // Case (4) means that we consider exp[j-1] and exp[j] as one number, namely
    // a number with two digits.  Later on when we process an expression that
    // contains case (4), we would have two mathematical operators separated by
    // two decimal digits.  The exception is when exp[j-1] = 0 and case (4)
    // would result in a number that has a leading zero.  In this case, we skip
    // the insertion of the empty operator.
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
    // All possible operators.  We do not include the operator "--" because it
    // is equivalent to the addition operator.  The operator "+-" is equivalent
    // to the subtraction operator.  The operator "*-" is excluded because it
    // would flip the sign of a digit from positive to negative.  We are
    // prohibited from flipping the sign of each decimal digit.
    const operator = ["+", "-", "*"];
    // Add a mathematical operator at index i+2 in expr.
    const j = i + 2;
    for (const op of operator) {
        const newexpr = expr.slice(0, j) + op + expr.slice(j, n);
        candidate.push([j, newexpr]);
    }
    // Insert the empty operator.  Do so if expr[j-1] is not the digit 0.
    if ("0" != expr[j - 1]) {
        const newexpr = new String(expr);
        candidate.push([i + 1, newexpr]);
    }
    return candidate;
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
 * In the above example, we have two possible valid solutions.  Note that the
 * expression "1*-2*-3" also evaluates to 6.  The solution for Example 1
 * implies the following restrictions on any solution we output.
 *
 * (1) Each decimal digit is non-negative.
 * (2) We are not allowed to flip the sign of a digit.  For example, in the
 *     expression "1*-2*-3" we flipped the sign of the digit "2" from positive
 *     to negative.  Thus the expression "1*-2*-3" is an invalid solution,
 *     although it evaluates to the target number.
 *
 * Usage: run maths.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The host name of the server where the coding contract is located.
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
        ns.tprint(host + ": " + cct + ": FAILURE");
        return;
    }
    ns.tprint(host + ": " + cct + ": " + result);
}
