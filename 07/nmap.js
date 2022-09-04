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

import { colour, home } from "/lib/constant.js";
import { network, shortest_path } from "/lib/network.js";
import { assert } from "/lib/util.js";

/**
 * Insert forks.  Each fork indicates a child node.
 *
 * @param matrix The ASCII art of the network of world servers.  The function
 *     modifies this argument.
 */
function add_fork(matrix) {
    assert(matrix.length > 0);
    assert(matrix[0].length > 0);
    // Start from the second row onward because the first row is for the home
    // server.
    for (let i = 1; i < matrix.length; i++) {
        const j = matrix[i].length - 1;
        assert(leaf() == matrix[i][j]);
        assert(branch() == matrix[i][j - 1]);
        matrix[i][j - 1] = fork();
    }
}

/**
 * Replace each leaf with the corresponding server name.
 *
 * @param matrix The ASCII art of the network of world servers.  The function
 *     modifies this argument.
 * @param map A translation from coordinates in the grid to server name.
 */
function add_server_name(ns, matrix, map) {
    assert(matrix.length > 0);
    assert(matrix[0].length > 0);
    assert(map.size > 0);
    // Add the server names.
    for (const [coord, server] of map) {
        const [i, j] = coord.split(delimiter()).map(
            k => parseInt(k)
        );
        matrix[i][j] = decorate(ns, server);
    }
}

/**
 * Insert T junctions into the ASCII art.
 *
 * @param matrix The ASCII art of the network of world servers.  The function
 *     modifies this argument.
 */
function add_tee_junction(matrix) {
    assert(matrix.length > 0);
    assert(matrix[0].length > 0);
    // Start from the second row and work our way downward.
    for (let i = 1; i < matrix.length; i++) {
        const j = matrix[i].length - 1;
        assert(leaf() == matrix[i][j]);
        assert(fork() == matrix[i][j - 1]);
        if (fork() == matrix[i - 1][j - 1]) {
            matrix[i - 1][j - 1] = tee();
        }
        if (i < matrix.length - 2) {
            if (branch() == matrix[i + 1][j - 1]) {
                matrix[i][j - 1] = tee();
            }
        }
    }
}

/**
 * All shortest paths from our home server to each server in the game world.
 *
 * @param ns The Netscript API.
 * @return An array of shortest paths from the home server to each server in
 *     the game world.  Each element is a string formatted as
 *
 *     home,serv1,serv2,serv3,...,servk
 *
 *     which shows a shortest path from "home" to the server "servk".  The
 *     elements are sorted in lexicographic order.
 */
function all_shortest_paths(ns) {
    const delim = delimiter();
    const path = network(ns).map(
        destination => shortest_path(ns, home, destination).join(delim)
    );
    return path.sort();
}

/**
 * Tidy up the ASCII art representation of the network of world servers.  We
 * do various clean-ups such as removing dead branches and redundant (or
 * unnecessary) branches.
 *
 * @param grid An ASCII art representation of the network of world servers.
 *     This should be the output of the function to_ascii_art().
 * @param map A translation from coordinates in the grid to server name.
 * @return A string representation of the ASCII art.
 */
function beautify(ns, grid, map) {
    assert(grid.length > 0);
    assert(grid[0].length > 0);
    assert(map.size > 0);
    const matrix = Array.from(grid);
    // Remove dead branches in the visualization.  A branch is said to be dead
    // if it does not lead to a server.
    for (let i = 0; i < matrix.length - 1; i++) {
        const diff = matrix[i].length - matrix[i + 1].length;
        if (diff < 3) {
            continue;
        }
        prune_branch(matrix, i);
    }
    // Remove dead branches from the last row.
    prune_branch(matrix, matrix.length - 1);
    // Some final touches.
    add_fork(matrix);
    prune_sibling_branch(matrix);
    add_tee_junction(matrix);
    add_server_name(ns, matrix, map);
    return to_string(matrix);
}

/**
 * Internal representation for a branch.  Each branch represents an alternate
 * path that may lead to other servers.
 */
function branch() {
    return "│  ";
}

/**
 * Add various decorations to a server name.
 *
 * @param ns The Netscript API.
 * @param server We want to add various decorations to this server name.
 * @return The same server name, but with added decoration.
 */
function decorate(ns, server) {
    // We do not need any other decoration for the home server, apart from
    // adding a colour.
    if (home == server) {
        return colour.GREEN + server + colour.RESET;
    }
    // Add some more decorations to other servers.
    const serv = ns.getServer(server);
    const player = ns.getPlayer();
    const nhack = "(" + serv.requiredHackingSkill + ")";
    const nport = "[" + serv.numOpenPortsRequired + "]";
    const s = server + " " + nhack + nport;
    if (player.skills.hacking < serv.requiredHackingSkill) {
        return colour.RED + s + colour.RESET;
    }
    if (serv.hasAdminRights) {
        return colour.GREEN + s + colour.RESET;
    }
    return colour.DARK_GREEN + s + colour.RESET;
}

/**
 * The character used to delimit two servers in a path.
 */
function delimiter() {
    return ",";
}

/**
 * Print the tree structure of the network of world servers.
 *
 * @param ns The Netscript API.
 * @param path An array of shortest paths from the home server to each server
 *     in the game world.  This array should be the output of the function
 *     all_shortest_paths().
 */
function display_tree(ns, path) {
    assert(path.length > 0);
    // Internal representation of the tree structure.  Visualize this
    // representation as a matrix or grid.  Each row represents a shortest path.
    const delim = delimiter();
    const root = [[home]];
    const tree = root.concat(
        path.map(
            p => p.split(delim)
        )
    );
    // Convert internal representation to ASCII art.
    const [grid, map] = to_ascii_art(tree);
    const art = beautify(ns, grid, map);
    ns.tprint(art);
}

/**
 * Internal representation of a fork.  A fork is immediately followed by a leaf.
 */
function fork() {
    return "└╴";
}

/**
 * Internal representation for a leaf, i.e. a destination server.
 */
function leaf() {
    return "+";
}

/**
 * The new line character.
 */
function newline() {
    return "\n";
}

/**
 * Internal representation for a whitespace.
 */
function placeholder() {
    return ".";
}

/**
 * Remove a dead branch.
 *
 * @param matrix The ASCII art of the network of world servers.  The function
 *     modifies this argument.
 * @param r Start the pruning from this row upward.
 */
function prune_branch(matrix, r) {
    assert(matrix.length > 0);
    assert(matrix[0].length > 0);
    assert(r >= 0);
    let col = matrix[r].length - 3;
    const maxidx = matrix.length - 1;
    while (col >= 0) {
        if ((maxidx != r) && (leaf() == matrix[r + 1][col])) {
            return;
        }
        let row = Math.floor(r);
        while (row > 0) {
            if (leaf() == matrix[row][col + 1]) {
                break;
            }
            matrix[row][col] = placeholder();
            row--;
        }
        col--;
    }
}

/**
 * Prune branches that connect two siblings.  We do not need such branches.
 * We can work out which servers are siblings by following the branch lines
 * that connect two forks.
 *
 * @param matrix The ASCII art of the network of world servers.  The function
 *     modifies this argument.
 */
function prune_sibling_branch(matrix) {
    assert(matrix.length > 0);
    assert(matrix[0].length > 0);
    // Start from the second row onward.
    for (let i = 1; i < matrix.length; i++) {
        // Top row is shorter than bottom row.
        if (matrix[i - 1].length < matrix[i].length) {
            continue;
        }
        // There is a leaf immediately above the current leaf.
        const j = matrix[i].length - 1;
        if (leaf() == matrix[i - 1][j]) {
            continue;
        }
        // Start pruning from this row and work upward.
        let row = i - 1;
        while (row > 0) {
            if (fork() == matrix[row][j]) {
                break;
            }
            assert(branch() == matrix[row][j]);
            matrix[row][j] = placeholder();
            row--;
        }
    }
}

/**
 * A T junction.
 */
function tee() {
    return "├╴";
}

/**
 * Translate the internal representation of the network of servers into ASCII
 * art.
 *
 * @param tree A matrix containing the internal representation of the network
 *     of servers.
 * @return An array [grid, map] as follows.
 *
 *     grid := The internal representation as ASCII art.
 *     map := Converts a pair of coordinates in grid to a server name.
 */
function to_ascii_art(tree) {
    assert(tree.length > 0);
    assert(tree[0].length > 0);
    // Start from the second row.  The first row has only the home server.
    const grid = new Array();  // ASCII art.
    const map = new Map();     // Coordinates to server name.
    assert(1 == tree[0].length);
    assert(home == tree[0][0]);
    grid.push([leaf()]);
    const delim = delimiter();
    map.set("0" + delim + "0", home);
    for (let i = 1; i < tree.length; i++) {
        const previous = tree[i - 1];
        const current = tree[i];
        const row = new Array();
        // The first element is always the home server.
        assert(home == current[0]);
        for (let j = 0; j < current.length; j++) {
            // A leaf, i.e. the destination server in a shortest path.
            if ((j >= previous.length) || (previous[j] != current[j])) {
                row.push(leaf());
                const coord = i + delim + j;
                map.set(coord, current[j]);
                continue;
            }
            // A branch.
            assert(previous[j] == current[j]);
            row.push(branch());
        }
        grid.push(row);
    }
    return [grid, map];
}

/**
 * Convert the matrix representation of the ASCII art into a string.
 *
 * @param matrix The ASCII art of the network of world servers.  The function
 *     modifies this argument.
 * @return A string representation of the ASCII art.
 */
function to_string(matrix) {
    assert(matrix.length > 0);
    assert(matrix[0].length > 0);
    // Substitute a place holder with a whitespace.
    const whitespace = "   ";
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (placeholder() == matrix[i][j]) {
                matrix[i][j] = whitespace;
            }
        }
    }
    // Entries in the matrix as a string.
    let art = newline();
    for (const row of matrix) {
        art += row.join("") + newline();
    }
    return art;
}

/**
 * A tree structure of the servers in the game world.  If our home server is
 * called "home", we might have the network map:
 *
 * home
 * ├╴serv_a
 * │  ├╴serv_d
 * │  ├╴serv_e
 * │  │  └╴serv_g
 * │  └╴serv_f
 * ├╴serv_b
 * └╴serv_c
 *
 * This script does not implement the functionalities of https://nmap.org.
 * However, it serves the same purpose as the script
 *
 * https://github.com/alainbryden/bitburner-scripts/blob/main/scan.js
 *
 * By default, we do not include purchased servers.
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    const path = all_shortest_paths(ns);
    display_tree(ns, path);
}
