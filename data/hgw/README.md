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
We used the save file `fresh.json` and the script `/test/hgw/prep.js`. Floating
point numbers are rounded to 6 decimal places. The general process is as
follows:

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
`fresh.json` and the script `/test/hgw/brutessh.js`. Here is the strategy:

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

1. Use the above steps until we have steal enough money to purchase
   `BruteSSH.exe`.
1. Print the data to the terminal.
1. Reload the save file `fresh.json` and use the above steps, but steal a
   different percentage of money.

| Fraction |    Time | Hack |     Hack XP |     XP/s |
| -------: | ------: | ---: | ----------: | -------: |
|      0.1 | 0:28:36 |   59 | 2917.200000 | 1.700271 |
|      0.2 | 0:18:18 |   48 | 1899.150000 | 1.729297 |
|      0.3 | 0:12:35 |   39 | 1288.650000 | 1.706177 |
|      0.4 | 0:12:35 |   39 | 1293.600000 | 1.712645 |
|      0.5 | 0:12:35 |   39 | 1293.600000 | 1.712704 |
|      0.6 | 0:12:35 |   39 | 1293.600000 | 1.712695 |
|      0.7 | 0:18:08 |   49 | 2010.525000 | 1.847087 |
|      0.8 | 0:12:35 |   39 | 1293.600000 | 1.712427 |
|      0.9 | 0:18:10 |   49 | 1965.975000 | 1.804092 |
|      1.0 | 0:12:35 |   39 | 1293.600000 | 1.712767 |

## Has `BruteSSH.exe`, buy `FTPCrack.exe`

We used the save file `brutessh.json`, which allows us to start with the
following stats. We used the script `/test/hgw/ftpcrack.js`.

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
|      0.1 | 0:24:07 |   82 | 6494.400000 | 4.488564 |
|      0.2 | 0:15:43 |   68 | 3950.100000 | 4.190296 |
|      0.3 | 0:11:01 |   57 | 2653.200000 | 4.015194 |
|      0.4 | 0:10:56 |   58 | 2811.600000 | 4.285531 |
|      0.5 | 0:05:33 |   38 | 1270.500000 | 3.816244 |
|      0.6 | 0:10:53 |   60 | 3004.650000 | 4.604355 |
|      0.7 | 0:05:33 |   39 | 1306.800000 | 3.924419 |
|      0.8 | 0:05:33 |   39 | 1306.800000 | 3.924572 |
|      0.9 | 0:05:33 |   39 | 1306.800000 | 3.925114 |
|      1.0 | 0:05:33 |   39 | 1306.800000 | 3.924961 |

## Buy `BruteSSH.exe`, then `FTPCrack.exe`

How long it takes to purchase both of the `BruteSSH.exe` and `FTPCrack.exe`
programs. We used the save file `sshftp.json`, which allows us to start at base
stat in BN1.1, without any installed Augmentations. We used the script
`/test/hgw/sshftp.js`. We prep, then hack money from `n00dles`. The above data
suggest we should steal 50% of money from the target server because the
percentage results in the shortest time required to acquire both `BruteSSH.exe`
and `FTPCrack.exe`. This is generally true, as shown by the table below. We use
the following process:

1. Hack enough money to buy the Tor router and `BruteSSH.exe`.
1. Manually purchase the Tor router and `BruteSSH.exe`.
1. Then hack enough money to buy `FTPCrack.exe`.
1. The only variable is the fraction of money to steal. Gather data for a
   particular fraction, then reload the save file `sshftp.json` and gather data
   for a different fraction.

| Fraction | Time (B) | Time (F) | Time (sum) | Hack B/F/sum | Hack XP (B) |  Hack XP (F) | XP/s (B) | XP/s (F) |
| -------: | -------: | -------: | ---------: | -----------: | ----------: | -----------: | -------: | -------: |
|      0.1 |  0:28:36 |  0:33:21 |    1:01:57 |    59/49/108 | 2917.200000 | 12474.000000 | 1.700137 | 6.234235 |
|      0.2 |  0:18:16 |  0:20:46 |    0:39:02 |     48/44/92 | 1921.425000 |  7309.500000 | 1.752714 | 5.868336 |
|      0.3 |  0:12:35 |  0:17:48 |    0:30:23 |     39/47/86 | 1293.600000 |  6177.600000 | 1.712361 | 5.784941 |
|      0.4 |  0:12:35 |  0:13:52 |    0:26:27 |     39/41/80 | 1293.600000 |  4870.800000 | 1.712323 | 5.853363 |
|      0.5 |  0:12:35 |  0:13:48 |    0:26:23 |     39/43/82 | 1293.600000 |  5118.300000 | 1.712522 | 6.179201 |
|      0.6 |  0:12:35 |  0:13:48 |    0:26:23 |     39/43/82 | 1293.600000 |  5204.925000 | 1.712411 | 6.288716 |
|      0.7 |  0:12:35 |  0:13:48 |    0:26:23 |     39/43/82 | 1293.600000 |  5182.650000 | 1.712355 | 6.261682 |
|      0.8 |  0:12:36 |  0:13:48 |    0:26:24 |     39/43/82 | 1293.600000 |  5182.650000 | 1.712230 | 6.259700 |
|      0.9 |  0:18:10 |  0:09:07 |    0:27:17 |     49/28/77 | 1988.250000 |  3484.800000 | 1.824585 | 6.372579 |
|      1.0 |  0:18:07 |  0:09:07 |    0:27:14 |     49/28/77 | 2010.525000 |  3484.800000 | 1.848954 | 6.370808 |

The above table shows that we can steal between 50% and 70% of money on a
prepped `n00dles` and be able to purchase both `BruteSSH.exe` and `FTPCrack.exe`
in less than 27 minutes.

## Prep `foodnstuff`, `joesguns`, and `sigma-cosmetics`

We used the save file `fjs.json`, which starts us with the following stats.

1. 78 Hack.
1. Default values in other stats.
1. Have both of `BruteSSH.exe` and `FTPCrack.exe`, which were manually
   purchased.
1. No Augmentation installed.
1. The `home` server has 64GB RAM.

We used the script `/test/hgw/prep.js` to prep `foodnstuff`, `joesguns`, and
`sigma-cosmetics`. The general process is as follows:

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
Use the script `/test/hgw/smtp.js` and the save file `fresh.json`.

| Fraction | Time (B) | Time (F) | Time (R) | Time (sum) | Hack B/F/R/sum | Hack XP (B) | Hack XP (F) |  Hack XP (R) | XP/s (B) | XP/s (F) |  XP/s (R) |
| -------: | -------: | -------: | -------: | ---------: | -------------: | ----------: | ----------: | -----------: | -------: | -------: | --------: |
|      0.1 |  0:10:33 |  0:09:54 |  0:37:48 |    0:58:15 |   35/39/85/159 | 1108.800000 | 3766.950000 | 71850.000000 | 1.750702 | 6.343514 | 31.683945 |
|      0.2 |  0:10:33 |  0:09:53 |  0:37:49 |    0:58:15 |   35/38/86/159 | 1108.800000 | 3722.400000 | 72022.500000 | 1.750511 | 6.275721 | 31.739509 |
|      0.3 |  0:10:33 |  0:09:53 |  0:37:48 |    0:58:14 |   35/39/85/159 | 1108.800000 | 3801.600000 | 72247.500000 | 1.750561 | 6.408588 | 31.861298 |
|      0.4 |  0:10:33 |  0:09:53 |  0:37:48 |    0:58:14 |   35/39/85/159 | 1108.800000 | 3789.225000 | 72450.000000 | 1.750865 | 6.389515 | 31.949037 |
|      0.5 |  0:10:33 |  0:09:52 |  0:37:48 |    0:58:13 |   35/39/85/159 | 1108.800000 | 3811.500000 | 72645.000000 | 1.750702 | 6.434106 | 32.025382 |
|      0.6 |  0:10:33 |  0:09:53 |  0:37:48 |    0:58:14 |   35/39/85/159 | 1108.800000 | 3789.225000 | 72847.500000 | 1.750616 | 6.387802 | 32.124270 |
|      0.7 |  0:10:33 |  0:09:53 |  0:37:48 |    0:58:14 |   35/39/85/159 | 1108.800000 | 3789.225000 | 72948.750000 | 1.750680 | 6.394712 | 32.163827 |
|      0.8 |  0:10:33 |  0:09:53 |  0:37:48 |    0:58:14 |   35/39/85/159 | 1108.800000 | 3789.225000 | 73201.875000 | 1.750622 | 6.387253 | 32.273526 |
|      0.9 |  0:10:33 |  0:09:53 |  0:37:48 |    0:58:14 |   35/39/85/159 | 1108.800000 | 3766.950000 | 73353.750000 | 1.750682 | 6.351236 | 32.346475 |
|      1.0 |  0:10:33 |  0:09:52 |  0:37:48 |    0:58:13 |   35/39/85/159 | 1108.800000 | 3811.500000 | 73657.500000 | 1.750580 | 6.434182 | 32.474389 |
