import type {LogOptionsGroup} from './group';

/**
 * Used when creating a brand new Log
 *
 * @category Options
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
