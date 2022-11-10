#!/usr/bin/env bash

# Why a shell script to achieve what can be done with a Makefile?  I can't seem
# to get Make to properly work under Cygwin.  After spending a few hours on
# the problem, I gave up and wrote this shell script.
#
# Why not use a Linux distribution instead of Cygwin?  Some of the programs
# I use work only on, or better on, Windows.  This forces me to develop
# using a Windows environment.

DOC=cct

# Compile the document.
pdflatex "$DOC".tex
pdflatex "$DOC".tex

# Clean up after ourselves.
rm *~
rm algorithm/*~
rm algorithm/subarray/*~
rm algorithm/prime/*~
rm tex/*~
rm .log
rm *.aux
rm *.log
rm *.out
