import {TBArray, TBString, makeArray, makeString} from '@toreda/type-box';

import {LogMessage} from './log-message';
import {LogTransportOptions} from './log-transport-options';
import {Map} from '@toreda/map';

export class LogTransportState extends Map {
	public readonly id: TBString;
	public readonly logs: TBArray<LogMessage>;

	constructor(options: LogTransportOptions = {}) {
		super();
		this.logs = makeArray([], []);
		this.id = this.parseOptionsId(options);
	}

	public parseOptionsId(options: LogTransportOptions = {}): TBString {
		const size = 9;
		const randomInt = Math.floor(Math.random() * Math.pow(10, size));
		const randomId = ('0'.repeat(size) + randomInt.toString()).slice(-1 * size);

		return makeString(options.id, randomId);
	}
}
