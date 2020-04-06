import { ArmorLogHandler } from './handler';
import { ArmorLogLevel } from './level';
import {EventEmitter} from 'events';

export class ArmorLogDispatcher {
	public readonly events: EventEmitter;
	public readonly handlers: {[level: string]: ArmorLogHandler[]};

	constructor(events: EventEmitter) {
		if (!events) {
			throw new Error('Armor Log Dispatcher init failed - no events argument provided.');
		}

		if (!(events instanceof EventEmitter)) {
			throw new Error('Armor Log Dispatcher init failed - events argument was not a valid EventEmitter instance.');
		}

		this.handlers = {};
		this.events = events;
	}

	public createHandlerGroups(): any {

	}

	public register(level: ArmorLogLevel): void {

	}

	public dispatch(level: ArmorLogLevel): void {

	}
}
