# Singularity

Scripts that heavily rely on the Singularity API to automate the game play.
Scripts in this directory are chain loaded, i.e. each script is run one after
the other.  One script must be finished before another script can be executed.
The load chain starts from the script `/singularity/study.js`.
