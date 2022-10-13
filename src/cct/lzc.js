import { log_cct_failure, print_error, print_success } from "/lib/cct.js";

/**
 * Compress a string using LZ encoding.  This function is due to
 *
 * stalefishies
 * https://github.com/stalefishies
 * https://github.com/danielyxie/bitburner/commit/174d17a5e20926745993969ede7ad1db9308036c
 *
 * Explanation by stalefish#8304 on Discord server of Bitburner:
 *
 * The basic idea is to add one character at a time, keeping all possible
 * routes to optimal compression open. If we have N characters currently
 * compressed, we can split that into two parts: all the chunks except the
 * last, and then that last chunk. To add an (N+1)th character to the
 * compressed string, we are going to either modify that last chunk to include
 * the new character, or start a new chunk with the new character - we never
 * modify any chunk except the last. Thus, to keep all possible routes open, we
 * need to consider every possible final chunk, keeping track of the shortest
 * 'all chunks except the last' string for each possible final chunk. That's
 * what the state table keeps track of: the string stored in the table is the
 * shortest 'all chunks except the last', and each table location corresponds
 * to each possible last chunk.
 *
 * The code of this function is covered by this license:
 * Apache 2.0 with Commons Clause
 * https://github.com/danielyxie/bitburner/blob/dev/license.txt
 *
 * @param plain We want to compress this string.
 * @return A compressed version of the input string.
 */
function compress(plain) {
    // for state[i][j]:
    //      if i is 0, we're adding a literal of length j
    //      else, we're adding a backreference of offset i and length j
    let cur_state = Array.from(Array(10), () => Array(10).fill(null));
    let new_state = Array.from(Array(10), () => Array(10));

    function set(state, i, j, str) {
        const current = state[i][j];
        if (current === null || str.length < current.length) {
            state[i][j] = str;
        } else if (str.length === current.length && Math.random() < 0.5) {
            // if two strings are the same length, pick randomly so that
            // we generate more possible inputs to Compression II
            state[i][j] = str;
        }
    }

    // initial state is a literal of length 1
    cur_state[0][1] = "";

    for (let i = 1; i < plain.length; ++i) {
        for (const row of new_state) {
            row.fill(null);
        }
        const c = plain[i];
        // handle literals
        for (let length = 1; length <= 9; ++length) {
            const string = cur_state[0][length];
            if (string === null) {
                continue;
            }
            if (length < 9) {
                // extend current literal
                set(new_state, 0, length + 1, string);
            } else {
                // start new literal
                set(
                    new_state,
                    0,
                    1,
                    `${string}9${plain.substring(i - 9, i)}0`
                );
            }
            for (let offset = 1; offset <= Math.min(9, i); ++offset) {
                if (plain[i - offset] === c) {
                    // start new backreference
                    set(
                        new_state,
                        offset,
                        1,
                        string
                            + String(length)
                            + plain.substring(i - length, i)
                    );
                }
            }
        }

        // handle backreferences
        for (let offset = 1; offset <= 9; ++offset) {
            for (let length = 1; length <= 9; ++length) {
                const string = cur_state[offset][length];
                if (string === null) {
                    continue;
                }
                if (plain[i - offset] === c) {
                    if (length < 9) {
                        // extend current backreference
                        set(new_state, offset, length + 1, string);
                    } else {
                        // start new backreference
                        set(
                            new_state,
                            offset,
                            1,
                            `${string}9${String(offset)}0`
                        );
                    }
                }
                // start new literal
                set(new_state, 0, 1, string + String(length) + String(offset));
                // end current backreference and start new backreference
                for (
                    let new_offset = 1;
                    new_offset <= Math.min(9, i);
                    ++new_offset
                ) {
                    if (plain[i - new_offset] === c) {
                        set(
                            new_state,
                            new_offset,
                            1,
                            `${string + String(length) + String(offset)}0`
                        );
                    }
                }
            }
        }

        const tmp_state = new_state;
        new_state = cur_state;
        cur_state = tmp_state;
    }

    let result = null;

    for (let len = 1; len <= 9; ++len) {
        let string = cur_state[0][len];
        if (string === null) {
            continue;
        }
        string
            += String(len) + plain.substring(plain.length - len, plain.length);
        if (result === null || string.length < result.length) {
            result = string;
        } else if (string.length === result.length && Math.random() < 0.5) {
            result = string;
        }
    }

    for (let offset = 1; offset <= 9; ++offset) {
        for (let len = 1; len <= 9; ++len) {
            let string = cur_state[offset][len];
            if (string === null) {
                continue;
            }
            string += `${String(len)}${String(offset)}`;
            if (result === null || string.length < result.length) {
                result = string;
            } else if (string.length === result.length && Math.random() < 0.5) {
                result = string;
            }
        }
    }

    return result ?? "";
}

/**
 * Compression III: LZ Decompression: Lempel-Ziv (LZ) compression is a data
 * compression technique that encodes data using references to earlier parts of
 * the data.  In this variant of LZ, data is encoded as two types of chunk.
 * Each chunk begins with a length L, encoded as a single ASCII digit from 1 to
 * 9, followed by the chunk data, which is either:
 *
 * 1. Exactly L characters, which are to be copied directly into the
 *    uncompressed data.
 * 2. A reference to an earlier part of the uncompressed data.  To do this, the
 *    length is followed by a second ASCII digit X.  Each of the L output
 *    characters is a copy of the character X places before it in the
 *    uncompressed data.
 *
 * For both chunk types, a length of 0 instead means the chunk ends
 * immediately, and the next character is the start of a new chunk.  The two
 * chunk types alternate, starting with type 1, and the final chunk may be of
 * either type.  You are given a string as input.  Encode it using Lempel-Ziv
 * encoding with the minimum possible output length.
 *
 * Usage: run cct/lzc.js [cct] [hostname]
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // The file name of the coding contract.
    const cct = ns.args[0];
    // The hostname of the server where the coding contract is located.
    const host = ns.args[1];
    // Solve the coding contract.
    const data = ns.codingcontract.getData(cct, host);
    const result = ns.codingcontract.attempt(compress(data), cct, host, {
        returnReward: true,
    });
    // Log the result in case of failure.
    if (result.length === 0) {
        const log = "/cct/lzc.txt";
        await log_cct_failure(ns, log, cct, host, data);
        print_error(ns, host, cct);
        return;
    }
    print_success(ns, host, cct, result);
}
