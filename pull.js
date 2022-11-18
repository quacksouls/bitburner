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
 * Scripts for managing a load chain.
 */
function dir_chain() {
    const chain = [
        "chain/faction.js",
        "chain/home.js",
        "chain/install.js",
        "chain/misc.js",
        "chain/money.js",
        "chain/study.js",
    ];
    return chain;
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
        "cct/vigenere.js",
    ];
    return cct;
}

/**
 * Scripts for managing a corporation.
 */
function dir_corporation() {
    const corp = [
        "corporation/go.js",
        "corporation/invest1.js",
        "corporation/material1.js",
        "corporation/storage.js",
        "corporation/upgrade1.js",
    ];
    return corp;
}

/**
 * Scripts to automate gangs.
 */
function dir_gang() {
    const gang = [
        "gang/augment.js",
        "gang/crime.js",
        "gang/dead-speakers.js",
        "gang/go.js",
        "gang/program.js",
        "gang/slum-snakes.js",
    ];
    return gang;
}

/**
 * Library files whose functionalities are used in various scripts.
 */
function dir_lib() {
    const lib = [
        "lib/array.js",
        "lib/cct.js",
        "lib/constant/bn.js",
        "lib/constant/bool.js",
        "lib/constant/cct.js",
        "lib/constant/corp.js",
        "lib/constant/crime.js",
        "lib/constant/exe.js",
        "lib/constant/faction.js",
        "lib/constant/gang.js",
        "lib/constant/hacknet.js",
        "lib/constant/io.js",
        "lib/constant/location.js",
        "lib/constant/misc.js",
        "lib/constant/pserv.js",
        "lib/constant/server.js",
        "lib/constant/sleeve.js",
        "lib/constant/study.js",
        "lib/constant/time.js",
        "lib/constant/work.js",
        "lib/constant/wse.js",
        "lib/corporation/corp.js",
        "lib/corporation/office.js",
        "lib/corporation/store.js",
        "lib/corporation/util.js",
        "lib/gang/gangster.js",
        "lib/gang/util.js",
        "lib/io.js",
        "lib/money.js",
        "lib/network.js",
        "lib/player.js",
        "lib/pserv.js",
        "lib/random.js",
        "lib/server.js",
        "lib/singularity/augment.js",
        "lib/singularity/crime.js",
        "lib/singularity/faction.js",
        "lib/singularity/network.js",
        "lib/singularity/program.js",
        "lib/singularity/study.js",
        "lib/singularity/util.js",
        "lib/singularity/work.js",
        "lib/sleeve/cc.js",
        "lib/sleeve/util.js",
        "lib/source.js",
        "lib/util.js",
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
        "hram.js",
        "karma.js",
        "kill-script.js",
        "kill-server.js",
        "low-end.js",
        "nmap.js",
        "restart-server.js",
        "share.js",
        "shortest-path.js",
        "trade-bot.js",
        "world-server.js",
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
        "singularity/faction-megacorp.js",
        "singularity/faction.js",
        "singularity/home.js",
        "singularity/install.js",
        "singularity/int-farm.js",
        "singularity/money.js",
        "singularity/program.js",
        "singularity/study.js",
    ];
    return dir;
}

/**
 * Scripts that use the Sleeve API.
 */
function dir_sleeve() {
    const dir = ["sleeve/cc.js", "sleeve/money.js", "sleeve/study.js"];
    return dir;
}

/**
 * Scripts to test various aspects of the game.
 */
function dir_test() {
    const dir = [
        // Scripts used to gather data on karma and stat gains for each crime.
        "test/crime/crime.js",
        "test/crime/crime-int.js",
        // Scripts that are used to determine the gain in Intelligence XP from
        // various actions.
        "test/intelligence/augment-buy.js",
        "test/intelligence/augment-install.js",
        "test/intelligence/augment-post-install.js",
        "test/intelligence/crime.js",
        "test/intelligence/daemon.js",
        "test/intelligence/faction-join-all.js",
        "test/intelligence/faction-join.js",
        "test/intelligence/home.js",
        "test/intelligence/int.js",
        "test/intelligence/program.js",
        "test/intelligence/relocate.js",
        "test/intelligence/study.js",
        "test/intelligence/tor-program.js",
        "test/intelligence/tor.js",
        "test/intelligence/travel.js",
        "test/intelligence/util.js",
    ];
    return dir;
}

/**
 * The directory structure under "src/" on github.com.
 *
 * @return All files under "src/" on github.com.
 */
function dir_structure() {
    const filesystem = [
        dir_root(),
        dir_chain(),
        dir_cct(),
        dir_corporation(),
        dir_gang(),
        dir_lib(),
        dir_singularity(),
        dir_sleeve(),
        dir_test(),
    ].flat();
    assert(filesystem.length > 0);
    return filesystem;
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
    if (newf.length === 1) {
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
    const msg = "Usage: run pull.js";
    ns.tprint(msg);
}

/**
 * Pull all files (on github.com) under the directory quacksouls/bitburner/src
 * into the game.
 *
 * Usage: run pull.js
 *
 * @param ns The Netscript API.
 */
export async function main(ns) {
    // Sanity check.
    // The script does not accept any command line arguments.
    if (ns.args.length > 0) {
        usage(ns);
        return;
    }
    // Pull files into our home server.
    const home = "home";
    // The base URL where files are found.
    const github = "https://raw.githubusercontent.com/";
    const quack = "quacksouls/bitburner/main/src/";
    const prefix = github + quack;
    // Pull files into home server.
    for (const f of dir_structure()) {
        const file = prefix + f;
        const target = target_name(f);
        const success = await ns.wget(file, target, home);
        if (success) {
            ns.tprint(file);
        }
    }
    ns.tprint("Download complete.");
}
