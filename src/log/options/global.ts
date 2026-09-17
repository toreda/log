import {ANY} from '@toreda/shared-types';
import type {LevelInput} from '../../level/input';
import {LogOptionsGroup} from './group';
import {Transport} from '../../transport';

/**
 * Used when creating a brand new Log
 *
 * @category Options
 */
export type LogOptionsGlobal = {
	id?: string;
	consoleEnabled?: boolean;
	/** Starting global level as a bitmask, level key, or array of either. */
	globalLevel?: LevelInput | LevelInput[];
	groupsStartEnabled?: boolean;
	startingGroups?: Array<Pick<LogOptionsGroup, 'id' | 'enabled' | 'level'>>;
	startingTransports?: Array<Transport | ConstructorParameters<typeof Transport>[0]>;
};

export function isLogOptionsGlobal(options: ANY): options is LogOptionsGlobal {
	if (options?.state != null) {
		return false;
	}

	return true;
}
