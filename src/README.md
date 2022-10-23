# Scripts

This directory contains all scripts for playing Bitburner. Your game play is
affected by whether you have access to the Singularity API.

1. If you have destroyed BN4.3, you have access to the Singularity API and the
   RAM cost of each function from the API is at its lowest. The game play is
   automated. All you need to do is run the script `go.js`.
1. If you are in BN4.1, you have access to the Singularity API. However, the RAM
   cost of using functions from this API is so high that you would not be able
   to automate the game play in the early stages of the BitNode. Manually
   upgrade the RAM on your home server to at least 512GB or more and run `go.js`
   to automate the remainder of the playthrough.
1. If you do not have access to the Singularity API, then most of your game play
   would be manual. The script `go.js` launches various other scripts to help
   you generate passive income, but that is as far as automation goes. Read the
   script `go.js` to help you figure out which other scripts you need to
   manually launch to complete your playthrough.
