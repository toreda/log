import {LogLevels} from './levels';

export interface LogOptions {
	globalLogLevel?: LogLevels;
	groupLevels?: {groupId: string; level: LogLevels}[];
}
