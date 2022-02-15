import {ANY} from '@toreda/types';
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
	level?: number;
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
