import {ANY} from '@toreda/shared-types';
import type {LevelInput} from '../../level/input';
import {Log} from '../../log';
import {LogStateGlobal} from '../state/global';

/**
 * Used by makeGroup in a existing Log
 *
 * @category Options
 */
export type LogOptionsGroup = {
	state: LogStateGlobal;

	id: string;
	parent?: Log;
	path?: string[];

	enabled?: boolean;
	/** Starting group level as a bitmask, level key, or array of either. */
	level?: LevelInput | LevelInput[];
};

export function isLogOptionsGroup(options: ANY): options is LogOptionsGroup {
	if (options?.state == null) {
		return false;
	}

	if (options.state instanceof LogStateGlobal) {
		return true;
	} else {
		return false;
	}
}
