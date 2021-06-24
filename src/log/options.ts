import {LogLevels} from './levels';
import {LogGroupData} from './group/data';

export interface LogOptions {
	consoleEnabled?: boolean;
	globalLogLevel?: LogLevels;
	groupsEnabledOnStart?: boolean;
	startingGroups?: LogGroupData[];
}
