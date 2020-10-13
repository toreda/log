import {TBBool, TBString, makeBool, makeString} from '@toreda/type-box';

import {LogTransport} from './log-transport';
import {LoggerOptions} from './logger-options';
import {Map} from '@toreda/map';

export class LoggerState extends Map {
	public readonly id: TBString;
	public transportNames: {[id: string]: LogTransport};
	public transportGroups: {[name: number]: string[]};

	constructor(options: LoggerOptions = {}) {
		super();
		this.transportGroups = {};
		this.transportNames = {};
		this.id = this.parseOptionsId(options);
	}

	public parseOptionsId(options: LoggerOptions = {}): TBString {
		const size = 5;
		const randomInt = Math.floor(Math.random() * Math.pow(10, size));
		const randomId = ('0'.repeat(size) + randomInt.toString()).slice(-1 * size);

		return makeString(options.id, randomId);
	}
}
