# Crime

Various gain rates when committing certain crimes.  Each crime was committed
for 24 hours.  The total amount of gain is divided by the number of minutes.
Each number n in the table below is interpreted as n XP per minute.  All
numbers have been rounded to 6 decimal places.

| Crime                 | Agility    | Charisma   | Defense   | Dexterity  | Hack      | Karma      | Money      | Strength  |
|-----------------------|-----------:|-----------:|----------:|-----------:|----------:|-----------:|-----------:|----------:|
| Assassinate           | 57.200000  | 0          | 57.2      | 57.200000  | 0         | -0.744792  | 501333.33  | 57.2      |
| Deal drugs            | 74.766667  | 149.533333 | 0         | 74.766667  | 0         | -2.920573  | 889066.67  | 0         |
| Bond forgery          | 0          | 4.700000   | 0         | 47.000000  | 31.333333 | -0.012240  | 556000.00  | 0         |
| Grand theft auto      | 60.266667  | 30.133333  | 15.066667 | 15.066667  | 0         | -1.471354  | 291555.56  | 15.066667 |
| Heist                 | 33.600000  | 33.600000  | 33.600000 | 33.600000  | 33.600000 | -0.437500  | 853333.33  | 33.600000 |
| Homicide              | 98.101333  | 0          | 98.101333 | 98.101333  | 0         | -57.481250 | 1087520.00 | 98.101333 |
| Kidnap and ransom     | 38.613333  | 38.613333  | 38.613333 | 38.613333  | 0         | -1.131250  | 390400.00  | 38.613333 |
| Larceny               | 100.560000 | 0          | 0         | 100.560000 | 75.420000 | -0.982031  | 666311.11  | 0         |
| Mug someone           |            |            |           |            |           |            |            |           |
| Rob store             |            |            |           |            |           |            |            |           |
| Shoplift              |            |            |           |            |           |            |            |           |
| Traffick illegal arms |            |            |           |            |           |            |            |           |

## Experiment

We used the following procedure to gather the experimental data.

1. Load the online version of the game at https://danielyxie.github.io/bitburner/
1. Import the save file `crime.json`.  This save file starts us at BN1.  We
   have the default amount of $1k.  We have level 1 in each of the following
   stats: Hack, Strength, Defense, Dexterity, Agility, Charisma.  Furthermore,
   we have level 3 of each of Source-File 1 (Genesis) and Source-File 4
   (Singularity).
1. Execute the command `run test/crime/crime.js [crimeName]`.  Replace the
   argument `[crimeName]` with the exact name of the crime we want to commit.
   The crime name should be written in all lowercase.  The script commits the
   specified crime for 24 hours.
1. Leave the script run continuously for 24 hours.  When the script finishes,
   it would print the above stat and money gain rates to the Terminal.
