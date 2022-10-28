# Save file

A bunch of save files. Each save file starts you at a particular BitNode. The
name of each save file follows the format `BNnxk.json`, where `n` is the BitNode
number and `k` is the level of that BitNode. For example, `BN1x2.json` starts
you at level 2 of BitNode-1. These save files can be used for debugging or to
help you test various aspects of the game.

- `BN1xk.json`. Start at BitNode 1: Source Genesis (level k) and having level
  k of Source-File 1: Source Genesis.
- `BN2xk.json`. Start at BitNode 2: Rise of the Underworld (level k) and
  having level 3 of these:
  - Source-File 1: Source Genesis
  - Source-File 4: The Singularity
- `BN4xk.json`. Start at BitNode 4: The Singularity (level k) and having level
  3 of Source-File 1: Source Genesis.
- `BN5x1.json`. Start at BitNode 5: Artificial Intelligence (level 1) and
  having level 3 of these:
  - Source-File 1: Source Genesis
  - Source-File 4: The Singularity
- `BN10x1.json`. Start at BitNode 10: Digital Carbon (level 1) and having
  level 3 of these:
  - Source-File 1: Source Genesis
  - Source-File 4: The Singularity
