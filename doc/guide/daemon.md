# Find the daemon

You should have joined the faction Daedalus and purchased the Augmentation
`The Red Pill` (or TRP). Install the Augmentation to soft reset and a new server
called `w0r1d_d43m0n` would appear. This is the very last server to which you
should gain root access. You must satisfy the following requirements to gain
root access to `w0r1d_d43m0n`:

1. Have at least 3000 Hack.
1. Open 5 ports on the server.

Obtain root access to `w0r1d_d43m0n`, then manually hack it from the Terminal:

```sh
$ hack
```

A successful hack would result in the game presenting you with a world map. Each
location on the map is called a BitNode, a simulated world most aspects of which
are governed by various multipliers. Some multipliers affect the difficulty of
hacking a server, how much money you can make from various activities, the
amount of XP you gain from certain tasks, etc. You have been playing in a
BitNode called `BitNode-1: Source Genesis`, abbreviated as BN1. You have now
completed level 1 of BN1, shortened as BN1.1. Your reward is an increase of 16%
in all your multipliers and your `home` server now starts with 32GB RAM after
entering a new BitNode. If you want, you can enter BN1 again to play through
BN1.2 and complete it to increase all your multipliers by 24%. Details on all
BitNodes can be
[found here](https://bitburner.readthedocs.io/en/latest/guidesandtips/recommendedbitnodeorder.html).

## What's next?

After BN1.1, the next BitNode you should enter is `BitNode-4: The Singularity`
to gain access to the
[Singularity API](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.md).
The API allows you to automate most actions in the game that you have been
performing manually. After entering BN4.1, most of your progress would be reset
but you would now have Level 1 of `Source-File 1: Source Genesis`. Your money
would be reset to $1k, each of your stats would be at 1, your `home` server
would have 32GB RAM instead of the previous default of 8GB RAM, and you keep all
your scripts. The effect is as if you started the game all over again without
Augmentations and you must work your way up again by raising your money and
stats.

In BN4.1, raise your Hack stat and money. While waiting for your Hack stat and
money to increase, browse through the
[Singularity API](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.md)
to get an idea of which tasks you can now automate via scripts. Solve a couple
of
[Coding Contracts](https://bitburner.readthedocs.io/en/latest/basicgameplay/codingcontracts.html)
to earn money. Join factions and buy their Augmentations. Raise your stats,
especially your Hack, and money. Join Daedalus and raise your reputation high
enough to allow you to purchase TRP. Install TRP, then hack the `w0r1d_d43m0n`
server to break BN4.1.

## Destroy the daemon

Here are some ways to destroy a BitNode:

1. In some BitNodes, the only way is to purchase TRP from Daedalus, then
   manually hack (or install a backdoor on) the `w0r1d_d43m0n` server.
1. If you have access to the
   [Singularity API](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.md),
   you can use the function
   [`ns.singularity.installBackdoor()`](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.installbackdoor.md)
   to destroy `w0r1d_d43m0n` via a script.
1. After unlocking the ability to create a gang, you can purchase TRP from the
   faction in which you created your gang. This can only be done in
   `BitNode-2: Rise of the Underworld`. In other BitNodes, you cannot buy TRP
   from your gang faction.

[[TOC](README.md "Table of Contents")]
[[Previous](misc.md "Miscellaneous topics")]

![CC BY-NC-SA 4.0](image/cc.png "CC BY-NC-SA 4.0") \
This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode).
