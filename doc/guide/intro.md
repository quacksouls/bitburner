# Introduction

Bitburner is a programming game. You can get through the game with a minimum
amount of programming and by using other players' scripts. For maximum
enjoyment, you should write your own scripts to play the game.

## Tips

Below are various tips you might want to keep in mind while playing the game.

1. _Do the tutorials._ Complete the in-game tutorial, followed by the
   [online tutorial](https://bitburner.readthedocs.io/en/latest/guidesandtips/gettingstartedguideforbeginnerprogrammers.html).
1. _Read the API documentation._ Read or browse the
   [API documentation](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.md)
   to get an idea of what you can do.
1. _Use NS2._ The programming languages for playing the game are NS1 and NS2.
   NS1 uses ECMAScript 5, a specification for JavaScript that was published
   in 2009. NS2 uses ECMAScript 6, which is a JavaScript specification that was
   published in 2016. Scripts written in NS2 generally run faster than their NS1
   counterparts. Apart from speed, you should use NS2 to take advantage of most
   functionalities that modern JavaScript has to offer.
1. _Checking on your progress._ Save the game and exit. Load the game the next
   day to check on your progress. You do not need to have the game running 24
   hours a day.
1. _Separation of concern._ Unless you know what you are doing, avoid the urge
   to have a library file that contains all your classes and utility functions.
   To help you easily maintain and expand your library of code, have each class
   be in its own file. Utility functions should be in separate files, organized
   according to functionality or API or some other criteria. For example, have a
   library file that contains utility functions related to Coding Contracts,
   another library file holding utility functions related to Singularity, etc.
1. _Keep an eye on RAM usage._ The game penalizes you for importing a class that
   uses many functions from its API. This means that all API functions called by
   the class are used to calculate the total RAM cost of the script that imports
   the class. You want a balance between the code size of your class and total
   RAM cost used by the class. Another option is to create a file of utility
   functions and import any functions you need early in the game when the RAM of
   your home server is low. When the RAM of your home server is high enough, use
   your library classes.
1. _Automate everything._ The Singularity API is key to automating most aspects
   of the game. Note that every aspect of the game play can be automated. Some
   portions of the game play is more easily automated than others. Early in the
   game, you do not have access to various APIs to help you easily automate your
   game play. With a little bit of knowledge in JavaScript and web development,
   you can use HTML injection to easily circumvent the manual game play early in
   the game. Or you can go the manual route and slog it out until you have
   access to the Singularity API.
