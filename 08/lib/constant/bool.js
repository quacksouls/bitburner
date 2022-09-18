/**
 * Copyright (C) 2022 Duck McSouls
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// Boolean values.

/**
 * A boolean indicating that we want to enable a feature.
 */
export const ENABLE = true;

/**
 * A boolean indicating that we want to disable a feature.
 */
export const DISABLE = !ENABLE;

/**
 * We have access to something.
 */
export const HAS = true;

/**
 * We do not have access to something; opposite of has.
 */
export const NOT = !HAS;

/**
 * It is time to do something.
 */
export const IS_TIME = true;

/**
 * Now is not the right time; opposite of is time.
 */
export const NOT_TIME = !IS_TIME;

/**
 * A boolean that signifies a new state.
 */
export const NEW = true;

/**
 * A boolean that signifies we do not have anything new; opposite of new.
 */
export const NOT_NEW = !NEW;

/**
 * A boolean signifying that we are to skip an action.
 */
export const SKIP = true;

/**
 * A boolean signifying that we must not skip an action.
 */
export const NO_SKIP = !SKIP;

/**
 * A boolean indicating success or true.
 */
export const SUCCESS = true;

/**
 * A boolean indicating failure or false; the opposite of success.
 */
export const FAILURE = !SUCCESS;

/**
 * A boolean indicating that something is right or correct.
 */
export const VALID = true;

/**
 * A boolean indicating that something is not right, incorrect, or wrong.
 * Opposite of valid.
 */
export const INVALID = !VALID;