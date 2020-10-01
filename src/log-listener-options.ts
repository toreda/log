import {LogEvent} from './log-event';

export interface LogListenerOptions {
	level?: number | string;
	name?: string;
	action?: LogEvent;
}
