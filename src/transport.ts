import {StrongString, makeString} from '@toreda/strong-types';
import {TransportAction} from './transport/action';
import {Message} from './message';
import {StrongLevel, makeLevel} from './strong-level';

export class Transport {
	public readonly id: StrongString;
	public readonly action: TransportAction;
	public readonly level: StrongLevel;

	constructor(id: string, level: number, action: TransportAction) {
		if (!id && typeof id !== 'string') {
			throw new Error('Transport init failure - id arg is missing.');
		}

		if (typeof id !== 'string') {
			throw new Error(`Transport init failure - id arg must be a non-empty string.`);
		}

		if (!action) {
			throw new Error(`[logtr:${id}] Init failure - action arg is missing.`);
		}

		if (typeof action !== 'function') {
			throw new Error(`[logtr:${id}] Init failure - action arg must be a function.`);
		}

		this.id = makeString(id);
		this.action = action;
		this.level = makeLevel(level);
	}

	public execute(msg: Message): Promise<boolean | Error> {
		const action = new Promise<boolean | Error>((resolve) => {
			resolve(this.action(msg));
		});

		return action
			.then((res) => {
				return res;
			})
			.catch((err) => {
				return err;
			});
	}
}
