import {LogLevel} from './level';

/**
 * @category State
 */
export interface LogState {
	groupsStartEnabled: boolean;
	consoleEnabled: boolean;
	forceEnabled: boolean;
	forceDisabled: boolean;
	globalLevel: LogLevel;
}
