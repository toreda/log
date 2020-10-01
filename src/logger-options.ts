import {EventEmitter} from 'events';

export interface LoggerOptions {
	events?: EventEmitter;
	id?: string;
	levels?: string[];
}
