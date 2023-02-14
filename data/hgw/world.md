# Sequential batcher vs general-purpose `hack.js`

A comparison of a sequential batcher and the general-purpose
[`hack.js`](../../doc/guide/script/hack.js) script. Here are the specific
scripts used:

1. [`world.js`](../../src/test/hgw/world.js) -- The main script to gather data.
   Run this script only.
1. [`naive.js`](../../src/test/hgw/naive.js) -- This script uses the naive
   strategy of running the hack/grow/weaken functions in a loop. It pools the
   resources of world servers to hack a common target.
1. [`proto.js`](../../src/test/hgw/proto.js) -- This script uses a sequential
   batcher, where each of the hack/grow/weaken functions is separated into a
   worker script. It pools the resources of world servers to steal a fraction of
   a prepped target's money. The specific fraction stolen depends on the target
   server. After stealing a fraction of a prepped target's money, the script
   preps the target again. The cycle is prep, hack, prep, hack, etc.

Here are the abbreviations used for port opener programs:

1. B -- `BruteSSH.exe`
1. F -- `FTPCrack.exe`
1. H -- `HTTPWorm.exe`
1. R -- `relaySMTP.exe`
1. S -- `SQLInject.exe`

Here are explanation of the headers in the data tables below:

1. time -- The amount of time in `h:mm:ss` required to steal a specific amount
   of money.
1. Hack -- The number of Hack levels gained.
1. XP -- The amount of Hack XP gained.
1. XP/s -- The amount of Hack XP gained per second.
1. $/s -- The amount of money gained per second.

The save files used:

1. `fresh.json` -- Start in BN1.1 and default values in all stats. We do not
   have any port opener programs.
1. `brutessh.json` --- Default stats in BN1.1. Installed the Augmentation
   `CashRoot Starter Kit`, which starts us with $1m and the `BruteSSH.exe`
   program. The `home` server has 64GB RAM.
1. `bf.json` --- Start in BN1.1 with 39 Hack and default values in other stats.
   Installed the Augmentation `CashRoot Starter Kit`, which allows us to start
   with `BruteSSH.exe`. Bought the TOR router and the `FTPCrack.exe` program.
1. `bfr.json` --- Start in BN1.1 with 160 Hack and default values in other
   stats. Installed the Augmentation `CashRoot Starter Kit`, which allows us to
   start with `BruteSSH.exe`. Bought the TOR router, and the `FTPCrack.exe` and
   `relaySMTP.exe` programs.
1. `bfrh.json` --- Start in BN1.1 with 168 Hack and default values in other
   stats. Installed the Augmentation `CashRoot Starter Kit`, which allows us to
   start with `BruteSSH.exe`. Bought the TOR router and these programs:
   `FTPCrack.exe`, `relaySMTP.exe`, `HTTPWorm.exe`.
1. `bfrhs.json` --- Start in BN1.1 with 169 Hack and default values in other
   stats. Installed the Augmentation `CashRoot Starter Kit`, which allows us to
   start with `BruteSSH.exe`. Bought the TOR router and these programs:
   `FTPCrack.exe`, `relaySMTP.exe`, `HTTPWorm.exe`, `SQLInject.exe`.

## $10m

Use the main script, i.e. [`world.js`](../../src/test/hgw/world.js), to steal
$10m from a common target. We note the time required to steal the target amount
of money as well as various other Hack-related statistics gained in the process.

| Target     | Save            | Programs  | Naive time | Proto time | Naive Hack | Proto Hack |     Naive XP |      Proto XP | Naive XP/s | Proto XP/s |     Naive $/s |    Proto $/s |
| ---------- | --------------- | --------- | ---------: | ---------: | ---------: | ---------: | -----------: | ------------: | ---------: | ---------: | ------------: | -----------: |
| `n00dles`  | `fresh.json`    | None      |    0:43:04 |    1:19:59 |         88 |        108 |  7872.975000 |  15451.425000 |   3.046640 |   3.219875 |   3869.744403 |  2083.869496 |
| `n00dles`  | `brutessh.json` | B         |    0:23:57 |    0:39:23 |         95 |        113 |  9904.950000 |  18129.375000 |   6.891172 |   7.672371 |   6957.300957 |  4232.010675 |
| `n00dles`  | `bf.json`       | B/F       |    0:12:36 |    0:26:28 |         67 |         90 | 12812.250000 |  27492.300000 |  16.944462 |  17.311965 |  13225.204065 |  6297.023019 |
| `joesguns` | `bf.json`       | B/F       |    0:34:06 |    0:40:07 |        102 |        121 | 41778.750000 |  76425.000000 |  20.414882 |  31.747423 |   4886.427215 |  4154.062549 |
| `joesguns` | `bfr.json`      | B/F/R     |    0:01:55 |    0:05:49 |          2 |          8 |  5227.500000 |  20533.125000 |  45.324490 |  58.866554 |  86703.949365 | 28669.067223 |
| `joesguns` | `bfrh.json`     | B/F/R/H   |    0:01:02 |    0:02:05 |          1 |          3 |  5883.750000 |  11040.000000 |  94.496820 |  88.090261 | 160606.449955 | 79791.902718 |
| `phantasy` | `bfrhs.json`    | B/F/R/H/S |    0:19:44 |    0:31:12 |         10 |         22 | 38178.000000 | 100098.000000 |  32.254086 |  53.479353 |  16896.686898 | 10685.398883 |

## $50m

Use the main script, i.e. [`world.js`](../../src/test/hgw/world.js), to steal
$50m from a common target. We note the time required to steal the target amount
of money as well as various other Hack-related statistics gained in the process.

| Target     | Save            | Programs  | Naive time | Proto time | Naive Hack | Proto Hack |     Naive XP |      Proto XP | Naive XP/s | Proto XP/s |     Naive $/s |     Proto $/s |
| ---------- | --------------- | --------- | ---------: | ---------: | ---------: | ---------: | -----------: | ------------: | ---------: | ---------: | ------------: | ------------: |
| `n00dles`  | `fresh.json`    | None      |    2:35:46 |    4:45:13 |        138 |        158 | 40339.200000 |  76324.050000 |   4.316230 |   4.460086 |   5349.920655 |   2921.809173 |
| `n00dles`  | `brutessh.json` | B         |    1:25:41 |    2:17:48 |        146 |        163 | 50782.050000 |  88699.050000 |   9.877001 |  10.727524 |   9724.894407 |   6047.146944 |
| `n00dles`  | `bf.json`       | B/F       |    0:44:30 |    1:38:12 |        114 |        138 | 60324.000000 | 132645.150000 |  22.594122 |  22.512590 |  18727.307186 |   8486.020893 |
| `joesguns` | `bf.json`       | B/F       |    0:41:53 |    0:47:44 |        111 |        128 | 55295.625000 |  95325.000000 |  22.003926 |  33.289122 |  19896.625095 |  17460.856252 |
| `joesguns` | `bfr.json`      | B/F/R     |    0:06:44 |    0:13:27 |          7 |         16 | 18515.625000 |  49057.500000 |  45.868222 |  60.766168 | 123863.551911 |  61933.617072 |
| `joesguns` | `bfrh.json`     | B/F/R/H   |    0:06:30 |    0:04:09 |          7 |          6 | 27508.125000 |  21650.625000 |  70.584692 |  86.787183 | 128297.897454 | 200426.507608 |
| `phantasy` | `bfrhs.json`    | B/F/R/H/S |    0:19:51 |    0:31:12 |         10 |         22 | 38583.000000 |  98066.250000 |  32.403193 |  52.374123 |  41991.541224 |  26703.439083 |

## Comparison, `joesguns`

Use various techniques to steal $1b from `joesguns`. Use the save file
`pserv.json`, which grants us the following:

1. Starts in BN1.1.
1. 20 Hack and default values in other stats.
1. Start with $29.812b.
1. Installed the Augmentation `CashRoot Starter Kit`, which allows us to start
   with the program `BruteSSH.exe`.
1. Manually purchased the TOR router and the program `FTPCrack.exe`.

Here are the techniques used:

1. naive -- The naive algorithm, where we run the hack/grow/weaken functions in
   a loop. Manually purchase the remaining port opener programs. Use the script
   [`world.js`](../../src/test/hgw/world.js) to gather relevant data.
1. wbatcher -- A sequential batcher that pools the resources of world servers to
   hack a common target. Manually purchase the remaining port opener programs.
   Use the script [`world.js`](../../src/test/hgw/world.js) to gather relevant
   data.
1. pbatcher -- A sequential batcher that uses a purchased server to hack a
   common target. Use the script [`pserv.js`](../../src/test/hgw/pserv.js) to
   gather relevant data. Pass the command line argument
   `524288 joesguns 0.9 1e9` to the script.

| Technique |    Time | Hack |         Hack XP |         XP/s |           $/s |
| --------- | ------: | ---: | --------------: | -----------: | ------------: |
| naive     | 1:26:07 |  218 |   881761.875000 |   170.649012 | 193531.855731 |
| wbatcher  | 1:02:13 |  211 |   712683.750000 |   190.903637 | 267865.848497 |
| pbatcher  | 0:29:01 |  362 | 80921542.500000 | 46482.350600 | 574412.562633 |
