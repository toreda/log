import {LogLevels} from './levels';

export interface LogOptions {
	consoleEnabled?: boolean;
	globalLogLevel?: LogLevels;
	groupsEnabledOnStart?: boolean;
}
