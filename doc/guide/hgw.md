# Hack, grow, weaken (HGW)

A hack/grow/weaken (or HGW) algorithm uses a separate script for each of the
[`ns.hack()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.hack.md),
[`ns.grow()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.grow.md),
and
[`ns.weaken()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.weaken.md)
functions. You create the following worker scripts:

1. [`hack.js`](script/hgw/hack.js) -- Should only have the function
   [`ns.hack()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.hack.md).
1. [`grow.js`](script/hgw/grow.js) -- Should only have the function
   [`ns.grow()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.grow.md).
1. [`weaken.js`](script/hgw/weaken.js) -- Should only have the function
   [`ns.weaken()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.weaken.md).

Each worker script should only have one of the dedicated HGW functions so as to
maximize RAM usage. How you use the worker scripts is a different matter.

## HGW and world servers

The first task you might want to do is replace the general-purpose hack script
from the section [First script](script.md) with a script that uses the HGW
worker scripts. Write a manager script whose tasks include:

1. Gain root access to as many world servers as possible. The compromised
   servers are your botnet. Adapt one or more of the algorithms described in the
   subsection [Your first worm](reboot.md#your-first-worm) to help you scan all
   servers in the network of world servers.
1. Copy the HGW worker scripts to each server in your botnet.
1. Determine which common server your botnet should target. One way to help you
   determine which common server to target is to use the server rater described
   in the subsection [Your first worm](reboot.md#your-first-worm). This approach
   might not be a good idea depending on which server your botnet is targeting.
   Each world server generally has limited RAM. The collective RAM of all world
   servers is too small to be used to target a server that has a high Hack
   requirement and/or high security. You might want to follow a rule of thumb
   called _Joe's n00dles phantasy_:
    - Target `n00dles` if you have less than 2 port opener programs. For
      example, the easiest port opener programs to create (and cheapest to buy)
      are `BruteSSH.exe` and `FTPCrack.exe`. In the absence of one or both of
      these programs, direct your botnet to target `n00dles`.
    - Target `joesguns` if you have at least 2 port opener programs, but you do
      not have all of the remaining 3 port opener programs.
    - Target `phantasy` if you have all 5 port opener programs and the server's
      Hack requirement is less than half of your Hack stat.
1. Prep the target server. To prep a server means to weaken it to its minimum
   security level and grow the server to the maximum amount of money it can
   hold. The prepping procedure runs the `grow.js` and `weaken.js` worker
   scripts in a loop until such a time as the target server is at its minimum
   security level and holds the maximum amount of money possible. The loop
   either runs:

    - `grow.js` followed by `weaken.js`; or
    - `weaken.js` followed by `grow.js`.

    The order in which the loop runs `grow.js` and `weaken.js` might affect the
    time required for the target server to be prepped again. For example,
    [experimental data](../../data/hgw/README.md) shows that the prepping loop
    for `n00dles` and `joesguns` should be `grow.js` followed by `weaken.js`,
    whereas the prepping loop for `phantasy` should be `weaken.js` followed by
    `grow.js`. Direct all servers in your botnet to prep a target server. Each
    server in the botnet should use all of its available RAM to run a worker
    script.

1. Steal money from the target server. Unlike the prepping stage, during the
   hacking stage you should refrain from using all servers in your botnet to run
   the `hack.js` worker script against the target server. The reason is simple.
   The more money you hack from a server, the longer it would take to prep the
   server again. You want to hack a fraction of the (prepped) target's money
   such that the subsequent prepping time is as low as possible, but at the same
   time you want to steal as much money as possible within a given time frame.
   Which fraction of money should you hack in order to satisfy the above 2
   objectives? [Experimental data](../../data/hgw/README.md) shows that you
   should steal 70% of money from a prepped `n00dles`, steal 60% of money from a
   prepped `joesguns`, and aim to steal 100% of money from a prepped `phantasy`.
   On the other hand, you might want to steal 50% of money from any prepped
   server. Suppose you want to hack 50% of a prepped server's money. Choose from
   among your botnet a combination of servers having enough RAM to run `hack.js`
   and allow you to steal 50% of the target's money.

Here is an [example HGW manager script](script/hgw/hgw.js) to pool the resources
of world servers to hack a common target.

[[TOC](README.md "Table of Contents")]
[[Previous](reboot.md "After the first reboot")]
[[Next](faction.md "Faction progression")]

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-blue.svg)](http://creativecommons.org/licenses/by-nc-sa/4.0/)
