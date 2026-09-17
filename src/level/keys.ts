import type {LevelKey} from './key';
import {Levels} from '../levels';

/**
 * Bitmask for each {@link LevelKey}. Mirrors the {@link Levels} enum
 * with lowercase string keys.
 *
 * @category Log Level
 */
export const LevelKeys: Readonly<Record<LevelKey, Levels>> = Object.freeze({
	none: Levels.NONE,
	error: Levels.ERROR,
	warn: Levels.WARN,
	info: Levels.INFO,
	debug: Levels.DEBUG,
	trace: Levels.TRACE,
	all: Levels.ALL,
	all_custom: Levels.ALL_CUSTOM,
	all_extended: Levels.ALL_EXTENDED
});
