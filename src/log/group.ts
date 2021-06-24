import {StrongBoolean, StrongInt, isType, makeBoolean, makeInt} from '@toreda/strong-types';
import {
	LogLevelDisable,
	LogLevelDisableMultiple,
	LogLevelEnable,
	LogLevelEnableMultiple
} from './levels/helpers';
import {LogMessage} from './message';
import {LogTransport} from './transport';

export class LogGroup {
	public readonly id: string;
	public readonly enabled: StrongBoolean;
	public readonly transports: LogTransport[];
	public readonly added: Set<LogTransport>;
	public readonly logLevel: StrongInt;

	constructor(id: string, logLevel: number, enabled: boolean) {
		this.id = id;

		this.enabled = makeBoolean(true, enabled);
		this.transports = [];
		this.logLevel = makeInt(1, logLevel);
		this.added = new Set<LogTransport>();
	}

	/**
	 * Convert message to structured data and call all
	 * group transports which listen for message log level.
	 * @param level		Bitmask level msg was logged with.
	 * @param msg		Message to be logged.
	 */
	public async log(globalLvl: number, msg: LogMessage): Promise<void> {
		if (typeof msg.level !== 'number' || msg.level === 0) {
			return;
		}

		// No logs processed when entire group is disabled.
		if (!this.enabled()) {
			return;
		}

		for (const transport of this.transports) {
			await this.execute(transport, globalLvl, msg);
		}
	}

	/**
	 * Attempt to execute every action with transports matching the
	 * current log level.
	 * @param transport
	 * @param msg
	 */
	private async execute(transport: LogTransport, globalLvl: number, msg: LogMessage): Promise<boolean> {
		if (!this.canExecute(transport, globalLvl, msg.level)) {
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
	 * @param globalLvl
	 * @param msgLevel
	 */
	private canExecute(transport: LogTransport, globalLvl: number, msgLevel: number): boolean {
		if (!isType(transport, LogTransport)) {
			return false;
		}

		// No logs or transports processed when group is disabled.
		if (!this.enabled()) {
			return false;
		}

		// Combine all active bits from the global, group, and transport
		// masks into a single active bitmask.
		let activeMask = 0;

		if (typeof globalLvl === 'number') {
			activeMask |= globalLvl;
		}

		if (typeof this.logLevel() === 'number') {
			activeMask |= this.logLevel();
		}

		if (typeof transport.level === 'number') {
			activeMask |= transport.level;
		}

		// Message level mask contains >= 1 active bits.
		// Matching 1+ bits allows message to be logged.
		return (activeMask & msgLevel) != 0;
	}

	/**
	 * Set active log level for this group.
	 * @param logLevel
	 */
	public setLogLevel(logLevel: number): void {
		this.logLevel(logLevel);
	}

	public enableLogLevel(logLevel: number): void {
		LogLevelEnable(this.logLevel, logLevel);
	}

	public enableLogLevels(logLevels: number[]): void {
		LogLevelEnableMultiple(this.logLevel, logLevels);
	}

	public disableLogLevel(logLevel: number): void {
		LogLevelDisable(this.logLevel, logLevel);
	}

	public disableLogLevels(logLevels: number[]): void {
		LogLevelDisableMultiple(this.logLevel, logLevels);
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
