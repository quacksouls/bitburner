# Proto batcher and pserv

> Bitburner v2.2.2

A proto batcher that uses a purchased server instead of the RAM of world
servers. Use the save file `pserv.json`, which grants us the following:

<!-- prettier-ignore -->
- Starts in BN1.1.
- 20 Hack and default values in other stats.
- Start with $29.812b. The money allows us to puchase a server with at most
  524,288GB RAM.
- Installed the Augmentation `CashRoot Starter Kit` which allows us to start
  with the program `BruteSSH.exe`.
- Manually purchased the TOR router and the program `FTPCrack.exe`.

For extra money, run the scripts [`/cct/solver.js`](../../src/cct/solver.js) and
[`/test/hgw/nuke.js`](../../src/test/hgw/nuke.js). Can take a while for your
money to increase because you are relying on money from solving Coding
Contracts. The save file `pserv.json` has money obtained from legitimate means,
instead of cheating in the money.

Use the script [`proto.js`](../../src/test/hgw/batcher/proto.js) to prep a
target server and hack a specific amount of money from the target. We note the
time required to steal the target amount of money as well as various other
Hack-related statistics gained in the process. We generally hack at most 90% of
money from a server provided that doing so allows us to pack all of the HGW
operations into the available RAM of a purchased server. If not, decrease the
percentage of money to steal until we find the highest percentage that allows us
to fit all HGW operations into the available RAM. Here are explanation of the
headers in the data tables below:

<!-- prettier-ignore -->
- time -- The amount of time in `h:mm:ss` required to steal a specific amount
  of money.
- Hack -- The number of Hack levels gained.
- XP -- The amount of Hack XP gained.
- XP/s -- The amount of Hack XP gained per second.
- $/s -- The amount of money gained per second.

## `n00dles` $100m

Time how long it takes to steal $100m from `n00dles`. Use pserv with varying
amounts of RAM. First, purchase the program `Formulas.exe` because the proto
batcher requires access to the Formulas API.

| RAM (GB) |    Time | Hack |             XP |       XP/s |          $/s |
| -------: | ------: | ---: | -------------: | ---------: | -----------: |
|      128 | 3:43:49 |  128 |   52445.250000 |   3.905318 |  7446.466052 |
|      256 | 1:51:50 |  128 |   52752.150000 |   7.861562 | 14902.827603 |
|      512 | 1:05:19 |  131 |   57443.100000 |  14.657333 | 25516.264194 |
|     1024 | 1:04:59 |  133 |   60993.900000 |  15.641667 | 25644.642193 |
|     2048 | 1:00:22 |  135 |   66135.300000 |  18.258611 | 27607.965782 |
|     4096 | 0:58:47 |  141 |   78368.400000 |  22.215488 | 28347.507560 |
|     8192 | 0:54:19 |  149 |  101219.250000 |  31.050002 | 30675.985213 |
|    16384 | 0:49:47 |  161 |  147236.100000 |  49.289858 | 33476.747721 |
|    32768 | 0:46:07 |  176 |  239919.900000 |  86.692989 | 36134.138595 |
|    65536 | 0:43:23 |  194 |  425622.450000 | 163.471140 | 38407.546315 |
|   131072 | 0:39:45 |  214 |  796042.500000 | 333.719508 | 41922.322966 |
|   262144 | 0:38:13 |  235 | 1538182.800000 | 670.726946 | 43605.151861 |

## `joesguns` $1b

Time how long it takes to steal $1b from `joesguns`. Use pserv with varying
amounts of RAM. First, purchase the program `Formulas.exe` because the proto
batcher requires access to the Formulas API.

| RAM (GB) |    Time | Hack |             XP |        XP/s |            $/s |
| -------: | ------: | ---: | -------------: | ----------: | -------------: |
|      256 | 5:07:12 |  185 |  319770.000000 |   17.347863 |   54251.064596 |
|      512 | 2:23:09 |  185 |  321718.125000 |   37.455150 |  116422.255604 |
|     1024 | 1:16:33 |  188 |  343657.500000 |   74.810464 |  217689.017741 |
|     2048 | 0:47:46 |  194 |  423298.125000 |  147.696072 |  348917.379156 |
|     4096 | 0:30:48 |  202 |  537022.500000 |  290.549895 |  541038.588495 |
|     8192 | 0:23:43 |  215 |  819345.000000 |  575.652764 |  702576.770564 |
|    16384 | 0:20:37 |  217 |  861116.250000 |  695.633409 |  807827.525592 |
|    32768 | 0:21:12 |  226 | 1143193.125000 |  898.231831 |  785721.862318 |
|    65536 | 0:18:54 |  234 | 1494691.875000 | 1317.513920 |  881461.886910 |
|   131072 | 0:18:01 |  249 | 2335965.000000 | 2159.018334 |  924251.148613 |
|   262144 | 0:16:34 |  266 | 3980445.000000 | 4003.493110 | 1005790.334958 |

## `phantasy` $10b

Time how long it takes to steal $10b from `phantasy`. Use the save file
`pserv200.json`, which grants us the following:

<!-- prettier-ignore -->
- Starts in BN1.1.
- 200 Hack and default values in other stats. Why 200 Hack? The server
  `phantasy` requires at least 100 Hack. We use the rule of thumb that any
  server we hack should require no more than half of our Hack level.
- Start with $32.84b. The money allows us to puchase a server with at most
  524,288GB RAM.
- Installed the Augmentation `CashRoot Starter Kit`, which allows us to start
  with the program `BruteSSH.exe`.
- Manually purchased the TOR router and the program `FTPCrack.exe`.

First, purchase the program `Formulas.exe` because the proto batcher requires
access to the Formulas API.

| RAM (GB) |    Time | Hack |             XP |        XP/s |            $/s |
| -------: | ------: | ---: | -------------: | ----------: | -------------: |
|     1024 | 3:45:30 |   28 |  384349.500000 |   28.405697 |  739059.025614 |
|     2048 | 2:09:43 |   31 |  441420.750000 |   56.711585 | 1284751.236188 |
|     4096 | 1:37:35 |   39 |  659335.500000 |  112.604213 | 1707843.922193 |
|     8192 | 1:18:00 |   42 |  748833.750000 |  159.984923 | 2136454.493947 |
|    16384 | 1:26:40 |   49 |  973215.000000 |  187.126719 | 1922768.540584 |
|    32768 | 1:24:21 |   54 | 1222188.750000 |  241.469510 | 1975713.736466 |
|    65536 | 1:18:49 |   63 | 1698626.250000 |  359.186704 | 2114571.725216 |
|   131072 | 1:08:22 |   76 | 2635587.000000 |  642.476966 | 2437699.708549 |
|   262144 | 1:09:24 |   93 | 4703139.000000 | 1129.448016 | 2401477.004417 |
