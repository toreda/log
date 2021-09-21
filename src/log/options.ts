import type {Expand} from '@toreda/types';
import type {Log} from '../log';
import type {LogStateGlobal} from './state/global';

export type LogOptions = Expand<Required<LogOptionsGroup> | LogOptionsGlobal>;

/**
 * Used when creating a brand new Log
 */
export interface LogOptionsGlobal {
	state?: undefined;
	id?: string;
	parent?: undefined;
	path?: undefined;
	enabled?: undefined;
	level?: undefined;

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
	parent?: Log;
	path?: string[];

	enabled?: boolean;
	level?: number;
}
