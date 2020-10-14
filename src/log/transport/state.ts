import {StrongArray, StrongMap, StrongString, makeArray, makeString} from '@toreda/strong-types';

import {LogMessage} from '../message';
import {LogTransportOptions} from './options';

export class LogTransportState extends StrongMap {
	public readonly id: StrongString;
	public readonly logs: StrongArray<LogMessage>;

	constructor(options: LogTransportOptions = {}) {
		super();
		this.logs = makeArray([], []);
		this.id = makeString(this.randomId(), '');

		this.parse(options);
	}

	public randomId(): string {
		const size = 9;
		const randomInt = Math.floor(Math.random() * Math.pow(10, size));
		const randomId = ('0'.repeat(size) + randomInt.toString()).slice(-1 * size);

		return randomId;
	}
}
