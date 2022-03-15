import {LogLevel} from './log/level';
import {Message} from './message';
import {TransportAction} from './transport/action';

/**
 * Executes user-provided callback once for each message received.
 * Only receives messages matching user-configured log levels and
 * additional filters.
 *
 * @category Transports
 */
export class Transport {
	/** Globally unique identifier for transport. */
	public readonly id: string;
	/** Action executed once for each received matching msg. */
	public readonly action: TransportAction;
	/** Active log levels transport receives msgs for. */
	public readonly level: LogLevel;

	constructor({id, level, action}: {id: string; level: number; action: TransportAction}) {
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

		this.id = id;
		this.action = action;
		this.level = new LogLevel(level);
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
