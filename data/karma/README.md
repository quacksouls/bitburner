# Karma

> Bitburner v2.2.1

Data on using sleeves to help us lower our karma. While we commit homicide, we
assign all our sleeves to commit homicide as well (if we have any sleeves at
all). The save files `sleeveN.json` start us at BN1.3 and grant us the
following:

<!-- prettier-ignore -->
- Default stats.
- `Source-File 1: Source Genesis level 3`
- `Source-File 4: The Singularity level 3`. We require this Source-File to help
  us automate the gathering of data.
- `Source-File 10: Digital Carbon`. The number `N` in `sleeveN.json` tells us
  the number of sleeves we have. If `N` has the value 0, then we do not have
  `Source-File 10`.

The general process for data gathering is:

1. Load a save file.
1. Use `b1t_flum3.exe` to enter the BitVerse and enter BN1.3 again. Doing so
   would remove any bonus time we have.
1. Use the script [`/quack/test/karma/go.js`](../../src/test/karma/go.js) to
   commit homicide and assign `N` sleeves to commit homicide as well.
1. Wait for the script to end, at which point the script would print data to the
   terminal. The script ends as soon as we have -54,000 karma or lower.

The stats, karma, and money data in the table below have been averaged over the
number of minutes required to reach -54,000 or lower. Each number has been
rounded to 6 decimal places and should be read as a rate per minute. Time is in
the format `hh:mm:ss`.

| Sleeve |     Time |   Agility |   Defense | Dexterity |      Karma |          Money |  Strength |
| -----: | -------: | --------: | --------: | --------: | ---------: | -------------: | --------: |
|      0 | 17:05:54 | 44.957346 | 44.957346 | 44.957346 | -52.684390 |  964420.682927 | 44.957346 |
|      1 | 15:26:24 | 46.568476 | 46.568476 | 46.568476 | -58.317927 | 1044159.395248 | 46.568476 |
|      2 | 14:13:36 | 47.580838 | 47.580838 | 47.580838 | -63.308089 | 1110751.934349 | 47.580838 |
|      3 | 13:11:48 | 48.809848 | 48.809848 | 48.809848 | -68.271808 | 1182741.087231 | 48.809848 |
|      4 | 12:25:03 | 49.509698 | 49.509698 | 49.509698 | -72.487248 | 1239955.973154 | 49.509698 |
|      5 | 11:47:25 | 50.403997 | 50.403997 | 50.403997 | -76.383310 | 1295880.339463 | 50.403997 |
|      6 | 11:15:12 | 51.038900 | 51.038900 | 51.038900 | -80.002222 | 1345896.000000 | 51.038900 |
|      7 | 10:43:45 | 51.631528 | 51.631528 | 51.631528 | -83.984137 | 1401382.581649 | 51.631528 |
|      8 | 10:18:03 | 52.116087 | 52.116087 | 52.116087 | -87.383495 | 1447922.330097 | 52.116087 |

> Before v2.2.1, with 8 sleeves we could obtain -54,000 karma in about 4:45:51.
