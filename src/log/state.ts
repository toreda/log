import {LogLevel} from './level';

export interface LogState {
	groupsStartEnabled: boolean;
	consoleEnabled: boolean;
	forceEnabled: boolean;
	forceDisabled: boolean;
	globalLevel: LogLevel;
}
