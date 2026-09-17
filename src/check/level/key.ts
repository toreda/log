import type {LevelKey} from '../../level/key';
import {LevelKeys} from '../../level/keys';

/**
 * Check if value is a valid log level key.
 *
 * @param value
 * @returns
 *
 * @category Log Level
 */
export function checkLevelKey(value?: unknown): value is LevelKey {
	if (typeof value !== 'string') {
		return false;
	}

	return Object.prototype.hasOwnProperty.call(LevelKeys, value);
}
