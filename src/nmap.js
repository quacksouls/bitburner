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

import { program as popen } from "/lib/constant/exe.js";
import { base, colour } from "/lib/constant/misc.js";
import { home } from "/lib/constant/server.js";
import { network, shortest_path } from "/lib/network.js";
import { assert } from "/lib/util.js";

/**
 * Insert forks.  Each fork indicates a child node.
 *
 * @param matrix The ASCII art of the network of world servers.
 * @return The same matrix, but forks are inserted where necessary.
 */
function add_fork(matrix) {
    assert(matrix.length > 0);
    assert(matrix[0].length > 0);
    // A shallow copy so we don't modify the parameter directly.  We still
    // modify it indirectly.
    const mat = Array.from(matrix);
    // Start from the second row onward because the first row is for the home
    // server.
    for (let i = 1; i < mat.length; i++) {
        const j = mat[i].length - 1;
        assert(leaf() === mat[i][j]);
        assert(branch() === mat[i][j - 1]);
        mat[i][j - 1] = fork();
    }
    return mat;
}

/**
 * Replace each leaf with the corresponding server name.
 *
 * @param matrix The ASCII art of the network of world servers.  The function
 *     modifies this argument.
 * @param map A translation from coordinates in the grid to server name.
 * @return The same matrix, but with server names added.
 */
function add_server_name(ns, matrix, map) {
    assert(matrix.length > 0);
    assert(matrix[0].length > 0);
    assert(map.size > 0);
    // A shallow copy so we don't modify the parameter directly.  We still
    // modify it indirectly.
    const mat = Array.from(matrix);
    // Add the server names.
    for (const [coord, server] of map) {
        const [i, j] = coord
            .split(delimiter())
            .map((k) => parseInt(k, base.DECIMAL));
        mat[i][j] = decorate(ns, server);
    }
    return mat;
}

/**
 * Insert T junctions into the ASCII art.
 *
 * @param matrix The ASCII art of the network of world servers.  The function
 *     modifies this argument.
 * @return The same matrix, but with T junctions inserted.
 */
function add_tee_junction(matrix) {
    assert(matrix.length > 0);
    assert(matrix[0].length > 0);
    // A shallow copy so we don't modify the parameter directly.  We still
    // modify it indirectly.
    const mat = Array.from(matrix);
    // Start from the second row and work our way downward.
    for (let i = 1; i < mat.length; i++) {
        const j = mat[i].length - 1;
        assert(leaf() === mat[i][j]);
        assert(fork() === mat[i][j - 1]);
        if (fork() === mat[i - 1][j - 1]) {
            mat[i - 1][j - 1] = tee();
        }
        if (i < mat.length - 2) {
            if (branch() === mat[i + 1][j - 1]) {
                mat[i][j - 1] = tee();
            }
        }
    }
    return mat;
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
        (destination) => shortest_path(ns, home, destination).join(delim)
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
    let matrix = Array.from(grid);
    // Remove dead branches in the visualization.  A branch is said to be dead
    // if it does not lead to a server.
    for (let i = 0; i < matrix.length - 1; i++) {
        const diff = matrix[i].length - matrix[i + 1].length;
        if (diff < 3) {
            continue;
        }
        matrix = prune_branch(matrix, i);
    }
    // Remove dead branches from the last row.
    matrix = prune_branch(matrix, matrix.length - 1);
    // Some final touches.
    matrix = add_fork(matrix);
    matrix = prune_sibling_branch(matrix);
    matrix = add_tee_junction(matrix);
    matrix = add_server_name(ns, matrix, map);
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
    if (home === server) {
        return colour.GREEN + server + colour.RESET;
    }
    // Add some more decorations to other servers.
    const serv = ns.getServer(server);
    const player = ns.getPlayer();
    const hack_lvl = player.skills.hacking;
    const required_hack_lvl = serv.requiredHackingSkill;
    const nhack = `(${required_hack_lvl})`;
    const nport = `[${serv.numOpenPortsRequired}]`;
    // Do we have root access on the server?
    if (serv.hasAdminRights) {
        const s = `${server} ${nhack}${nport}`;
        return colour.GREEN + s + colour.RESET;
    }
    // Do we have the minimum required Hack stat?
    let s = `${server} ${nhack}`;
    if (hack_lvl < required_hack_lvl) {
        s = colour.RED + s + colour.RESET;
    } else {
        s = colour.DARK_GREEN + s + colour.RESET;
    }
    // Can we open all ports on the server?
    if (num_ports(ns) < serv.numOpenPortsRequired) {
        s += colour.RED + nport + colour.RESET;
    } else {
        s += colour.DARK_GREEN + nport + colour.RESET;
    }
    return s;
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
    const tree = root.concat(path.map((p) => p.split(delim)));
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
 * Determine the number of ports a player can currently open on servers in
 * the game world.  This depends on whether the player has the necessary
 * hacking programs on the home server.
 *
 * @param ns The Netscript API.
 * @return How many ports we can open on a world server.
 */
function num_ports(ns) {
    let program = Array.from(popen);
    program = program.filter((p) => ns.fileExists(p, home));
    return program.length;
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
 * @return The same matrix, but with dead branches removed.
 */
function prune_branch(matrix, r) {
    assert(matrix.length > 0);
    assert(matrix[0].length > 0);
    assert(r >= 0);
    // A shallow copy so we don't modify the parameter directly.  Still modify
    // it indirectly.
    const mat = Array.from(matrix);
    let col = mat[r].length - 3;
    const maxidx = mat.length - 1;
    while (col >= 0) {
        if (maxidx !== r && leaf() === mat[r + 1][col]) {
            return mat;
        }
        let row = Math.floor(r);
        while (row > 0) {
            if (leaf() === mat[row][col + 1]) {
                break;
            }
            mat[row][col] = placeholder();
            row--;
        }
        col--;
    }
    return mat;
}

/**
 * Prune branches that connect two siblings.  We do not need such branches.
 * We can work out which servers are siblings by following the branch lines
 * that connect two forks.
 *
 * @param matrix The ASCII art of the network of world servers.  The function
 *     modifies this argument.
 * @return The same matrix, but with sibling branches removed.
 */
function prune_sibling_branch(matrix) {
    assert(matrix.length > 0);
    assert(matrix[0].length > 0);
    // A shallow copy so we don't modify the parameter directly.  We still
    // modify it indirectly.
    const mat = Array.from(matrix);
    // Start from the second row onward.
    for (let i = 1; i < mat.length; i++) {
        // Top row is shorter than bottom row.
        if (mat[i - 1].length < mat[i].length) {
            continue;
        }
        // There is a leaf immediately above the current leaf.
        const j = mat[i].length - 1;
        if (leaf() === mat[i - 1][j]) {
            continue;
        }
        // Start pruning from this row and work upward.
        let row = i - 1;
        while (row > 0) {
            if (fork() === mat[row][j]) {
                break;
            }
            assert(branch() === mat[row][j]);
            mat[row][j] = placeholder();
            row--;
        }
    }
    return mat;
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
    const grid = []; // ASCII art.
    const map = new Map(); // Coordinates to server name.
    assert(tree[0].length === 1);
    assert(home === tree[0][0]);
    grid.push([leaf()]);
    const delim = delimiter();
    map.set(`0${delim}0`, home);
    for (let i = 1; i < tree.length; i++) {
        const previous = tree[i - 1];
        const current = tree[i];
        const row = [];
        // The first element is always the home server.
        assert(home === current[0]);
        for (let j = 0; j < current.length; j++) {
            // A leaf, i.e. the destination server in a shortest path.
            if (j >= previous.length || previous[j] !== current[j]) {
                row.push(leaf());
                const coord = i + delim + j;
                map.set(coord, current[j]);
                continue;
            }
            // A branch.
            assert(previous[j] === current[j]);
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
    // A shallow copy so we don't modify the parameter directly.  We still
    // modify it indirectly.
    const mat = Array.from(matrix);
    // Substitute a place holder with a whitespace.
    const whitespace = "   ";
    for (let i = 0; i < mat.length; i++) {
        for (let j = 0; j < mat[i].length; j++) {
            if (placeholder() === mat[i][j]) {
                mat[i][j] = whitespace;
            }
        }
    }
    // Entries in the matrix as a string.
    let art = newline();
    for (const row of mat) {
        art += row.join("") + newline();
    }
    return art;
}

/**
 * A tree structure of the servers in the game world.  If our home server is
 * called "home", we might have the network map:
 *
 * home
 * ├╴servA (1)[0]
 * │  ├╴servD (15)[2]
 * │  ├╴servE (100)[2]
 * │  │  └╴servG (302)[3]
 * │  └╴servG (256)[2]
 * ├╴servB (101)[1]
 * └╴servC (150)[2]
 *
 * The above network map tells us various information about the servers in the
 * game world, apart from how these servers are structured relative to each
 * other.  For example, the line "serverName (n)[k]" tells us the name of a
 * server (i.e. serverName), the minimum Hack stat we must have in order to
 * hack this server (i.e. n), and the number of ports that must be opened on
 * the server (i.e. k) so we can nuke the server.  The server servA requires us
 * to have a minimum of 1 Hack and we do not need to open any ports on the
 * server.  As we always start with 1 Hack, we can immediately nuke servA and
 * gain root access on that server.  On the other hand, servG requires a
 * minimum of 302 Hack and we must open 3 ports on the server.
 *
 * How do we reach a particular server?  To reach servG, we start from our
 * home server and connect to servA.  From there, we connect to servE and
 * finally connect to servG.  The network map printed by the script shows a
 * shortest path from the home server to each server in the game world.  There
 * might be more than one shortest path from home to a particular server.  The
 * script chooses to print only one of these shortest paths.
 *
 * When printed to the terminal, various colours are used to signify the status
 * of each server, as explained below.
 *
 * 1. The whole line "serverName (n)[k]" is coloured green.  We have nuked
 *    serverName and now have root access on the server.
 * 2. The whole line "serverName (n)[k]" is coloured dark green.  We have
 *    enough Hack stat to meet the minimum hacking skill requirement and we can
 *    open all ports on the server.  However, we do not have root access on the
 *    server because the server is yet to be nuked.
 * 3. The whole line "serverName (n)[k]" is coloured red.  Our Hack stat is
 *    less than the required minimum hacking skill and we cannot open all ports
 *    on the server.
 * 4. The part "serverName (n)" is coloured dark green whereas "[k]" is
 *    coloured red.  We meet the minimum Hack stat required by the server, but
 *    we cannot open all ports on the server.
 * 5. The part "serverName (n)" is coloured red whereas "[k]" is coloured dark
 *    green.  Our Hack stat is less than the minimum hacking skill required by
 *    the server, but we can open all ports on the server.
 *
 * This script does not implement the functionalities of https://nmap.org.
 * However, it serves the same purpose as the script
 *
 * https://github.com/alainbryden/bitburner-scripts/blob/main/scan.js
 *
 * We do not include purchased servers.  The script accepts a command line
 * argument, i.e. the hostname of the server for which we want a status report.
 * Without a command line argument, the script prints a map of the whole
 * network of world servers.
 *
 * Usage: run nmap.js [hostname]
 * Example: run nmap.js
 * Example: run nmap.js n00dles
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Sanity check.
    if (ns.args.length > 1) {
        let msg = "Usage: run nmap.js [hostname]\n\n";
        msg += "hostname -- (optional) Hostname of target server.";
        ns.tprint(msg);
        return;
    }
    // Print the status of a server.
    if (ns.args.length === 1) {
        const host = ns.args[0];
        const server = new Set(network(ns));
        if (!server.has(host)) {
            ns.tprint(`Server not found: ${host}`);
            return;
        }
        ns.tprint(decorate(ns, host));
        return;
    }
    // A network map with status of each server.
    const path = all_shortest_paths(ns);
    display_tree(ns, path);
}
