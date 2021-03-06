import {LogMessage} from './message';
import {LogAction} from './action';
import {LogLevels} from './levels';

export class LogTransport {
	public readonly id: string;
	public readonly action: LogAction;
	public readonly level: number;

	constructor(id: string, level: LogLevels, action: LogAction) {
		if (!id && typeof id !== 'string') {
			throw new Error('Log Transport init failure - id arg is missing.');
		}

		if (typeof id !== 'string') {
			throw new Error(`Log Transport init failure - id arg must be a non-empty string.`);
		}

		if (!action) {
			throw new Error(`[logtr:${id}] Init failure - action arg is missing.`);
		}

		if (typeof action !== 'function') {
			throw new Error(`[logtr:${id}] Init failure - action arg must be a function.`);
		}

		this.id = id;
		this.action = action;
		this.level = level;
	}

	public async execute(msg: LogMessage): Promise<boolean> {
		return await this.action(msg);
	}
}
