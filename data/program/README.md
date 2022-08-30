Use the various save files in this directory to test the Intelligence XP gain
when you create programs both manually and via the Singularity API.  A save
file whose name contains the name of a program should only be used to create
the particular program.  For example, you should use the save file

`bitburnerSave_1661522461_BN1x4_AutoLink.json`

to create the `AutoLink.exe` program and only that program, both manually and
via the Singularity API.  Below are processes for creating a program.


# Scripted

1. Open a web browser and go to the URL:
   `https://danielyxie.github.io/bitburner/`
1. Import a save file.
1. Execute the command
   `run intelligence/program.js [programName]`.
   Substitute `[programName]` for the name of the program to create, e.g.
   `AutoLink.exe`.
1. Wait for the creation process to complete.  Upon completion, the script
   `program.js` would print to the terminal the amount of Intelligence XP
   gained as a result of creating the given program.
1. Repeat the above process as many times as you want to gather as many data
   points as you need for a particular program.  Clear the browsing data
   before you load the same (or another) save file.
1. Save the data in the corresponding data file.  For example, data obtained
   from creating the `AutoLink.exe` program should be saved in the file
   `AutoLink.md`, under the section `Scripted`.


# Manual

1. Open a web browser and go to the URL:
   `https://danielyxie.github.io/bitburner/`
1. Import a save file.
1. Execute the command
   `run intelligence/int.js`
   to print to the terminal the current Intelligence XP.
1. Click on the `Create Program` tab.
1. Click on the program you want to create, e.g. the `Create program` button
   in the box for `AutoLink.exe`.
1. Wait for the creation process to complete.
1. Run the `int.js` script again to print to the terminal the new Intelligence
   XP.
1. Subtract the previous value of the Intelligence XP from the new value, hence
   obtaining the gain in Intelligence XP as a result of creating the given
   program.
1. Repeat the above process as many times as you want to gather as many data
   points as you need for a particular program.  Clear the browsing data
   before you load the same (or another) save file.
1. Save the data in the corresponding data file.  For example, data obtained
   from creating the `AutoLink.exe` program should be saved in the file
   `AutoLink.md`, under the section `Manual`.
