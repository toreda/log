import {ANY} from '@toreda/types';
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
	globalLevel?: number;
	groupsStartEnabled?: boolean;
	startingGroups?: LogOptionsGroup[];
	startingTransports?: Array<Transport | ConstructorParameters<typeof Transport>[0]>;
};

export function isLogOptionsGlobal(options: ANY): options is LogOptionsGlobal {
	if (options?.state != null) {
		return false;
	}

	return true;
}
