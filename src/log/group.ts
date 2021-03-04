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

	public async log(level: LogLevels, ...msg: unknown[]): Promise<void> {
		const content: string = msg.join(' ');

		const logMessage: LogMessage = {
			date: new Date().toISOString(),
			level: LogLevels[level],
			message: content
		};

		for (let bitMask = 1; bitMask <= 16; bitMask *= 2) {
			const currentLevel = level & bitMask;
			await this.executeLevel(currentLevel, logMessage);
		}
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
		return (logLevel & transport.levels) > 0x0;
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

		this.added.delete(transport);
		let deleteCount = 0;
		for (let i = this.transports.length - 1; i >= 0; i--) {
			if (transport === this.transports[i]) {
				this.transports.splice(i, 1);
				deleteCount++;
			}
		}

		/** 1 or more deletions is success. */
		return deleteCount > 0;
	}

	/**
	 * Quickly and efficiently remove all transports in this group
	 */
	public clear(): void {
		this.transports.length = 0;
		this.added.clear();
	}
}
