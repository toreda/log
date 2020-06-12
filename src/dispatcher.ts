import {ArmorActionResult} from '@armorjs/action-result';
import { ArmorLogGroup } from './group';
import {ArmorLogLevel} from './level';
import {ArmorLogListener} from './listener';
import {ArmorLogProcessor} from './processor';
import {EventEmitter} from 'events';

export class ArmorLogDispatcher {
	public readonly events: EventEmitter;
	public readonly groups: {[level: string]: ArmorLogGroup};
	public readonly logGroups: string[];
	public nextListenerId: number;

	constructor(events: EventEmitter) {
		if (!events) {
			throw new Error('Armor Log Dispatcher init failed - no events argument provided.');
		}

		if (!(events instanceof EventEmitter)) {
			throw new Error(
				'Armor Log Dispatcher init failed - events argument not a valid EventEmitter instance.'
			);
		}

		this.nextListenerId = 0;
		this.logGroups = [];
		this.groups = {};
		this.events = events;
	}

	public getNextListenerId(): number {
		return this.nextListenerId++;
	}

	public createListener(processor: ArmorLogProcessor): ArmorLogListener | null {
		if (!processor) {
			return null;
		}

		let listener: ArmorLogListener | null = null;
		const id = this.getNextListenerId();

		try {
			listener = new ArmorLogListener(id, processor);
		} catch (e) {
			listener = null;
		}

		return listener;
	}

	public register(level: ArmorLogLevel, processor: ArmorLogProcessor): ArmorActionResult {
		const result = new ArmorActionResult();
		const levelStr = level.toString();
		if (!this.groups[levelStr]) {
			this.groups[levelStr] = new ArmorLogGroup(levelStr);
		}

		const group = this.groups[levelStr];
		const listener = this.createListener(processor);

		if (!listener) {
			result.fail();
			return result;
		}

		result.payload = listener;
		group.add(listener);
		return result;
	}

	public unregister(id: string): boolean {
		return false;
	}

	public dispatch(level: ArmorLogLevel): void {
		for (let i = 0; i < this.logGroups.length; i++) {}
	}
}
