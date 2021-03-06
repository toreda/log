import {LogLevels} from './log/levels';
import {LogOptions} from './log/options';
import {LogTransport} from './log/transport';
import {LogGroup} from './log/group';
import {LogState} from './log/state';
import {LogMessage} from './log/message';
import {isType} from '@toreda/strong-types';

/**
 * Main log class holding attached transports and internal state
 * data, and logging configuration.
 */
export class Log {
	/** Serializable internal state data */
	public readonly state: LogState;

	public constructor(options?: LogOptions) {
		this.state = new LogState(options);
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
				this.setGroupLevel(group.id, group.level);
			}
		}
	}
	/**
	 * Add transport to target group.
	 * @param groupId			Target group to add transport to. When null the default 'all'
	 * 							group is used. When target is non-null and target group does
	 * 							not exist, it will be created.
	 *
	 * @param transport 		Transport to add to target group.
	 */
	public addGroupTransport(groupId: string | null, transport: LogTransport): boolean {
		if (typeof groupId !== 'string' && groupId !== null) {
			return false;
		}

		if (!transport || !(transport instanceof LogTransport)) {
			console.error(new Error('transport is not a LogTransport'));
			return false;
		}

		if (groupId === null) {
			return this.state.groups.all.addTransport(transport);
		}

		const group = this.getGroup(groupId);
		if (!group) {
			console.error(`addTransport failure - unable to find or create group with id '${groupId}.`);
			return false;
		}

		return group.addTransport(transport);
	}

	/**
	 * Add transport to default 'all' group. Transports in 'all'
	 * are only executed for messages which don't provide
	 * target groupId.
	 * @param transport		Transport to add to 'all' group.
	 */
	public addTransport(transport: LogTransport): boolean {
		return this.addGroupTransport(null, transport);
	}

	/**
	 * Add global transport. Executed once per log message matching
	 * transport's log level across all groups.
	 * @param transport		Target transport to become a global listener.
	 */
	public addGlobalTransport(transport: LogTransport): boolean {
		return this.addGroupTransport('global', transport);
	}

	/**
	 * Remove existing global transsport, if it exists. No changes made
	 * to global transports when target does not exist. Call only as needed
	 * for optimal performance. Method must perform an `O(n)` iteration where
	 * `n` is the current global transport count.
	 * @param transport		target transport to remove from global list.
	 *
	 * @returns 			`true` when transport match was found and removed
	 * 						from target group. `false` if no match was found.
	 */
	public removeGlobalTransport(transport: LogTransport): boolean {
		return this.removeGroupTransport('global', transport);
	}

	/**
	 * Remove target transport from default 'all' group. Calling
	 * has no effect when transport does not exist in 'all' group. If
	 * transport has been added to multiple groups,
	 * @param transport
	 */
	public removeTransport(transport: LogTransport): boolean {
		return this.removeGroupTransport(null, transport);
	}

	/**
	 * Remove transport from target group, or from the 'all' group if
	 * groupId is null.
	 * @param groupId
	 * @param transport
	 */
	public removeGroupTransport(groupId: string | null, transport: LogTransport): boolean {
		const idStr = typeof groupId === 'string' ? groupId : 'all';
		const group: LogGroup | null = this.getGroup(idStr);
		if (!group) {
			console.error(`remove transport failure - bad group with id '${groupId}'.`);
			return false;
		}

		return group.removeTransport(transport);
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
	public setGlobalLevel(logLevel: LogLevels): void {
		if (typeof logLevel !== 'number') {
			return;
		}

		if (logLevel < 0 || logLevel > LogLevels.ALL) {
			return;
		}

		this.state.globalLogLevel = logLevel;
	}

	/**
	 * Set log level for target group.
	 * @param logLevel
	 * @param groupId
	 */
	public setGroupLevel(groupId: string, logLevel: LogLevels): void {
		const group = this.getGroup(groupId);
		if (!group) {
			return;
		}

		group.setLogLevel(logLevel);
	}

	/**
	 * Attempt to make new log group with target groupId. Does not
	 * overwrite existing groups.
	 * @param groupId 		target log group to create.
	 * @returns 			Whether make group operation was successful. `false` when
	 * 						group already exists or failed. `true` when group with target
	 * 						id is created successfully.
	 */
	public makeGroup(groupId: string, logLevel: LogLevels): boolean {
		if (typeof groupId !== 'string' || !groupId) {
			return false;
		}

		if (this.state.groups[groupId]) {
			return false;
		}

		this.state.groupKeys.push(groupId);
		this.state.groups[groupId] = new LogGroup(groupId, logLevel);
		return true;
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
	 * Make a group logger instance where all log levels automatically
	 * log to the target group ID.
	 * @param groupId
	 */
	public getGroup(groupId: string): LogGroup {
		if (this.state.groups[groupId]) {
			return this.state.groups[groupId];
		}

		this.makeGroup(groupId, LogLevels.NONE | LogLevels.ERROR);
		return this.state.groups[groupId];
	}

	/**
	 * Log message to target group. If groupId is null,
	 * @param groupId 		Target group to send log message to.
	 * @param level
	 * @param msg
	 */
	public log(groupId: string | null, level: LogLevels, ...msg: unknown[]): Log {
		const logMsg: LogMessage = this.createMessage('', level, ...msg);

		if (typeof groupId === 'string' && this.state.groups[groupId]) {
			this.state.groups[groupId].log(this.state.globalLogLevel, logMsg);
		} else {
			this.state.groups['all'].log(this.state.globalLogLevel, logMsg);
		}

		this.state.groups.global.log(this.state.globalLogLevel, logMsg);

		return this;
	}

	/**
	 * Trigger an error-level log message for no specific group (global).
	 * @param msg
	 */
	public error(...msg: unknown[]): Log {
		return this.log(null, LogLevels.ERROR, ...msg);
	}

	/**
	 * Trigger an error-level log message for target group.
	 * @param groupId
	 * @param msg
	 */
	public errorGroup(groupId: string | null, ...msg: unknown[]): Log {
		return this.log(groupId, LogLevels.ERROR, ...msg);
	}

	/**
	 * Trigger a warn-level log message for no specific group (global).
	 * @param msg
	 */
	public warn(...msg: unknown[]): Log {
		return this.warnGroup(null, ...msg);
	}

	/**
	 * Trigger a warn-level log message for target group.
	 * @param groupId
	 * @param msg
	 */
	public warnGroup(groupId: string | null, ...msg: unknown[]): Log {
		return this.log(groupId, LogLevels.WARN, ...msg);
	}

	/**
	 * Trigger an info-level log message for no specific group (global).
	 * @param args
	 */
	public info(...msg: unknown[]): Log {
		return this.infoGroup(null, ...msg);
	}

	/**
	 * Triggers an info-level log message for target group.
	 * @param groupId
	 * @param msg
	 */
	public infoGroup(groupId: string | null, ...msg: unknown[]): Log {
		return this.log(groupId, LogLevels.INFO, ...msg);
	}

	/*
	 * Trigger a debug-level log message for no specific group (global).
	 * @param msg
	 */
	public debug(...msg: unknown[]): Log {
		return this.debugGroup(null, ...msg);
	}

	/**
	 * Trigger a debug-level log message for target group.
	 * @param groupId
	 * @param msg
	 */
	public debugGroup(groupId: string | null, ...msg: unknown[]): Log {
		return this.log(groupId, LogLevels.DEBUG, ...msg);
	}

	/**
	 * Trigger a trace-level log message for no specific group (global).
	 * @param args
	 */
	public trace(...msg: unknown[]): Log {
		return this.traceGroup(null, ...msg);
	}

	/**
	 * Trigger a trace-level log message for target group.
	 * @param groupId
	 * @param msg
	 */
	public traceGroup(groupId: string | null, ...msg: unknown[]): Log {
		return this.log(groupId, LogLevels.TRACE, ...msg);
	}

	/**
	 * Clear all transports from all groups.
	 */
	public clearAll(): void {
		for (const groupId of this.state.groupKeys) {
			this.state.groups[groupId].clear();
		}

		this.state.groupKeys.length = 0;
		this.state.groupKeys.push('all');
		this.state.groupKeys.push('global');
	}
}
