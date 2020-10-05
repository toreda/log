import {LogMessage} from './log-message';
import {LogTransportAction} from './log-transport-action';
import {LogTransportOptions} from './log-transport-options';
import {LogTransportState} from './log-transport-state';
import {makeString} from '@toreda/type-box';

export class LogTransport {
	public readonly execute: LogTransportAction;
	public readonly state: LogTransportState;

	constructor(execute: LogTransportAction, options?: LogTransportOptions) {
		if (typeof execute !== 'function') {
			throw new Error('LogTransport init failed - execute should be a function');
		}

		this.execute = execute;
		this.state = this.parseOptions(options);
	}

	public parseOptions(options: LogTransportOptions = {}): LogTransportState {
		const size = 9;
		const randomInt = Math.floor(Math.random() * Math.pow(10, size));
		const randomId = ('0'.repeat(size) + randomInt.toString()).slice(-1 * size);

		return {
			id: makeString(options.id, randomId),
			logs: []
		};
	}
}
