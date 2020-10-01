import {LogMessage} from './log-message';

export interface LogEvent {
	(message: string): void;
}
