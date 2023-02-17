# HGW algorithms

Testing various hack/grow/weaken (HGW) strategies. We use the following basic
HGW algorithms.

1. _GW._ Apply the following actions in a loop until a server is at minimum
   security level and maximum money:
    - Grow
    - Weaken
1. _MGW._ Grow a server to maximum money, then weaken the server to minimum
   security level.
1. _MWG._ Weaken a server to its minimum security level, then apply the strategy
   GW.
1. _WG._ Apply the following actions in a loop until a server is at minimum
   security level and maximum money:
    - Weaken
    - Grow

We want to use one or more of the above algorithms to prep a server. Prepping a
server is the process of lowering a server to its minimum security level and
growing the server to the maximum amount of money it can hold. A server is said
to be prepped if its security level is at minimum and its money is at maximum.
Unless otherwise stated, we start with the following stats:

1. Default starting stats in BN1.1.
1. No installed Augmentations.
1. No port openers.
1. The `home` server has 64GB RAM.

## Prep `n00dles`

The amount of time required to prep a server. Time is in the format `h:mm:ss`.
We used the save file `fresh.json` and the script
[`/test/hgw/prep.js`](../../src/test/hgw/prep.js). Floating point numbers are
rounded to 6 decimal places. The general process is as follows:

1. Use a particular strategy to prep `n00dles`.
1. Print the data to the terminal.
1. Reload the save file `fresh.json` and prep `n00dles` by means of a different
   strategy.

| Server    | Strategy |    Time | Hack |    Hack XP |     XP/s |
| --------- | -------- | ------: | ---: | ---------: | -------: |
| `n00dles` | GW       | 0:05:26 |   17 | 369.600000 | 1.135250 |
| `n00dles` | MGW      | 0:05:26 |   17 | 369.600000 | 1.134905 |
| `n00dles` | MWG      | 0:05:26 |   17 | 369.600000 | 1.135201 |
| `n00dles` | WG       | 0:05:26 |   17 | 369.600000 | 1.134898 |

## Buy `BruteSSH.exe`

How long it takes to hack enough money to purchase the `BruteSSH.exe` program.
This includes the cost of buying the Tor router. We used the save file
`fresh.json` and the script
[`/test/hgw/brutessh.js`](../../src/test/hgw/brutessh.js). Here is the strategy:

1. Prep the server `n00dles` to minimum security level and maximum money. First,
   weaken the server to minimum security level. Then apply the HGW actions grow
   and weaken in turn until the server has maximum money.
1. Use a certain number of threads to hack `n00dles` to steal $p$% of the
   server's money. The number of threads is chosen to allow us to steal $p$% (or
   close to this percentage) of money on `n00dles`.

Repeat the above steps in order until we have raised enough money to purchase
the Tor router as well as the `BruteSSH.exe` program. The following table
provides data on the time taken to achieve our goal. The column `Fraction` lists
the fraction of money we want to steal from `n00dles`. Multiply each number by
100 to get the percentage amount we want to steal. The time required to reach
our goal is given in the `Time` column as the format `h:mm:ss`. The number of
Hack levels we gained in the process is listed in the `Hack` column. The column
`Hack XP` lists the total amount of Hack XP we gained. Finally, the column
`XP/s` gives the rate (per second) at which we gained Hack XP. Floating point
numbers are rounded to 6 decimal places. The general process is as follows:

1. Use the above steps until we have stolen enough money to purchase
   `BruteSSH.exe`.
1. Print the data to the terminal.
1. Reload the save file `fresh.json` and use the above steps, but steal a
   different percentage of money.

| Fraction |    Time | Hack |     Hack XP |     XP/s |
| -------: | ------: | ---: | ----------: | -------: |
|      0.1 | 0:28:48 |   60 | 2983.200000 | 1.726779 |
|      0.2 | 0:18:23 |   48 | 1931.325000 | 1.750487 |
|      0.3 | 0:12:42 |   39 | 1288.650000 | 1.691941 |
|      0.4 | 0:18:23 |   49 | 1988.250000 | 1.802850 |
|      0.5 | 0:12:42 |   39 | 1293.600000 | 1.698226 |
|      0.6 | 0:18:17 |   49 | 2010.525000 | 1.832266 |
|      0.7 | 0:12:42 |   39 | 1293.600000 | 1.698101 |
|      0.8 | 0:12:42 |   39 | 1293.600000 | 1.698081 |
|      0.9 | 0:12:42 |   39 | 1293.600000 | 1.698021 |
|      1.0 | 0:12:42 |   39 | 1293.600000 | 1.698032 |

## Has `BruteSSH.exe`, buy `FTPCrack.exe`

We used the save file `brutessh.json`, which allows us to start with the
following stats. We used the script
[`/test/hgw/ftpcrack.js`](../../src/test/hgw/ftpcrack.js).

1. Default starting stats in BN1.1.
1. Installed the Augmentation `CashRoot Starter Kit` so we start with $1m and
   the `BruteSSH.exe` program.
1. The `home` server has 64GB RAM.

Use the same general process as per the above sections. Gather data for a
particular strategy, then reload the save file `brutessh.json` and use a
different strategy to gather data.

### Prep

| Server    | Strategy |    Time | Hack |    Hack XP |     XP/s |
| --------- | -------- | ------: | ---: | ---------: | -------: |
| `n00dles` | GW       | 0:05:02 |   31 | 871.200000 | 2.886718 |
| `n00dles` | MGW      | 0:05:02 |   31 | 871.200000 | 2.886211 |
| `n00dles` | MWG      | 0:05:02 |   31 | 871.200000 | 2.887254 |
| `n00dles` | WG       | 0:05:02 |   31 | 871.200000 | 2.886355 |

### Raise money

Hack `n00dles` to raise enough money to buy `FTPCrack.exe`. Use the same general
process as per the above sections. Gather data for a particular percentage of
money to steal, then reload the save file `brutessh.json` and use a different
percentage to gather data.

| Fraction |    Time | Hack |     Hack XP |     XP/s |
| -------: | ------: | ---: | ----------: | -------: |
|      0.1 | 0:24:24 |   82 | 6494.400000 | 4.435232 |
|      0.2 | 0:15:53 |   68 | 3960.000000 | 4.156568 |
|      0.3 | 0:11:07 |   57 | 2653.200000 | 3.977042 |
|      0.4 | 0:11:02 |   58 | 2811.600000 | 4.244956 |
|      0.5 | 0:10:59 |   60 | 2954.325000 | 4.482845 |
|      0.6 | 0:10:59 |   60 | 2982.375000 | 4.526356 |
|      0.7 | 0:05:36 |   39 | 1284.525000 | 3.826704 |
|      0.8 | 0:05:36 |   39 | 1306.800000 | 3.892182 |
|      0.9 | 0:05:36 |   39 | 1306.800000 | 3.892564 |
|      1.0 | 0:10:59 |   60 | 2982.375000 | 4.525319 |

## Buy `BruteSSH.exe`, then `FTPCrack.exe`

How long it takes to purchase both of the `BruteSSH.exe` and `FTPCrack.exe`
programs. We used the save file `sshftp.json`, which allows us to start at base
stat in BN1.1, without any installed Augmentations. We used the script
[`/test/hgw/sshftp.js`](../../src/test/hgw/sshftp.js). We prep, then hack money
from `n00dles`. The above data suggest we should steal 50% of money from the
target server because the percentage results in the shortest time required to
acquire both `BruteSSH.exe` and `FTPCrack.exe`. This is generally true, as shown
by the table below. We use the following process:

1. Hack enough money to buy the Tor router and `BruteSSH.exe`.
1. Manually purchase the Tor router and `BruteSSH.exe`.
1. Then hack enough money to buy `FTPCrack.exe`.
1. The only variable is the fraction of money to steal. Gather data for a
   particular fraction, then reload the save file `sshftp.json` and gather data
   for a different fraction.

| Fraction | Time (B) | Time (F) | Time (sum) | Hack B/F/sum | Hack XP (B) |  Hack XP (F) | XP/s (B) | XP/s (F) |
| -------: | -------: | -------: | ---------: | -----------: | ----------: | -----------: | -------: | -------: |
|      0.1 |  0:28:48 |  0:33:47 |    1:02:35 |    60/48/108 | 2983.200000 | 12429.450000 | 1.726213 | 6.130441 |
|      0.2 |  0:18:27 |  0:21:04 |    0:39:31 |     48/44/92 | 1909.050000 |  7281.450000 | 1.724727 | 5.759388 |
|      0.3 |  0:12:42 |  0:18:03 |    0:30:45 |     39/47/86 | 1293.600000 |  6177.600000 | 1.698101 | 5.705925 |
|      0.4 |  0:12:42 |  0:14:05 |    0:26:47 |     39/41/80 | 1293.600000 |  4803.975000 | 1.697720 | 5.687877 |
|      0.5 |  0:12:42 |  0:13:59 |    0:26:41 |     39/43/82 | 1293.600000 |  5118.300000 | 1.697916 | 6.100477 |
|      0.6 |  0:12:42 |  0:13:59 |    0:26:41 |     39/43/82 | 1293.600000 |  5160.375000 | 1.697930 | 6.149336 |
|      0.7 |  0:12:42 |  0:09:52 |    0:22:34 |     39/34/73 | 1293.600000 |  3484.800000 | 1.697985 | 5.885870 |
|      0.8 |  0:12:42 |  0:09:52 |    0:22:34 |     39/34/73 | 1293.600000 |  3484.800000 | 1.698240 | 5.887123 |
|      0.9 |  0:12:42 |  0:09:52 |    0:22:34 |     39/34/73 | 1293.600000 |  3484.800000 | 1.698175 | 5.886298 |
|      1.0 |  0:12:42 |  0:09:52 |    0:22:34 |     39/34/73 | 1293.600000 |  3484.800000 | 1.698184 | 5.886506 |

## Prep `foodnstuff`, `joesguns`, and `sigma-cosmetics`

We used the save file `fjs.json`, which starts us with the following stats.

1. 78 Hack.
1. Default values in other stats.
1. Have both of `BruteSSH.exe` and `FTPCrack.exe`, which were manually
   purchased.
1. No Augmentation installed.
1. The `home` server has 64GB RAM.

We used the script [`/test/hgw/prep.js`](../../src/test/hgw/prep.js) to prep
`foodnstuff`, `joesguns`, and `sigma-cosmetics`. The general process is as
follows:

1. Use the given script to prep a certain server by means of a particular
   strategy.
1. Print the data to the terminal.
1. Reload the save file `fjs.json` and change the server and/or strategy.

| Server            | Strategy |    Time | Hack |   Hack XP |      XP/s |
| ----------------- | -------- | ------: | ---: | --------: | --------: |
| `foodnstuff`      | GW       | 1:35:49 |  116 |  222552.0 | 38.709348 |
| `foodnstuff`      | MGW      | 8:05:30 |  166 | 1082412.0 | 37.157822 |
| `foodnstuff`      | MWG      | 1:36:32 |  117 |  224238.0 | 38.712999 |
| `foodnstuff`      | WG       | 1:36:34 |  117 |  224238.0 | 38.704573 |
| `joesguns`        | GW       | 0:37:20 |   82 |   71655.0 | 31.983157 |
| `joesguns`        | MGW      | 4:38:50 |  116 |  221287.5 | 13.227278 |
| `joesguns`        | MWG      | 0:37:53 |   83 |   73762.5 | 32.447181 |
| `joesguns`        | WG       | 0:37:53 |   83 |   73762.5 | 32.445825 |
| `sigma-cosmetics` | GW       | 0:56:42 |   95 |  111276.0 | 32.709822 |
| `sigma-cosmetics` | MGW      | 7:45:17 |  138 |  445104.0 | 15.943993 |
| `sigma-cosmetics` | MWG      | 0:57:24 |   95 |  112962.0 | 32.801595 |
| `sigma-cosmetics` | WG       | 0:57:24 |   95 |  112962.0 | 32.796719 |

## Buy `BruteSSH.exe`, `FTPCrack.exe`, and `relaySMTP.exe`

Same as the above, but we want to raise money to purchase `BruteSSH.exe`,
`FTPCrack.exe`, and `relaySMTP.exe`. The fraction of money to steal is only
relevant when we want to raise money to buy `relaySMTP.exe`. We use the fraction
of 0.5 whenever we raise money to purchase `BruteSSH.exe` and `FTPCrack.exe`.
Use the script [`/test/hgw/smtp.js`](../../src/test/hgw/smtp.js) and the save
file `fresh.json`.

| Fraction | Time (B) | Time (F) | Time (R) | Time (sum) | Hack B/F/R/sum | Hack XP (B) | Hack XP (F) |  Hack XP (R) | XP/s (B) | XP/s (F) |  XP/s (R) |
| -------: | -------: | -------: | -------: | ---------: | -------------: | ----------: | ----------: | -----------: | -------: | -------: | --------: |
|      0.1 |  0:10:39 |  0:09:59 |  0:38:17 |    0:58:55 |   35/39/85/159 | 1108.800000 | 3898.125000 | 71850.000000 | 1.735670 | 6.506950 | 31.278895 |
|      0.2 |  0:14:36 |  0:06:37 |  0:38:50 |    1:00:03 |   44/26/89/159 | 1640.925000 | 2613.600000 | 72151.875000 | 1.873795 | 6.576385 | 30.965473 |
|      0.3 |  0:10:39 |  0:07:03 |  0:38:49 |    0:56:31 |   35/31/92/158 | 1103.850000 | 2613.600000 | 72255.000000 | 1.727773 | 6.183547 | 31.026509 |
|      0.4 |  0:14:36 |  0:06:38 |  0:38:35 |    0:59:49 |   44/25/90/159 | 1618.650000 | 2608.650000 | 72457.500000 | 1.847846 | 6.562377 | 31.293702 |
|      0.5 |  0:10:39 |  0:07:03 |  0:38:48 |    0:56:30 |   35/31/93/159 | 1108.800000 | 2613.600000 | 72652.500000 | 1.735499 | 6.183621 | 31.204138 |
|      0.6 |  0:10:39 |  0:07:03 |  0:38:49 |    0:56:31 |   35/31/93/159 | 1108.800000 | 2613.600000 | 72686.250000 | 1.735793 | 6.183928 | 31.210965 |
|      0.7 |  0:14:36 |  0:06:37 |  0:38:35 |    0:59:48 |   44/26/89/159 | 1640.925000 | 2603.700000 | 73057.500000 | 1.873463 | 6.550535 | 31.559188 |
|      0.8 |  0:10:39 |  0:09:60 |  0:38:17 |    0:58:02 |   35/39/85/159 | 1108.800000 | 3875.850000 | 73158.750000 | 1.735605 | 6.460741 | 31.844746 |
|      0.9 |  0:10:39 |  0:07:03 |  0:38:49 |    0:56:31 |   35/31/93/159 | 1108.800000 | 2613.600000 | 73361.250000 | 1.735399 | 6.182319 | 31.494396 |
|      1.0 |  0:10:39 |  0:07:04 |  0:38:49 |    0:56:32 |   35/31/93/159 | 1103.850000 | 2603.700000 | 73083.750000 | 1.727849 | 6.146514 | 31.379264 |

## Hack `joesguns`

Same as above, but we want to raise enough money to purchase both `HTTPWorm.exe`
and `SQLInject.exe`. Use the save file `joesguns.json` and the script
[`/test/hgw/joesguns.js`](../../src/test/hgw/joesguns.js). The save file starts
us with the following:

1. 160 Hack and base level in all other stats.
1. The programs `BruteSSH.exe`, `FTPCrack.exe`, and `relaySMTP.exe` all manually
   purchased.
1. No installed Augmentations.
1. The `home` server has 64GB RAM.

| Fraction |    Time | Hack |       Hack XP |      XP/s |
| -------: | ------: | ---: | ------------: | --------: |
|      0.1 | 1:25:20 |   58 | 392538.750000 | 76.670420 |
|      0.2 | 0:47:05 |   41 | 205318.125000 | 72.682790 |
|      0.3 | 0:37:17 |   36 | 164786.250000 | 73.660490 |
|      0.4 | 0:47:03 |   43 | 222408.750000 | 78.791264 |
|      0.5 | 0:38:59 |   39 | 182201.250000 | 77.884019 |
|      0.6 | 0:33:52 |   35 | 157953.750000 | 77.746536 |
|      0.7 | 0:42:55 |   42 | 207506.250000 | 80.580789 |
|      0.8 | 0:41:18 |   41 | 200392.500000 | 80.857093 |
|      0.9 | 0:38:15 |   39 | 184833.750000 | 80.527582 |
|      1.0 | 0:40:59 |   41 | 200548.125000 | 81.560397 |

## Prep `phantasy`

Prep the server `phantasy` to minimum security level and maximum money. The save
file `phantasy.json` gives us these stats:

1. 64GB RAM on `home`.
1. 196 Hack.
1. Default levels in all other stats.
1. The following programs all manually purchased: `BruteSSH.exe`,
   `FTPCrack.exe`, `HTTPWorm.exe`, `relaySMTP.exe`, and `SQLInject.exe`.
1. No Augmentations installed.

Use the script [`/test/hgw/prep.js`](../../src/test/hgw/prep.js) to prep
`phantasy`.

| Server     | Strategy |    Time | Hack |       Hack XP |      XP/s |
| ---------- | -------- | ------: | ---: | ------------: | --------: |
| `phantasy` | GW       | 0:29:02 |    8 |  66096.000000 | 37.946494 |
| `phantasy` | MGW      | 2:18:48 |   13 | 121176.000000 | 14.550530 |
| `phantasy` | MWG      | 0:27:32 |    9 |  77112.000000 | 46.689186 |
| `phantasy` | WG       | 0:27:32 |    9 |  77112.000000 | 46.683816 |

## Hack $1b

Hack various servers to steal $1b. Use the save file `phantasy.json`, which
gives us these stats:

1. 64GB RAM on `home`.
1. 196 Hack.
1. Default levels in all other stats.
1. The following programs all manually purchased: `BruteSSH.exe`,
   `FTPCrack.exe`, `HTTPWorm.exe`, `relaySMTP.exe`, and `SQLInject.exe`.
1. No Augmentations installed.

Use the script [`/test/hgw/billion.js`](../../src/test/hgw/billion.js) to prep
and hack various servers.

### `foodnstuff`

| Fraction |    Time | Hack |        Hack XP |       XP/s |
| -------: | ------: | ---: | -------------: | ---------: |
|      0.1 | 4:24:49 |   86 | 3290976.000000 | 207.126187 |
|      0.2 | 4:01:20 |   85 | 3202449.000000 | 221.167546 |
|      0.3 | 2:50:25 |   74 | 2203683.000000 | 215.510984 |
|      0.4 | 3:17:00 |   79 | 2632306.500000 | 222.695032 |
|      0.5 | 2:52:17 |   75 | 2281581.000000 | 220.723151 |
|      0.6 | 3:09:48 |   79 | 2562078.000000 | 224.983133 |
|      0.7 | 2:57:43 |   77 | 2388174.000000 | 223.966495 |
|      0.8 | 3:16:38 |   80 | 2683816.500000 | 227.488924 |
|      0.9 | 3:04:45 |   78 | 2508858.000000 | 226.319600 |
|      1.0 | 3:21:56 |   81 | 2775217.500000 | 229.063333 |

### `joesguns`

| Fraction |    Time | Hack |        Hack XP |       XP/s |
| -------: | ------: | ---: | -------------: | ---------: |
|      0.1 | 4:01:40 |   83 | 3006300.000000 | 207.333723 |
|      0.2 | 2:10:09 |   64 | 1519725.000000 | 194.603015 |
|      0.3 | 1:35:20 |   55 | 1097765.625000 | 191.909988 |
|      0.4 | 1:17:27 |   49 |  879528.750000 | 189.278096 |
|      0.5 | 1:07:07 |   45 |  752821.875000 | 186.935012 |
|      0.6 | 1:02:43 |   44 |  699483.750000 | 185.876104 |
|      0.7 | 0:55:19 |   41 |  609648.750000 | 183.668199 |
|      0.8 | 1:18:28 |   51 |  941529.375000 | 199.996426 |
|      0.9 | 1:14:21 |   50 |  888226.875000 | 199.095172 |
|      1.0 | 1:14:31 |   50 |  891888.750000 | 199.462491 |

### `phantasy`

| Fraction |    Time | Hack |       Hack XP |      XP/s |
| -------: | ------: | ---: | ------------: | --------: |
|      0.1 | 2:47:54 |   41 | 613246.500000 | 60.876248 |
|      0.2 | 2:30:55 |   38 | 549051.750000 | 60.636501 |
|      0.3 | 1:49:52 |   31 | 384147.000000 | 58.274727 |
|      0.4 | 1:22:52 |   25 | 284458.500000 | 57.210730 |
|      0.5 | 1:06:11 |   21 | 219046.500000 | 55.161505 |
|      0.6 | 1:06:24 |   21 | 220023.000000 | 55.224577 |
|      0.7 | 1:06:10 |   21 | 221049.000000 | 55.673945 |
|      0.8 | 1:05:56 |   21 | 219971.250000 | 55.610309 |
|      0.9 | 0:57:29 |   19 | 188019.000000 | 54.510111 |
|      1.0 | 0:56:46 |   19 | 187663.500000 | 55.102688 |

### `sigma-cosmetics`

| Fraction |    Time | Hack |        Hack XP |       XP/s |
| -------: | ------: | ---: | -------------: | ---------: |
|      0.1 | 3:55:27 |   80 | 2699616.000000 | 191.095536 |
|      0.2 | 2:10:23 |   62 | 1421910.000000 | 181.763772 |
|      0.3 | 1:34:34 |   52 |  996520.500000 | 175.637539 |
|      0.4 | 2:11:12 |   64 | 1526901.000000 | 193.976358 |
|      0.5 | 1:51:36 |   59 | 1278478.500000 | 190.918161 |
|      0.6 | 1:38:58 |   55 | 1118067.000000 | 188.280019 |
|      0.7 | 1:34:04 |   54 | 1061277.000000 | 188.022497 |
|      0.8 | 1:55:46 |   61 | 1356844.500000 | 195.355351 |
|      0.9 | 1:49:06 |   59 | 1270074.000000 | 194.024308 |
|      1.0 | 1:45:45 |   59 | 1228233.000000 | 193.560176 |
