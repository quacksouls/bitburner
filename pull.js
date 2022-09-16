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

// NOTE: Do not import anything into this script.  The script should be
// self-contained and independent.

/**
 * A function for assertion.
 *
 * @param cond Assert that this condition is true.
 * @return Throw an assertion error if the given condition is false.
 */
function assert(cond) {
    if (!cond) {
        throw new Error("Assertion failed.");
    }
}

/**
 * Scripts for solving Coding Contracts.
 */
function dir_cct() {
    const cct = [
        "cct/bipartite.js",
        "cct/caesar.js",
        "cct/grid.js",
        "cct/grid2.js",
        "cct/grid3.js",
        "cct/hamming.js",
        "cct/hamming2.js",
        "cct/interval.js",
        "cct/ip.js",
        "cct/jump.js",
        "cct/jump2.js",
        "cct/lzc.js",
        "cct/lzd.js",
        "cct/maths.js",
        "cct/parenthesis.js",
        "cct/prime.js",
        "cct/rle.js",
        "cct/solver.js",
        "cct/spiral.js",
        "cct/subarray.js",
        "cct/sum.js",
        "cct/sum2.js",
        "cct/trader.js",
        "cct/trader2.js",
        "cct/trader3.js",
        "cct/trader4.js",
        "cct/triangle.js",
        "cct/vigenere.js"
    ];
    return cct;
}

/**
 * Scripts to automate gangs.
 */
function dir_gang() {
    const gang = [
        "gang/crime.js",
        "gang/slum-snakes.js"
    ];
    return gang;
}

/**
 * Scripts that are used to determine the gain in Intelligence XP from various
 * actions.
 */
function dir_intelligence() {
    const dir = [
        "intelligence/augmentation-buy.js",
        "intelligence/augmentation-install.js",
        "intelligence/augmentation-post-install.js",
        "intelligence/crime.js",
        "intelligence/daemon.js",
        "intelligence/faction-join-all.js",
        "intelligence/faction-join.js",
        "intelligence/home.js",
        "intelligence/int.js",
        "intelligence/program.js",
        "intelligence/relocate.js",
        "intelligence/study.js",
        "intelligence/tor-program.js",
        "intelligence/tor.js",
        "intelligence/travel.js",
        "intelligence/util.js"
    ];
    return dir;
}

/**
 * Library files whose functionalities are used in various scripts.
 */
function dir_lib() {
    const lib = [
        "lib/array.js",
        "lib/cct.js",
        "lib/constant/bool.js",
        "lib/constant/exe.js",
        "lib/constant/faction.js",
        "lib/constant/gang.js",
        "lib/constant/hacknet.js",
        "lib/constant/misc.js",
        "lib/constant/pserv.js",
        "lib/gangster.js",
        "lib/gangster.util.js",
        "lib/money.js",
        "lib/network.js",
        "lib/player.js",
        "lib/pserv.js",
        "lib/random.js",
        "lib/server.js",
        "lib/singularity.augmentation.js",
        "lib/singularity.crime.js",
        "lib/singularity.faction.js",
        "lib/singularity.network.js",
        "lib/singularity.study.js",
        "lib/singularity.util.js",
        "lib/singularity.work.js",
        "lib/time.js",
        "lib/util.js"
    ];
    return lib;
}

/**
 * Scripts at the top-most directory.
 */
function dir_root() {
    const root = [
        "buy-server.js",
        "find-cct.js",
        "go-high.js",
        "go-low.js",
        "go-mid.js",
        "go.js",
        "hack.js",
        "hnet-farm.js",
        "karma.js",
        "kill-script.js",
        "kill-server.js",
        "low-end.js",
        "nmap.js",
        "restart-server.js",
        "shortest-path.js",
        "trade-bot.js",
        "world-server.js"
    ];
    return root;
}

/**
 * Scripts that use the Singularity API.
 */
function dir_singularity() {
    const dir = [
        "singularity/crime.js",
        "singularity/daemon.js",
        "singularity/faction-city.js",
        "singularity/faction-crime.js",
        "singularity/faction-early.js",
        "singularity/faction-end.js",
        "singularity/faction-hack.js",
        "singularity/faction-megacorporation.js",
        "singularity/faction.js",
        "singularity/home.js",
        "singularity/install.js",
        "singularity/int-farm.js",
        "singularity/money.js",
        "singularity/program.js",
        "singularity/study.js"
    ];
    return dir;
}

/**
 * The directory structure on github.com.
 *
 * @param d A string representing a directory name under quacksouls/bitburner/
 *     on github.com.
 * @return All files under the given directory.
 */
function dir_structure(d) {
    let filesystem = "";
    switch (d) {
        case "01":
            filesystem = Array.from(dir_root());
            filesystem = filesystem.concat(dir_lib());
            break;
        case "02":
        case "03":
        case "04":
            filesystem = dir_root();
            break;
        case "05":
            filesystem = Array.from(dir_root());
            filesystem = filesystem.concat(dir_lib());
            break;
        case "06":
            filesystem = Array.from(dir_root());
            filesystem = filesystem.concat(dir_cct());
            filesystem = filesystem.concat(dir_lib());
            break;
        case "07":
            filesystem = Array.from(dir_root());
            filesystem = filesystem.concat(dir_cct());
            filesystem = filesystem.concat(dir_lib());
            filesystem = filesystem.concat(dir_singularity());
            break;
        case "08":
            filesystem = Array.from(dir_root());
            filesystem = filesystem.concat(dir_cct());
            filesystem = filesystem.concat(dir_intelligence());
            filesystem = filesystem.concat(dir_lib());
            filesystem = filesystem.concat(dir_singularity());
            break;
        case "09":
            filesystem = Array.from(dir_root());
            filesystem = filesystem.concat(dir_cct());
            filesystem = filesystem.concat(dir_gang());
            filesystem = filesystem.concat(dir_intelligence());
            filesystem = filesystem.concat(dir_lib());
            filesystem = filesystem.concat(dir_singularity());
            break;
        default:
            filesystem = "";
            break;
    }
    assert(filesystem.length > 0);
    return filesystem;
}

/**
 * Whether the given string represents a valid directory on github.com.  A
 * valid directory name follows the format xx where each x is a decimal digit.
 * Something like "01" is a valid directory name, whereas "o1" is not.
 *
 * @param d A string representing a directory name under quacksouls/bitburner/
 *     on github.com.
 * @return true if the given string represents a valid directory name;
 *     false otherwise.
 */
function is_valid_dir(d) {
    const VALID = true;
    const NO_VALID = !VALID;
    const digit = "0123456789";
    if (2 != d.length) {
        return NO_VALID;
    }
    if (!digit.includes(d[0]) || !digit.includes(d[1])) {
        return NO_VALID;
    }
    return VALID;
}

/**
 * A formatted name of the file where we want to save the downloaded file.  The
 * terminal command "wget" behaves differently from the API function
 * "ns.wget()".  The command "wget" is happy to create the required directory
 * if we do any of the following:
 *
 * wget /URL/to/src/file.js src/file.js
 * wget /URL/to/src/file.js /src/file.js
 *
 * The API function "ns.wget()" is happy with this
 *
 * await ns.wget("/URL/to/src/file.js", "/src/file.js", "home");
 *
 * but cannot handle this
 *
 * await ns.wget("/URL/to/src/file.js", "src/file.js", "home");
 *
 * That is, we must have the leading forward slash "/" character for the
 * function to work properly.  Here are the relevant issues on github.com:
 *
 * https://github.com/danielyxie/bitburner/issues/1935
 * https://github.com/danielyxie/bitburner/issues/2115
 *
 * @param f A file name.  Cannot be empty string.
 * @return A possibly new file name with the leading forward slash "/"
 *     character added.
 */
function target_name(f) {
    assert(f.length > 0);
    // Remove any leading forward slash "/" character.
    let fname = f.toString();
    const slash = "/";
    if (f.startsWith(slash)) {
        fname = f.substring(1, f.length);
    }
    // If the file should be at the root directory of the home server, then it
    // is just a file name without any other parent directory.  Something like
    // "file.js" would be saved to the root directory.  If the file has a
    // parent directory under root, then it would be something like
    // "src/file.js".  When we split the string according to "/", we should end
    // up with an array of at least 2 elements.
    const newf = fname.split(slash);
    if (1 == newf.length) {
        return fname;
    }
    assert(newf.length > 1);
    return slash + fname;
}

/**
 * Print the usage information.
 *
 * @param ns The Netscript API.
 */
function usage(ns) {
    const msg = "Usage: run pull.js nn\n\n"
          + "n -- A decimal digit.";
    ns.tprint(msg);
}

/**
 * Pull all files (on github.com) under the directory
 * quacksouls/bitburner/xx into the game.  This script accepts a command line
 * argument, i.e. the name of the directory xx.
 *
 * Usage: run pull.js [xx]
 * Example: run pull.js 03
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Sanity checks.
    // We want only one command line argument.
    if (ns.args.length != 1) {
        usage(ns);
        return;
    }
    // The first directory is named "01".
    let dir = parseInt(ns.args[0]);
    if (dir < 1) {
        usage(ns);
        return;
    }
    // The game parses the command line argument as an integer and removes the
    // leading zero.  Put "0" back in.
    if ((1 <= dir) && (dir <= 9)) {
        dir = "0" + dir;
    }
    dir += "";
    if (!is_valid_dir(dir)) {
        usage(ns);
        return;
    }
    // Pull files into our home server.
    const home = "home";
    // The base URL where files are found.
    const github = "https://raw.githubusercontent.com/";
    const quack = "quacksouls/bitburner/main/";
    const prefix = github + quack + dir + "/";
    // Pull files into home server.
    for (const f of dir_structure(dir)) {
        const file = prefix + f;
        const target = target_name(f);
        const success = await ns.wget(file, target, home);
        if (success) {
            ns.tprint(file);
        }
    }
    ns.tprint("Download complete.");
}
