# Parallel batcher and pserv

> Bitburner v2.2.2

A parallel batcher that uses a purchased server instead of the RAM of world
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

Use the script [`pp.js`](../../src/test/hgw/batcher/pp.js) to prep a target
server and hack a specific amount of money from the target. We note the time
required to steal the target amount of money as well as various other
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
amounts of RAM. First, purchase the program `Formulas.exe` because the parallel
batcher requires access to the Formulas API.

| RAM (GB) |    Time | Hack |             XP |        XP/s |          $/s |
| -------: | ------: | ---: | -------------: | ----------: | -----------: |
|      128 | 5:25:44 |  128 |   52358.625000 |    2.678918 |  5116.479207 |
|      256 | 2:44:08 |  130 |   55565.400000 |    5.641758 | 10153.364541 |
|      512 | 1:28:13 |  132 |   59451.150000 |   11.231833 | 18892.541867 |
|     1024 | 0:51:35 |  134 |   62832.825000 |   20.296295 | 32302.057835 |
|     2048 | 0:49:09 |  138 |   72411.075000 |   24.549081 | 33902.384863 |
|     4096 | 0:46:19 |  145 |   91711.950000 |   32.999454 | 35981.629219 |
|     8192 | 0:43:43 |  157 |  130597.500000 |   49.773879 | 38112.428615 |
|    16384 | 0:39:32 |  171 |  207276.300000 |   87.383139 | 42157.805096 |
|    32768 | 0:37:31 |  189 |  362383.725000 |  160.947700 | 44413.611528 |
|    65536 | 0:33:53 |  209 |  670705.200000 |  329.868049 | 49182.270972 |
|   131072 | 0:31:55 |  230 | 1288918.950000 |  673.011658 | 52215.203919 |
|   262144 | 0:30:10 |  251 | 2525079.150000 | 1394.515088 | 55226.589173 |

## `joesguns` $1b

Time how long it takes to steal $1b from `joesguns`. Use pserv with varying
amounts of RAM. First, purchase the program `Formulas.exe` because the parallel
batcher requires access to the Formulas API.

| RAM (GB) |    Time | Hack |              XP |        XP/s |           $/s |
| -------: | ------: | ---: | --------------: | ----------: | ------------: |
|      256 | 7:32:49 |  187 |   338109.375000 |   12.444538 |  36806.249583 |
|      512 | 4:19:29 |  191 |   384817.500000 |   24.716556 |  64229.293439 |
|     1024 | 3:12:47 |  200 |   506317.500000 |   43.769271 |  86446.293166 |
|     2048 | 2:43:46 |  211 |   714279.375000 |   72.691224 | 101768.616431 |
|     4096 | 3:32:04 |  232 |  1375434.375000 |  108.096816 |  78591.038720 |
|     8192 | 4:19:52 |  253 |  2627634.375000 |  168.519520 |  64133.549652 |
|    16384 | 2:32:20 |  262 |  3525234.375000 |  385.678228 | 109404.988933 |
|    32768 | 1:26:31 |  270 |  4556572.500000 |  877.654180 | 192612.798389 |
|    65536 | 0:59:09 |  283 |  6730663.125000 | 1896.348726 | 281747.680864 |
|   131072 | 1:00:18 |  296 | 10366035.000000 | 2865.022412 | 276385.562282 |
|   262144 | 0:49:20 |  305 | 13636929.375000 | 4605.900587 | 337752.030565 |

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

First, purchase the program `Formulas.exe` because the parallel batcher requires
access to the Formulas API.

| RAM (GB) |     Time | Hack |              XP |        XP/s |           $/s |
| -------: | -------: | ---: | --------------: | ----------: | ------------: |
|     1024 |  9:12:07 |   34 |   516953.250000 |   15.605098 | 301866.716607 |
|     2048 |  6:05:49 |   40 |   682173.000000 |   31.078737 | 455584.394048 |
|     4096 |  8:43:49 |   52 |  1112352.750000 |   35.391499 | 318167.943167 |
|     8192 |  6:08:18 |   61 |  1567570.500000 |   70.934672 | 452513.442930 |
|    16384 | 10:14:46 |   77 |  2762752.500000 |   74.898534 | 271101.136638 |
|    32768 |  4:16:23 |   92 |  4535525.250000 |  294.823502 | 650031.663042 |
|    65536 |  4:46:24 |  106 |  7289435.250000 |  424.177948 | 581907.833713 |
|   131072 |  5:13:42 |  128 | 14645558.250000 |  778.082956 | 531275.723706 |
|   262144 |  4:22:40 |  141 | 22028535.000000 | 1397.719352 | 634503.997439 |
|   524288 |  4:20:17 |  156 | 35649481.500000 | 2282.730607 | 640326.453794 |
|  1048576 |  3:50:18 |  179 | 72369911.250000 | 5237.277568 | 723681.634791 |
