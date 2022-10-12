# Bitburner

A bunch of scripts for a walkthrough of the game Bitburner.

- [Source code](https://github.com/danielyxie/bitburner)
- [Play online](https://danielyxie.github.io/bitburner/)
- [Steam version](https://store.steampowered.com/app/1812820/Bitburner/)

Unless otherwise stated, all scripts are covered by the GNU GPLv3. See the
file `LICENSE.txt` for the full text of the license.

## Development

Before committing your code, do this:

1. Run `npm run lint`.
1. Run `npm run format`.
1. It is important to run `lint` first, followed by `format` because the linter sometimes
   insists on having code being more than 80 characters long even when you set a maximum
   column of 80 in the configuration file for Prettier.  The formatter fixes this bug.
1. Fix any formatting and/or linting errors reported by the linter and formatter.
