#!/usr/bin/env bash

# Copyright (C) 2022 Duck McSouls
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

# Output JavaScript code to this file.
SCRIPT=pull.js && declare -r SCRIPT
# This directory contains templates we need.
MISC=misc && declare -r MISC

cat "${MISC}"/pull-prefix.txt > "$SCRIPT"
find src/ | grep "\.js" | sed s/^"src\/"/'        "'/g | sed s/$/'",'/g >> "$SCRIPT"
cat "${MISC}"/pull-suffix.txt >> "$SCRIPT"
