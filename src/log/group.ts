import {StrongBoolean, isType, makeBoolean} from '@toreda/strong-types';
import {LogLevels} from './levels';
import {LogMessage} from './message';
import {LogTransport} from './transport';

export class LogGroup {
	public readonly id: string;
	public readonly enabled: StrongBoolean;
	public readonly transports: LogTransport[];
	public readonly added: Set<LogTransport>;
	public logLevel: LogLevels;

	constructor(id: string, logLevel: LogLevels, enable: boolean) {
		this.id = id;

		this.enabled = makeBoolean(enable, true);
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
	public async log(globalLevel: LogLevels, msg: LogMessage): Promise<void> {
		if (typeof msg.level !== 'number' || msg.level === 0) {
			return;
		}

		// No logs processed when entire group is disabled.
		if (!this.enabled()) {
			return;
		}

		for (const transport of this.transports) {
			await this.execute(transport, globalLevel, this.logLevel, msg);
		}
	}

	/**
	 * Attempt to execute every action with transports matching the
	 * current log level.
	 * @param transport
	 * @param msg
	 */
	public async execute(
		transport: LogTransport,
		globalLevel: LogLevels,
		groupLevel: LogLevels,
		msg: LogMessage
	): Promise<boolean> {
		if (!this.canExecute(transport, globalLevel, groupLevel, msg.level)) {
			return false;
		}

		try {
			transport.execute(msg);
		} catch (e) {
			console.error(`transport execution failure: ${e.message}.`);
		}

		return true;
	}

	/**
	 * Determine whether group transport can execute target log
	 * message. Checks msg log level against global log level,
	 * group log level, and transport log level.
	 * @param transport
	 * @param globalLevel
	 * @param groupLevel
	 * @param msgLevel
	 */
	public canExecute(
		transport: LogTransport,
		globalLevel: LogLevels,
		groupLevel: LogLevels,
		msgLevel: LogLevels
	): boolean {
		if (!isType(transport, LogTransport)) {
			return false;
		}

		// No logs or transports processed when group is disabled.
		if (!this.enabled()) {
			return false;
		}

		// Combine all active bits from the global, group, and transport
		// masks into a single active bitmask.
		let activeMask = 0x0;
		if (typeof globalLevel === 'number') {
			activeMask |= globalLevel;
		}

		if (typeof groupLevel === 'number') {
			activeMask |= groupLevel;
		}

		if (typeof transport.level === 'number') {
			activeMask |= transport.level;
		}

		// Message level mask contains >= 1 active bits.
		// Matching 1+ bits allows message to be logged.
		return (activeMask & msgLevel) != 0;
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

		if (this.added.has(transport)) {
			return false;
		}

		this.added.add(transport);
		this.transports.push(transport);
		return true;
	}

	/**
	 * Set active log level for this group.
	 * @param logLevel
	 */
	public setLogLevel(logLevel: LogLevels): void {
		if (typeof logLevel !== 'number') {
			return;
		}

		this.logLevel = logLevel;
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
	 * Remove multiple transports in one call by providing an array
	 * of log transports to remove from this group.
	 * @param transports
	 */
	public removeTransports(transports: LogTransport[]): boolean {
		if (!Array.isArray(transports)) {
			return false;
		}

		let success = false;
		for (const transport of transports) {
			const result = this.removeTransport(transport);

			if (result) {
				success = true;
			}
		}

		return success;
	}

	/**
	 * Quickly and efficiently remove all transports in this group
	 */
	public clear(): void {
		this.transports.length = 0;
		this.added.clear();
	}
}
