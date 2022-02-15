import {ANY} from '@toreda/types';
import {LogOptionsGroup} from './group';
import {Transport} from '../../transport';
import {TransportAction} from '../..';

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
	startingTransports?: Array<Transport | {id: string; level: number; action: TransportAction}>;
};

export function isLogOptionsGlobal(options: ANY): options is LogOptionsGlobal {
	if (options?.state != null) {
		return false;
	}

	return true;
}
