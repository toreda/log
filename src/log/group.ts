import {LogTransport} from './transport';
import {LogLevels} from './levels';
import {LogMessage} from '../log/message';
import {isType} from '@toreda/strong-types';

export class LogGroup {
	public readonly id: string;
	public readonly transports: LogTransport[];
	public readonly added: Set<LogTransport>;
	public logLevel: LogLevels;

	constructor(id: string, logLevel: LogLevels) {
		this.id = id;
		this.transports = [];
		this.logLevel = logLevel;
		this.added = new Set<LogTransport>();
	}

	/**
	 * Convert message to structured data and call all
	 * group transports which listen for message log level.
	 * @param level		Bitmask level msg was logged with.
	 * @param msg		Message to be logged.
	 */
	public async log(level: LogLevels, ...msg: unknown[]): Promise<void> {
		const logMsg = this.createMessage('', level, ...msg);

		for (let bitMask = 1; bitMask <= 16; bitMask *= 2) {
			const currentLevel = level & bitMask;
			await this.executeLevel(currentLevel, logMsg);
		}
	}

	/**
	 * Create structured log message. Provided as a call argument
	 * during transport execution.
	 * @param ts			UTC timestamp when msg was created.
	 * @param level			Level bitmask msg was logged with.
	 * @param msg			Msg that was logged.
	 */
	public createMessage(ts: string, level: LogLevels, ...msg: unknown[]): LogMessage {
		const content = Array.isArray(msg) ? msg.join(' ') : msg;

		return {
			date: ts,
			level: level,
			message: content
		};
	}

	/**
	 * Log error message to this group.
	 * @param msg
	 */
	public error(...msg: unknown[]): void {
		this.log(LogLevels.ERROR, msg);
	}

	/**
	 * Log warning message to this group.
	 * @param msg
	 */
	public warn(...msg: unknown[]): void {
		this.log(LogLevels.WARN, msg);
	}

	/**
	 * Log info message to this group.
	 * @param msg
	 */
	public info(...msg: unknown[]): void {
		this.log(LogLevels.INFO, msg);
	}

	/**
	 * Log debug message to this group.
	 * @param msg
	 */
	public debug(...msg: unknown[]): void {
		this.log(LogLevels.DEBUG, msg);
	}

	/**
	 * Log trace message to this group.
	 * @param msg
	 */
	public trace(...msg: unknown[]): void {
		this.log(LogLevels.TRACE, msg);
	}

	public async executeLevel(logLevel: number, msg: LogMessage): Promise<boolean> {
		if (typeof logLevel !== 'number' || logLevel === 0) {
			return false;
		}

		for (const transport of this.transports) {
			if (!this.canExecute(logLevel, transport)) {
				continue;
			}

			try {
				transport.execute(msg);
			} catch (e) {
				console.error(`transport execution failure: ${e.message}.`);
			}
		}

		return true;
	}

	public canExecute(logLevel: LogLevels, transport: LogTransport): boolean {
		return (logLevel & transport.level) > 0x0;
	}

	/**
	 * Add target transport to this group. Executes when this group
	 * is not explicitly disabled, target transport is not explicitly
	 * disabled, and current log level and transport log level share an
	 * active bit.
	 * @param transport
	 */
	public addTransport(transport: LogTransport): boolean {
		if (!transport || !isType(transport, LogTransport)) {
			return false;
		}

		this.transports.push(transport);
		return true;
	}

	/**
	 * Remove previously added transport from this log group. Any transport
	 * added to multiple groups must be removed from each group individually.
	 * @param transport			LogTransport to match and remove.
	 */
	public removeTransport(transport: LogTransport): boolean {
		if (!transport) {
			return false;
		}

		let deleted = false;
		for (let i = this.transports.length - 1; i >= 0; i--) {
			if (transport === this.transports[i]) {
				this.transports.splice(i, 1);
				deleted = true;
				this.added.delete(transport);
				break;
			}
		}

		/** 1 or more deletions is success. */
		return deleted;
	}

	/**
	 * Quickly and efficiently remove all transports in this group
	 */
	public clear(): void {
		this.transports.length = 0;
		this.added.clear();
	}
}
