# Proto-batcher and pserv

A proto-batcher that uses a purchased server instead of the RAM of world
servers. Use the save file `pserv.json`, which grants us the following:

1. Starts in BN1.1.
1. 20 Hack and default values in other stats.
1. Start with $224.3m.
1. Installed the Augmentation `CashRoot Starter Kit` which allows us to start
   with `BruteSSH.exe`.
1. Manually purchased the TOR router and the `FTPCrack.exe` program.

Use the script [`pserv.js`](../../src/test/hgw/pserv.js) to prep a target server
and hack a specific amount of money from the target. We note the time required
to steal the target amount of money as well as various other Hack-related
statistics gained in the process.

## `n00dles` $10m

| RAM (GB) | Fraction |    Time | Hack |           XP |     XP/s |         $/s |
| -------: | -------: | ------: | ---: | -----------: | -------: | ----------: |
|       64 |      0.1 | 2:31:39 |   95 | 18255.600000 | 2.006268 | 1098.987931 |
|       64 |      0.2 | 1:45:09 |   86 | 13580.325000 | 2.152659 | 1585.130964 |
|       64 |      0.3 | 1:44:52 |   86 | 13549.800000 | 2.153575 | 1589.377617 |
|       64 |      0.4 | 1:44:51 |   86 | 13549.800000 | 2.153720 | 1589.484479 |
|       64 |      0.5 | 1:45:12 |   86 | 13580.325000 | 2.151595 | 1584.347408 |
|       64 |      0.6 | 1:45:26 |   86 | 13610.850000 | 2.151413 | 1580.660305 |
|       64 |      0.7 | 1:44:51 |   86 | 13549.800000 | 2.153718 | 1589.483216 |
|       64 |      0.8 | 1:45:08 |   86 | 13580.325000 | 2.152797 | 1585.232481 |
|       64 |      0.9 | 1:45:36 |   86 | 13610.850000 | 2.148160 | 1578.270373 |
|       64 |      1.0 | 1:45:16 |   86 | 13580.325000 | 2.150243 | 1583.352004 |

| RAM (GB) | Fraction |    Time | Hack |           XP |     XP/s |         $/s |
| -------: | -------: | ------: | ---: | -----------: | -------: | ----------: |
|      128 |      0.1 | 2:16:52 |  113 | 32316.900000 | 3.935285 | 1217.717250 |
|      128 |      0.2 | 1:15:36 |   95 | 18324.900000 | 4.040015 | 2204.658929 |
|      128 |      0.3 | 0:54:35 |   87 | 14147.100000 | 4.320100 | 3053.699924 |
|      128 |      0.4 | 0:52:26 |   86 | 13677.675000 | 4.347011 | 3178.179888 |
|      128 |      0.5 | 0:52:09 |   86 | 13615.800000 | 4.350852 | 3195.443553 |
|      128 |      0.6 | 0:52:10 |   86 | 13615.800000 | 4.349476 | 3194.432998 |
|      128 |      0.7 | 0:52:09 |   86 | 13615.800000 | 4.351150 | 3195.662080 |
|      128 |      0.8 | 0:52:10 |   86 | 13615.800000 | 4.350656 | 3195.299586 |
|      128 |      0.9 | 0:52:30 |   86 | 13677.675000 | 4.342722 | 3175.043649 |
|      128 |      1.0 | 0:52:35 |   86 | 13677.675000 | 4.335764 | 3169.956923 |
