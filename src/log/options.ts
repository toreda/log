import {LogStateGlobal} from './state/global';

export type LogOptions = LogOptionsGlobal | LogOptionsGroup;

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
