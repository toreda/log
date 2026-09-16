import type {LevelInput} from './input';
import {LevelKeys} from './keys';
import {checkLevel} from '../check/level';
import {checkLevelKey} from '../check/level/key';

/**
 * Resolve a level input to its bitmask. Numbers are validated and
 * returned as-is, level keys are translated to their bitmask, and an
 * array is resolved item by item and combined with bitwise OR.
 *
 * @param input		Level bitmask, level key, or array of either.
 * @returns			Resolved bitmask, or null when input (or any item
 * 					of an array input) is not a valid level.
 *
 * @category Log Level
 */
export function levelMask(input?: LevelInput | LevelInput[] | null): number | null {
	if (Array.isArray(input)) {
		if (input.length === 0) {
			return null;
		}

		let mask = 0;

		for (const item of input) {
			const value = levelMask(item);

			if (value === null) {
				return null;
			}

			mask |= value;
		}

		return mask;
	}

	if (checkLevelKey(input)) {
		return LevelKeys[input];
	}

	if (checkLevel(input)) {
		return input;
	}

	return null;
}
