import {LogStateGlobal} from './state/global';
import {Expand} from '@toreda/types';

export type LogOptions = Expand<Required<LogOptionsGroup> | LogOptionsGlobal>;

/**
 * Used when creating a brand new Log
 */
export interface LogOptionsGlobal {
	state?: undefined;

	id?: string;

	consoleEnabled?: boolean;
	globalLevel?: number;
	groupsStartEnabled?: boolean;
	startingGroups?: LogOptionsGroup[];
}

/**
 * Used by makeGroup in a existing Log
 */
export interface LogOptionsGroup {
	state: LogStateGlobal;

	id: string;
	path?: string[];

	enabled?: boolean;
	level?: number;
}
