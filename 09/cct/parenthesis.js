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
import { assert } from "/lib/util.js";

/**
 * Whether the parentheses in the given expression are balanced.
 *
 * @param expression A string consisting of parentheses and other characters.
 *     The parentheses in this string are possibly unbalanced.  Cannot be an
 *     empty string.
 * @return true if the parentheses in the given expression are balanced;
 *     false otherwise.
 */
function is_balanced(expression) {
    assert(expression.length > 0);
    const VALID = true;
    const NOT_VALID = !VALID;
    // The stack data structure is perfect for this problem.
    const stack = new Array();
    // The starting or opening parenthesis.
    const open = "(";
    // The ending or closing parenthesis.
    const close = ")";
    for (const c of expression) {
        // Is this character the starting parenthesis?
        if (open == c) {
            stack.push(c);
            continue;
        }
        // Is this character the ending parenthesis?
        if (close == c) {
            // We have an ending parenthesis, but the stack is empty.
            if (0 == stack.length) {
                return NOT_VALID;
            }
            // This ending parenthesis must be matched with an opening
            // parenthesis at the top of the stack.
            if (open == stack[stack.length - 1]) {
                stack.pop();
                continue;
            }
            // We encounter a closing parenthesis, but the top of the stack
            // does not contain an opening parenthesis.
            return NOT_VALID;
        }
    }
    // Every opening parenthesis should be matched with a closing parenthesis.
    // If the stack has zero elements, then the expression is balanced.
    if (0 == stack.length) {
        return VALID;
    }
    return NOT_VALID;
}

/**
 * Whether a character represents an opening or closing parenthesis.
 *
 * @param c A character.
 * @return true if the given character is a parenthesis; false otherwise.
 */
function is_parenthesis(c) {
    assert(1 == c.length);
    const open = "(";
    const close = ")";
    if ((open == c) || (close == c)) {
        return true;
    }
    return false;
}

/**
 * Slice an expression by removing a character at the given index.
 *
 * @param expr We want to prune one character from this expression.  The
 *     expression is represented as a string.
 * @param i Remove the character expr[i] at index i.
 * @return A sub-expression obtained by removing from expr the character
 *     at index i.  We do not modify the given expression.
 */
function slice(expr, i) {
    // Sanity checks.
    assert(expr.length > 0);
    assert(i >= 0);
    assert(i < expr.length);
    // Remove the character at index i.
    return expr.slice(0, i) + expr.slice(i + 1, expr.length);
}

/**
 * Sanitize parentheses in an expression by removing the minimum number of
 * parentheses such that the resulting expression has balanced parentheses.
 * The problem can be considered from a combinatorial perspective.  We
 * determine the minimum number k of parentheses to remove.  Let n be the
 * number of parentheses in the expression, including both opening and closing
 * parentheses.  We find all possible k-combinations of the n parentheses.  For
 * each k-combination, we remove the corresponding parentheses from the
 * expression and let the resulting expression be expr.  If expr has balanced
 * parentheses, then add expr to our set of solutions.  The difficult part of
 * this method is choosing an algorithm for generating all k-combinations from
 * a set of n objects.  Some algorithms run in exponential time while others
 * run in factorial time, which is worse than exponential time.  Refer to these
 * pages for more details:
 *
 * https://medium.com/enjoy-algorithm/find-all-possible-combinations-of-k-numbers-from-1-to-n-88f8e3fad33c
 * https://stackoverflow.com/questions/127704/algorithm-to-return-all-combinations-of-k-elements-from-n
 *
 * A simpler method consists of scanning the expression one character at a
 * time.  For each index i, if the character at index i is a parenthesis, we
 * form a new expression by removing the character at index i in the current
 * expression.  Thus we have an array of new expressions, each constructed by
 * removing one parenthesis from the current expression.  Test each of these
 * new expressions to see whether any of them have balanced parentheses.  We
 * have two cases:
 *
 * (1) At least one of the new expressions has balanced parentheses.  Our
 *     solution set consists of all new expressions that have balanced
 *     parentheses.
 * (2) None of the new expressions have balanced parentheses.  Apply the above
 *     scanning algorithm to these new expressions and repeat the above
 *     process.
 *
 * The above method follows a pattern similar to breath-first search.  As soon
 * as we encounter a sub-expression that has balanced parentheses, we no longer
 * need to remove one character to form new sub-expressions.
 *
 * @param string An expression containing parentheses and other characters.
 *     The parentheses in the expression are possibly unbalanced.
 * @return An array of strings.  Each string has balanced parentheses.  We
 *     removed the same number of parentheses to result in each balanced
 *     expression.
 */
function sanitize(string) {
    assert(string.length > 0);
    // Test the expression at the start of this array.
    const queue = new Array();
    queue.push(string);
    // All expressions and sub-expressions we have considered.
    const seen = new Set();
    seen.add(string);
    // All expressions that have balanced parentheses.
    const result = new Array();
    // Whether we need to prune one parenthesis from an expression to
    // create a new sub-expression.
    let prune = true;
    // Use a pattern similar to breath-first search to test expressions and
    // their sub-expressions.  Let exprA and exprB be expressions.  We consider
    // them as nodes in a directed graph.  If exprB can be obtained by removing
    // one parenthesis from exprA, then there is a directed edge from exprA
    // to exprB.
    while (queue.length > 0) {
        // Get the first element of the queue.
        const expr = queue.shift();
        // Does this expression have balanced parentheses?
        if (is_balanced(expr)) {
            result.push(expr);
            // We have removed enough number of parentheses to result in at
            // least one sub-expression having balanced parentheses.  No more
            // pruning needed.
            prune = false;
        }
        // Do we need to prune a parenthesis from the current sub-expression?
        if (!prune) {
            continue;
        }
        // Prune a parenthesis from the current expression.  Each sub-expression
        // is obtained by removing a character at index i, provided that the
        // character is a parenthesis.
        for (let i = 0; i < expr.length; i++) {
            if (!is_parenthesis(expr[i])) {
                continue;
            }
            const sub_expr = slice(expr, i);
            if (seen.has(sub_expr)) {
                continue;
            }
            queue.push(sub_expr);
            seen.add(sub_expr);
        }
    }
    return result;
}

/**
 * Sanitize Parentheses in Expression: Given a string with parentheses and
 * letters, remove the minimum number of invalid parentheses in order to
 * validate the string.  If there are multiple minimal ways to validate the
 * string, provide all of the possible results.  The answer should be provided
 * as an array of strings.  If it is impossible to validate the string, the
 * result should be an array with only an empty string.
 *
 * This is essentially the balanced brackets problem.  The twist is that we
 * must remove the minimum number of parentheses to balance the parentheses.
 *
 * Usage: run parenthesis.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The hostname of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const expression = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(
        sanitize(expression), cct, host, { returnReward: true }
    );
    // Log the result in case of failure.
    if (0 == result.length) {
        const log = "/cct/parenthesis.txt";
        await log_cct_failure(ns, log, cct, host, expression);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
