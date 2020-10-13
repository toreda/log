import {StrongMap, StrongString, makeString} from '@toreda/strong-types';

import {LogTransport} from './log-transport';
import {LoggerOptions} from './logger-options';

export class LoggerState extends StrongMap {
	public readonly id: StrongString;
	public transportNames: {[id: string]: LogTransport};
	public transportGroups: {[name: number]: string[]};

	constructor(options: LoggerOptions = {}) {
		super();
		this.transportGroups = {};
		this.transportNames = {};
		this.id = makeString(this.randomId(), '');

		this.parse(options);
	}

	public randomId(): string {
		const size = 5;
		const randomInt = Math.floor(Math.random() * Math.pow(10, size));
		const randomId = ('0'.repeat(size) + randomInt.toString()).slice(-1 * size);

		return randomId;
	}
}
