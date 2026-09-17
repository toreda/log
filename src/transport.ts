import type {LevelInput} from './level/input';
import {LogLevel} from './log/level';
import type {Message} from './message';
import type {TransportAction} from './transport/action';
import {levelMask} from './level/mask';

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

	/**
	 * @param level		Level bitmask, level key, or array of either
	 * 					combined into the transport's starting level.
	 */
	constructor({
		id,
		level,
		action
	}: {
		id: string;
		level: LevelInput | LevelInput[];
		action: TransportAction;
	}) {
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

		const mask = levelMask(level);

		if (mask === null) {
			throw new Error(`[logtr:${id}] Init failure - level arg must be a valid log level.`);
		}

		this.id = id;
		this.action = action;
		this.level = new LogLevel(mask);
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
