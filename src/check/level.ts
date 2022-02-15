import {Levels} from '../levels';

/**
 * Check if value is a valid log level.
 *
 * @param value
 * @returns
 *
 * @category Log Level
 */
export function checkLevel(value?: Levels | number | null): value is number {
	if (typeof value !== 'number') {
		return false;
	}

	if (isNaN(value)) {
		return false;
	}

	if (value < 0 || value > Number.MAX_SAFE_INTEGER) {
		return false;
	}

	if (!Number.isSafeInteger(value)) {
		return false;
	}

	return true;
}
