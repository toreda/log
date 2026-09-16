import {LogLevel} from './log/level';
import {Message} from './message';
import {TransportAction} from './transport/action';
import {checkLevel} from './check/level';

/**
 * Executes user-provided callback once for each message received.
 * Only receives messages matching user-configured log levels and
 * additional filters.
 *
 * @category Transports
 */
export class Transport {
	/** Identifier for transport. Unique within a log group. */
	public readonly id: string;
	/** Action executed once for each received matching msg. */
	public readonly action: TransportAction;
	/** Active log levels transport receives msgs for. */
	public readonly level: LogLevel;

	constructor({id, level, action}: {id: string; level: number; action: TransportAction}) {
		if (id == null) {
			throw new Error('[logtr] Init failure - id arg is missing.');
		}

		if (typeof id !== 'string' || id.length === 0) {
			throw new Error('[logtr] Init failure - id arg must be a non-empty string.');
		}

		if (action == null) {
			throw new Error(`[logtr:${id}] Init failure - action arg is missing.`);
		}

		if (typeof action !== 'function') {
			throw new Error(`[logtr:${id}] Init failure - action arg must be a function.`);
		}

		if (!checkLevel(level)) {
			throw new Error(`[logtr:${id}] Init failure - level arg must be a valid log level.`);
		}

		this.id = id;
		this.action = action;
		this.level = new LogLevel(level);
	}

	/**
	 * Execute transport action with msg. Never rejects: a thrown
	 * error or rejected promise resolves to the Error instead.
	 * @param msg
	 */
	public async execute(msg: Message): Promise<boolean | Error> {
		try {
			return await this.action(msg);
		} catch (err) {
			return err instanceof Error ? err : new Error(String(err));
		}
	}
}
