# Karma

Data on using sleeves to help us lower our karma. While we commit homicide, we
assign all our sleeves to commit homicide as well (if we have any sleeves at
all). The save files `sleeveN.json` start us at BN1.3 and grant us the
following:

1. Default stats.
1. `Source-File 1: Source Genesis level 3`
1. `Source-File 4: The Singularity level 3`. We require this Source-File to help
   us automate the gathering of data.
1. `Source-File 10: Digital Carbon`. The number `N` in `sleeveN.json` tells us
   the number of sleeves we have. If `N` has the value 0, then we do not have
   `Source-File 10`.

The general process for data gathering is:

1. Load a save file.
1. Use `b1t_flum3.exe` to enter the BitVerse and enter BN1.3 again. Doing so
   would remove any bonus time we have.
1. Use the script `/test/karma/go.js` to commit homicide and assign `N` sleeves
   to commit homicide as well.
1. Wait for the script to end, at which point the script would print data to the
   terminal. The script ends as soon as we have -54,000 karma or lower.

The stats, karma, and money data in the table below have been averaged over the
number of minutes required to reach -54,000 or lower. Each number has been
rounded to 6 decimal places and should be read as a rate per minute.

| Sleeve |     Time |    Agility |    Defense |  Dexterity |       Karma |          Money |   Strength |
| -----: | -------: | ---------: | ---------: | ---------: | ----------: | -------------: | ---------: |
|      0 | 16:03:00 |  95.804407 |  95.804407 |  95.804407 |  -56.135395 | 1052666.943867 |  95.804407 |
|      3 | 07:57:37 | 124.884489 | 124.884489 | 124.884489 | -113.223899 | 1531136.303679 | 124.884489 |
|      4 | 07:20:03 | 122.220805 | 122.220805 | 122.220805 | -122.730000 | 1479217.801807 | 122.220805 |
|      5 | 06:24:15 | 124.653545 | 124.653545 | 124.653545 | -140.648438 | 1519683.268945 | 124.653545 |
|      6 | 05:44:51 | 126.835345 | 126.835345 | 126.835345 | -157.009448 | 1551132.338154 | 126.835345 |
|      7 | 05:15:27 | 128.510005 | 128.510005 | 128.510005 | -171.428571 | 1569389.902714 | 128.510005 |
|      8 | 04:45:51 | 130.282132 | 130.282132 | 130.282132 | -189.507368 | 1599437.493790 | 130.282132 |
