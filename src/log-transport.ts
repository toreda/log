import {LogTransportAction} from './log-transport-action';
import {LogTransportOptions} from './log-transport-options';
import {LogTransportState} from './log-transport-state';
import {makeString} from '@toreda/type-box';

export class LogTransport {
	public readonly state: LogTransportState;

	constructor(options?: LogTransportOptions) {
		this.state = this.parseOptions(options);
	}

	public parseOptions(options: LogTransportOptions = {}): LogTransportState {
		const size = 9;
		const randomInt = Math.floor(Math.random() * Math.pow(10, size));
		const randomId = ('0'.repeat(size) + randomInt.toString()).slice(-1 * size);

		return {
			execute: this.parseOptionsExecute(options.execute),
			id: makeString(options.id, randomId),
			logs: []
		};
	}

	public parseOptionsExecute(execute?: LogTransportAction): LogTransportAction {
		if (!execute) {
			return this.defaultAction;
		}

		if (typeof execute !== 'function') {
			throw new Error('LogTransport init failed - execute should be a function');
		}

		return execute;
	}

	public defaultAction: LogTransportAction = function (logMessage) {
		return new Promise((resolve) => {
			let logString = '';
			logString += `[${logMessage.date}]`;
			logString += ` ${logMessage.level.toUpperCase()}:`;
			logString += ` ${logMessage.message}`;
			console.log(logString);
			resolve();
		});
	};
}
