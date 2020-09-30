import {LogMessage} from './log-message';

export interface LogEvent {
	(logMessage: LogMessage): void;
}
