import {EventEmitter} from 'events';
import {LogListener} from './log-listener';

export interface LoggerState {
	events: EventEmitter;
	id: string;
	levels: string[];
	listenerNames: string[];
	listeners: {[name: string]: LogListener};
}
