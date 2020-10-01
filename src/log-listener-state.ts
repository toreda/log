import {EventEmitter} from 'events';
import {LogEvent} from './log-event';
import {LogMessage} from './log-message';
import {Logger} from './logger';

export interface LogListenerState {
	action: LogEvent;
	levelNum: number;
	levelStr: string;
	logs: LogMessage[];
	name: string;
}
