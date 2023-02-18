# Hack, grow, weaken (HGW)

A hack/grow/weaken (or HGW) algorithm uses a separate script for each of the
functions
[`ns.hack()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.hack.md),
[`ns.grow()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.grow.md),
and
[`ns.weaken()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.weaken.md).
You create the following worker scripts:

<!-- prettier-ignore -->
- [`hack.js`](script/hgw/hack.js) -- Should only have the function
  [`ns.hack()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.hack.md).
- [`grow.js`](script/hgw/grow.js) -- Should only have the function
  [`ns.grow()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.grow.md).
- [`weaken.js`](script/hgw/weaken.js) -- Should only have the function
  [`ns.weaken()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.weaken.md).

Each worker script should only have one of the dedicated HGW functions so as to
maximize RAM usage. How you use the worker scripts is a different matter.

## World servers

The first task you might want to do is write a sequential batcher that pools the
resources of world servers in order to target a common server. Replace the
general-purpose hack script from the chapter [_First script_](script.md) with a
script that uses the HGW worker scripts. Your sequential batcher accomplishes
the following tasks:

1. _Nuke._ Gain root access to as many world servers as possible. The
   compromised servers are your botnet. Adapt one or more of the algorithms
   described in the section [_Your first worm_](reboot.md#your-first-worm) to
   help you scan all servers in the network of world servers.
1. _scp._ Copy the HGW worker scripts to each server in your botnet.
1. _Target._ Determine which common server your botnet should target. One way to
   help you determine the target is to use the server rater described in the
   section [_Your first worm_](reboot.md#your-first-worm). This approach might
   not be a good idea depending on which server your botnet is targeting. Each
   world server generally has limited RAM. The collective RAM of all world
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
1. _Prep._ To prep a server means to weaken it to its minimum security level and
   grow the server to the maximum amount of money it can hold. The prepping
   procedure runs the [`grow.js`](script/hgw/grow.js) and
   [`weaken.js`](script/hgw/weaken.js) worker scripts in a loop until such a
   time as the target server is at its minimum security level and holds the
   maximum amount of money possible, i.e. the target is prepped. The loop either
   runs:

    - [`grow.js`](script/hgw/grow.js) followed by
      [`weaken.js`](script/hgw/weaken.js); or
    - [`weaken.js`](script/hgw/weaken.js) followed by
      [`grow.js`](script/hgw/grow.js).

    The order in which the loop runs [`grow.js`](script/hgw/grow.js) and
    [`weaken.js`](script/hgw/weaken.js) might affect the time required for the
    target server to be prepped. For example,
    [experimental data](../../data/hgw/README.md) show that the prepping loop
    for `n00dles` and `joesguns` should be [`grow.js`](script/hgw/grow.js)
    followed by [`weaken.js`](script/hgw/weaken.js), whereas the prepping loop
    for `phantasy` should be [`weaken.js`](script/hgw/weaken.js) followed by
    [`grow.js`](script/hgw/grow.js). Direct all servers in your botnet to prep a
    target server. Each server in the botnet should use all of its available RAM
    to run a worker script.

1. _Hack._ Steal money from the prepped server. Unlike the prepping stage,
   during the hacking stage you should refrain from using all servers in your
   botnet to run the [`hack.js`](script/hgw/hack.js) worker script against the
   target server. The reason is simple. The more money you hack from a server,
   the longer it would take to prep the server again. You want to hack a
   fraction of the (prepped) target's money such that the subsequent prepping
   time is as low as possible, but at the same time you want to steal as much
   money as possible within a given time frame. Which fraction of money should
   you hack in order to satisfy the above two objectives?
   [Experimental data](../../data/hgw/README.md) show that you should steal 70%
   of money from a prepped `n00dles`, steal 60% of money from a prepped
   `joesguns`, and aim to steal 100% of money from a prepped `phantasy`. On the
   other hand, you might want to steal 50% of money from any prepped server.
   Suppose you want to hack 50% of a prepped server's money. Choose from among
   your botnet a combination of servers having enough RAM to run
   [`hack.js`](script/hgw/hack.js) and allow you to steal 50% of the target's
   money.

Here is an [example sequential batcher](script/hgw/world.js) that pools the
resources of world servers to hack a common target.

Is the sequential batcher any better than the basic script `hack.js`? Let's
define some basic terms. By _naive technique_ we mean a manager script that uses
the basic script `hack.js` and pools the resources of world servers to hack a
common target. The term _wbatcher technique_ refers to the sequential batcher as
described in this section, where we pool the resources of world servers and use
the HGW worker scripts to target a common server.
[Experimental data](../../data/hgw/world.md) show that when hacking `n00dles`,
the wbatcher technique requires nearly 3 hours to steal $100m whereas the naive
technique takes about 42 minutes. The situation is reversed when we target
`joesguns`. The wbatcher technique requires about 1 hour and 2 minutes to hack
$1b from `joesguns`, whereas the naive technique takes over 1 hour and 26
minutes. As regards the server `phantasy`, the naive technique requires about 2
hours less than the wbatcher technique to steal $10b fom `phantasy`. The
experiment shows that the naive technique outperforms the wbatcher technique
whenever we are hacking `n00dles` or `phantasy`. However, if we want to hack
`joesguns` then we should use the wbatcher technique.

[[TOC](README.md "Table of Contents")]
[[Previous](reboot.md "After the first reboot")]
[[Next](faction.md "Faction progression")]

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-blue.svg)](http://creativecommons.org/licenses/by-nc-sa/4.0/)
