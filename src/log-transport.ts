import {LogMessage} from './log-message';
import {LogTransportAction} from './log-transport-Action';
import {LogTransportOptions} from './log-transport-options';
import {LogTransportState} from './log-transport-state';
import {makeString} from '@toreda/type-box';

export class LogTransport {
	public readonly action: LogTransportAction;
	public readonly state: LogTransportState;

	constructor(action: LogTransportAction, options?: LogTransportOptions) {
		if (typeof action !== 'function') {
			throw new Error('LogTransport init failed - callback should be a function');
		}

		this.action = action;
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

	public async execute(logMessage: LogMessage): Promise<any> {
		try {
			await this.action(logMessage);
		} catch (error) {
			console.error(`Transport (${this.state.id}) execute failed - ${error.message}`);
		}
	}
}
