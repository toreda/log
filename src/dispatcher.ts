import { ArmorLogHandler } from './handler';
import { ArmorLogLevel } from './level';
import {EventEmitter} from 'events';

export class ArmorLogDispatcher {
	public readonly events: EventEmitter;
	public readonly handlers: {[level: string]: ArmorLogHandler[]};
	public readonly logGroups: string[];

	constructor(events: EventEmitter) {
		if (!events) {
			throw new Error('Armor Log Dispatcher init failed - no events argument provided.');
		}

		if (!(events instanceof EventEmitter)) {
			throw new Error('Armor Log Dispatcher init failed - events argument was not a valid EventEmitter instance.');
		}

		this.logGroups = [];
		this.handlers = {};
		this.events = events;
	}


	public register(level: ArmorLogLevel, handler: ArmorLogHandler): string {
		const levelStr = level.toString();
		if (!this.handlers[levelStr]) {
			this.handlers[levelStr] = [];
		}

		this.handlers[levelStr].push(handler);
		return '';
	}

	public unregister(id: string): boolean {
		return false;
	}

	public dispatch(level: ArmorLogLevel): void {

		for (let i = 0; i < this.logGroups.length; i++) {

		}
	}

	public createHandlerId(): void {

	}
}
