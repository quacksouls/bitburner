# After the first reboot

You have installed your first batch of Augmentations, bought from CyberSec. Most
of your progress has been reset, but you get to keep the effects of all
Augmentations installed so far. All scripts you have saved on your home server
can still be found there. It is time to start again, but this time with slightly
better stat multipliers.

## Reboot income and Hack farming

First things first. Let's restart your streams of passive income as per the
section [Starting out](start.md). Use the starting amount of $1k to purchase a
Hacknet node and let it generate passive income. While the Hacknet node is
running in the background, you need to upgrade your Hack stat. The simplest way
to do so is to take the course `Study Computer Science (free)` at Rothman
University, stopping when you have at least 10 Hack. You also need to work at a
company to supplement your passive income. Again, apply at and work for
FoodNStuff (or Joe's Guns if you want).

Second, follow the section [First script](script.md). Deploy your hack script to
the following servers: `n00dles`, `foodnstuff`, `sigma-cosmetics`, `joesguns`,
and any other servers to which you can gain root access. You might need to
commit crimes in The Slums to raise enough money to purchase the TOR router and
purchase various port opener programs via the dark web. All of the above
compromised servers can be directed to hack `n00dles`. If you so choose,
redirect the compromised servers to hack another common target such as
`foodnstuff` or `joesguns`. Your objective is to use a bunch of world servers to
target a low-level server as a means of increasing your Hack stat and generate
passive income. As your stat multipliers are still rather low, you might find it
more profitable to target `n00dles`, rather than `foodnstuff` or `joesguns`.

## Join Sector-12

Third, let's join another faction. You have already purchased and installed all
Augmentations from CyberSec. There is no need to join CyberSec again. You could
join CyberSec again if you want to level up the `NeuroFlux Governor`
Augmentation or perform hacking contracts to raise your Hack stat. However,
other factions also allow you to level up `NeuroFlux Governor`. This time
around, explore what the faction Sector-12 has on offer. The requirements to
receive an invitation from Sector-12 are:

1. Be in the city Sector-12. Do not travel to a different city.
1. Have at least $15m. You might want to commit crimes in The Slums to quickly
   raise this amount of money.

You can be a member of both CyberSec and Sector-12. While you work on hacking
contracts for Sector-12 you increase your reputation within the faction.
Simultaneously, you passively earn reputation within CyberSec, albeit rather
slowly. Let the game run until you have enough reputation points to unlock the
following Augmentations from Sector-12:

1. `Augmented Targeting I`
1. `Augmented Targeting II`
1. `Wired Reflexes`
1. `Speech Processor Implant`
1. `Neuralstimulator`
1. `CashRoot Starter Kit`

The `CashRoot Starter Kit` is useful because after a soft reset the Augmentation
would grant you $1m and the program `BruteSSH.exe`. It is worth waiting to
unlock and buy `CashRoot Starter Kit` from Sector-12.

## Purchased servers

You have been using servers found on the network of the game world to hack
servers on the same network. Now that you have a source of income, you can
purchase new servers and run your scripts on those purchased servers to hack
servers in the game world. While you are waiting to unlock all Augmentations
from Sector-12, your goal for now should be to automate these tasks:

1. Purchase as many servers as possible. You can purchase a maximum of 25
   servers.
1. Copy your script `hack.js` over to each purchased server. Then use the
   purchased server to hack a common target.
1. Your deploy script must ensure that any server you want to target is already
   compromised. In particular, the deploy script must ensure the following:
    - You have the Hack stat required by the target server.
    - Open as many ports as required by the target server.
    - Run `NUKE.exe` against the target to gain root access.
    - Copy `hack.js` over to a purchased server.
    - Run the script on the purchased server and direct it to hack the target.
      Use as many threads as the RAM of the purchased server allows.

Keep your deploy script separate from the `hack.js` script. You want your deploy
script to handle all the logic necessary to compromise a target server.
Furthermore, your deploy script should figure out how many threads can be used
to run `hack.js` on a purchased server. Meanwhile your script `hack.js` should
contain the bare minimum code required to hack, grow, or weaken a target server.
The lower is the RAM required by `hack.js`, the more threads you can use to run
the script.

Why would you want to waste money to buy a server to do what can normally be
done by means of a world server? An answer to this question can be summarized
as: RAM. The servers you find in the game world usually have limited RAM. Some
world servers have 0GB RAM; you cannot run scripts on that server. The maximum
amount of RAM a world server can have is $2^{11} = 2,048$ GB. Contrast that with
the maximum of $2^{20} = 1,048,576$ GB (or approximately 1.049PB) of RAM a
purchased server can have. A purchased server allows you to run your hack script
using an order of magnitude or more threads than any world server.

[[TOC](README.md "Table of Contents")]
[[Previous](program.md "Programs and factions")]
