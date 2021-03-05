import {LogMessage} from './message';
import {LogTransportAction} from './transport/action';
import {LogTransportOptions} from './transport/options';
import {LogLevels} from './levels';

export class LogTransport {
	public readonly id: string;
	public readonly action: LogTransportAction;
	public readonly level: number;

	constructor(id: string, level: LogLevels, action: LogTransportAction, options?: LogTransportOptions) {
		if (!id && typeof id !== 'string') {
			throw new Error('Log Transport init failure - id arg must be a non-empty string.');
		}

		if (typeof id !== 'string') {
			throw new Error(`Log Transport init failure - id arg is missing.`);
		}

		if (!action) {
			throw new Error(`[logtr:${id}] Init failure - action arg is missing.`);
		}
		this.id = id;
		this.action = action;
		this.level = level;
	}

	public async execute(msg: LogMessage): Promise<boolean> {
		if (typeof this.action !== 'function') {
			return false;
		}

		return await this.action(msg);
	}
}
