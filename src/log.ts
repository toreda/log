import {isType} from '@toreda/strong-types';
import {LogActionConsole} from './log/action/console';
import {LogGroup} from './log/group';
import {LogLevels} from './log/levels';
import {LogMessage} from './log/message';
import {LogOptions} from './log/options';
import {LogState} from './log/state';
import {LogTransport} from './log/transport';

/**
 * Main log class holding attached transports and internal state
 * data, and logging configuration.
 */

export class Log {
	/** Serializable internal state data */
	public readonly state: LogState;

	public constructor(options?: LogOptions) {
		this.state = new LogState(options);

		// Activate console logging if allowed by start options.
		if (this.state.consoleEnabled()) {
			this.activateDefaultConsole();
		}
	}

	/**
	 * Enable global console logging for development and debugging.
	 */
	public activateDefaultConsole(): void {
		// Initial log level is NONE, which will rely on the global
		// log levl.
		const transport = new LogTransport('console', this.state.globalLogLevel(), LogActionConsole);
		this.addTransport(transport);
	}

	/**
	 * Attempt to make new log group with target groupId. Does not
	 * overwrite existing groups.
	 * @param groupId 		target log group to create.
	 * @returns 			Whether make group operation was successful. `false` when
	 * 						group already exists or failed. `true` when group with target
	 * 						id is created successfully.
	 */
	public makeGroup(groupId: string, logLevel: LogLevels, startEnabled?: boolean): boolean {
		if (typeof groupId !== 'string' || !groupId) {
			return false;
		}

		if (this.state.groups[groupId]) {
			return false;
		}

		const enabled = startEnabled ?? this.state.groupsEnabledOnStart();

		this.state.groupKeys.push(groupId);
		this.state.groups[groupId] = new LogGroup(groupId, logLevel, enabled);
		return true;
	}

	/**
	 * Make a LogGroup instance where all log levels automatically
	 * log to the target group ID.
	 * @param groupId
	 */
	public getGroup(groupId: string): LogGroup {
		if (this.state.groups[groupId]) {
			return this.state.groups[groupId];
		}

		this.makeGroup(groupId, LogLevels.ERROR);
		return this.state.groups[groupId];
	}

	public initGroups(groups?: {id: string; level: LogLevels}[]): void {
		if (!groups) {
			return;
		}

		if (!Array.isArray(groups)) {
			return;
		}

		for (const group of groups) {
			if (typeof group.id === 'string' && typeof group.level === 'number') {
				this.setGroupLevel(group.level, group.id);
			}
		}
	}

	/**
	 * Add transport to target group.
	 * @param transport 		Transport to add to target group.
	 *
	 * @param groupId			Target group to add transport to. When null the `default`
	 * 							group is used. When target is non-null and target group does
	 * 							not exist, it will be created.
	 */
	public addTransport(transport: LogTransport, groupId?: string): boolean {
		if (!transport || !(transport instanceof LogTransport)) {
			console.error(Error('transport is not a LogTransport.'));
			return false;
		}

		if (groupId == null) {
			return this.state.groups.default.addTransport(transport);
		}

		const group = this.getGroup(groupId);
		if (!group) {
			console.error(`addTransport failure - unable to find or create group with id '${groupId}.`);
			return false;
		}

		return group.addTransport(transport);
	}

	/**
	 * Remove transport from target group, or from the 'all' group if
	 * groupId is null.
	 * @param transport
	 * @param groupId
	 */
	public removeTransport(transport: LogTransport, groupId?: string): boolean {
		const idStr = groupId ?? 'default';
		const group = this.state.groups[idStr];

		if (!group) {
			console.error(`remove transport failure - bad group with id '${groupId}'.`);
			return false;
		}

		return group.removeTransport(transport);
	}

	/**
	 * Remove transport matching target id from target group if
	 * both the group exists and the transport is in the group.
	 * @param transportId
	 * @param groupId
	 */
	public removeTransportById(transportId: string, groupId?: string): boolean {
		const idStr = groupId ?? 'default';
		const group = this.state.groups[idStr];

		for (let i = group.transports.length - 1; i >= 0; i--) {
			const transport = group.transports[i];

			// Remove matching transport and exit. Only one
			// of each transport can be added to a group.
			if (transport.id === transportId) {
				group.transports.splice(i, 1);
				return true;
			}
		}

		return false;
	}

	/**
	 * Remove matching transports from all groups. Expensive call not suitable to
	 * use generally, but available for specific cases where transports must be removed
	 * and may exist in multiple unknown groups. Prefer to use use `removeTransport` or
	 * `removeGroupTransport` when possible.
	 * @param transport
	 */
	public removeTransportEverywhere(transport: LogTransport): boolean {
		if (!transport || !isType(transport, LogTransport)) {
			return false;
		}

		let removeCount = 0;
		for (const groupName of this.state.groupKeys) {
			const group = this.state.groups[groupName];
			const result = group.removeTransport(transport);
			if (result) {
				removeCount++;
			}
		}

		return removeCount > 0;
	}

	/**
	 * Change global log level. Individual group levels
	 * are used instead of global level when they are set.
	 * @param logLevel
	 */
	public setGlobalLevel(level: LogLevels): void {
		this.state.globalLogLevel(level);
	}

	/**
	 * Add a level flag to the global log level without
	 * affecting other global level flags. Has no effect
	 * if target level flag is already enabled.
	 * @param level
	 */
	public enableGlobalLevel(level: number): void {
		if (typeof level !== 'number') {
			return;
		}

		// Bitwise OR to activate any active bits in the
		// provided level bitmask.
		const globalLogLevel = this.state.globalLogLevel() | level;

		this.state.globalLogLevel(globalLogLevel);
	}

	/**
	 * Add multiple flags to global log level. Performs
	 * sanity checks on each provided level and discards
	 * invalid values.
	 * @param levels
	 */
	public enableGlobalLevels(levels: number[]): void {
		if (!Array.isArray(levels)) {
			return;
		}

		let mask = 0x0;
		for (const level of levels) {
			if (typeof level !== 'number') {
				continue;
			}

			mask |= level;
		}

		this.enableGlobalLevel(mask);
	}

	/**
	 * Set log level for target group.
	 * @param logLevel
	 * @param groupId
	 */
	public setGroupLevel(logLevel: LogLevels, groupId?: string): void {
		const idStr = groupId ?? 'default';
		const group = this.state.groups[idStr];

		if (!group) {
			return;
		}

		group.setLogLevel(logLevel);
	}

	/**
	 * Create structured log message. Provided as a call argument
	 * during transport execution.
	 * @param ts			UTC timestamp when msg was created.
	 * @param level			Level bitmask msg was logged with.
	 * @param msg			Msg that was logged.
	 */
	private createMessage(date: string, level: LogLevels, ...msg: unknown[]): LogMessage {
		let message: string;

		if (msg.length > 1) {
			message = JSON.stringify(msg);
		} else if (msg.length === 0) {
			message = '';
		} else if (typeof msg[0] === 'string') {
			message = msg[0];
		} else {
			message = JSON.stringify(msg[0]);
		}

		return {date, level, message};
	}

	/**
	 * Log message to default group.
	 * @param level
	 * @param msg
	 */
	public log(level: LogLevels, ...msg: unknown[]): Log {
		const logMsg: LogMessage = this.createMessage('', level, ...msg);

		this.state.groups.all.log(this.state.globalLogLevel(), logMsg);
		this.state.groups.default.log(this.state.globalLogLevel(), logMsg);

		return this;
	}

	/**
	 * Log message to target group. If groupId is null send to global.
	 * @param groupId 		Target group to send log message to.
	 * @param level
	 * @param msg
	 */
	public logTo(groupId: string, level: LogLevels, ...msg: unknown[]): Log {
		const logMsg: LogMessage = this.createMessage('', level, ...msg);

		this.state.groups.all.log(this.state.globalLogLevel(), logMsg);

		if (this.state.groups[groupId]) {
			this.state.groups[groupId].log(this.state.globalLogLevel(), logMsg);
		}

		return this;
	}

	/**
	 * Trigger an error-level log message for no specific group (global).
	 * @param msg
	 */
	public error(...msg: unknown[]): Log {
		return this.logTo('default', LogLevels.ERROR, ...msg);
	}

	/**
	 * Trigger an error-level log message for target group.
	 * @param groupId
	 * @param msg
	 */
	public errorTo(groupId: string, ...msg: unknown[]): Log {
		return this.logTo(groupId, LogLevels.ERROR, ...msg);
	}

	/**
	 * Trigger a warn-level log message for no specific group (global).
	 * @param msg
	 */
	public warn(...msg: unknown[]): Log {
		return this.logTo('default', LogLevels.WARN, ...msg);
	}

	/**
	 * Trigger a warn-level log message for target group.
	 * @param groupId
	 * @param msg
	 */
	public warnTo(groupId: string, ...msg: unknown[]): Log {
		return this.logTo(groupId, LogLevels.WARN, ...msg);
	}

	/**
	 * Trigger an info-level log message for no specific group (global).
	 * @param args
	 */
	public info(...msg: unknown[]): Log {
		return this.logTo('default', LogLevels.INFO, ...msg);
	}

	/**
	 * Triggers an info-level log message for target group.
	 * @param groupId
	 * @param msg
	 */
	public infoTo(groupId: string, ...msg: unknown[]): Log {
		return this.logTo(groupId, LogLevels.INFO, ...msg);
	}

	/**
	 * Trigger a -level log message for no specific group (global).
	 * @param msg
	 */
	public debug(...msg: unknown[]): Log {
		return this.logTo('default', LogLevels.DEBUG, ...msg);
	}

	/**
	 * Trigger a debug-level log message for target group.
	 * @param groupId
	 * @param msg
	 */
	public debugTo(groupId: string, ...msg: unknown[]): Log {
		return this.logTo(groupId, LogLevels.DEBUG, ...msg);
	}

	/**
	 * Trigger a trace-level log message for no specific group (global).
	 * @param args
	 */
	public trace(...msg: unknown[]): Log {
		return this.logTo('default', LogLevels.TRACE, ...msg);
	}

	/**
	 * Trigger a trace-level log message for target group.
	 * @param groupId
	 * @param msg
	 */
	public traceTo(groupId: string, ...msg: unknown[]): Log {
		return this.logTo(groupId, LogLevels.TRACE, ...msg);
	}

	/**
	 * Clear all transports from all groups.
	 */
	public clearAll(): void {
		for (const groupId of this.state.groupKeys) {
			this.state.groups[groupId].clear();
		}

		this.state.groupKeys.length = 0;
		this.makeGroup('all', LogLevels.ALL);
		this.makeGroup('default', LogLevels.ALL);
	}
}
