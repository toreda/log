import {isType} from '@toreda/strong-types';
import {Expand} from '@toreda/types';
import {logToConsole} from './console';
import {Levels} from './levels';
import {Message} from './message';
import {LogOptions, LogOptionsGroup} from './log/options';
import {LogStateGlobal} from './log/state/global';
import {LogStateGroup} from './log/state/group';
import {isPositiveInteger} from './strong-level';
import {Transport} from './transport';

/**
 * Main log class holding attached transports and internal state
 * data, and logging configuration.
 */
export class Log {
	/** Serializable shared state data */
	public readonly globalState: LogStateGlobal;
	/** Serializable internal state data */
	public readonly groupState: LogStateGroup;

	public constructor(options?: LogOptions) {
		let enabled: boolean;
		let level: number;
		let path: string[];

		if (!options?.state) {
			path = options?.id ? [options.id] : [];
			this.globalState = new LogStateGlobal(options);
			this.globalState.groups.set(options?.id ?? 'default', this);
			level = this.globalState.globalLevel();
			enabled = this.globalState.groupsStartEnabled();
		} else {
			this.globalState = options.state;
			path = options.id.split('.');
			level = options.level ?? this.globalState.globalLevel();
			enabled = options.enabled ?? this.globalState.groupsStartEnabled();
		}

		this.groupState = new LogStateGroup({id: path.join('.'), path, level, enabled});

		// Activate console logging if allowed by start options.
		if (this.globalState.consoleEnabled()) {
			this.activateDefaultConsole();
		}
	}

	/**
	 * Enable global console logging for development and debugging.
	 */
	public activateDefaultConsole(level?: number): void {
		level = level ?? this.globalState.globalLevel();
		const transport = new Transport('console', level, logToConsole);
		this.addTransport(transport);
	}

	/**
	 * Attempt to make new log group with target id. Does not
	 * overwrite existing groups.
	 * @param group 		target log group to create.
	 * @returns 			Whether make group operation was successful. `false` when
	 * 						group already exists or failed. `true` when group with target
	 * 						id is created successfully.
	 */
	public makeLog(id: '', options?: MakeLogOptions): null;
	public makeLog(id: string, options?: MakeLogOptions): Log;
	public makeLog(id: string, options?: MakeLogOptions): Log | null {
		if (!id || typeof id !== 'string') {
			return null;
		}

		const path = this.groupState.path.concat(id);
		const groupId = path.join('.');

		const preexistingGroup = this.globalState.groups.get(groupId);

		if (preexistingGroup != null) {
			return preexistingGroup;
		}

		const level = options?.level ?? this.globalState.globalLevel();
		const enabled = options?.enabled ?? this.globalState.groupsStartEnabled();

		const group = new Log({state: this.globalState, id: groupId, path, level, enabled});
		this.globalState.groups.set(groupId, group);

		return group;
	}

	/**
	 * Add transport to target group.
	 * @param transport 		Transport to add to target group.
	 *
	 * @param id			Target group to add transport to. When null the `default`
	 * 							group is used. When target is non-null and target group does
	 * 							not exist, it will be created.
	 */
	public addTransport(transport: Transport): boolean {
		if (!transport || !(transport instanceof Transport)) {
			return false;
		}

		if (this.groupState.transports.has(transport)) {
			return false;
		}

		this.groupState.transports.add(transport);

		return true;
	}

	/**
	 * Remove transport from target group, or from the 'all' group if
	 * id is null.
	 * @param transport
	 * @param id
	 */
	public removeTransport(transport: Transport): boolean {
		if (!transport) {
			return false;
		}

		if (!this.groupState.transports.has(transport)) {
			return false;
		}

		this.groupState.transports.delete(transport);

		return true;
	}

	/**
	 * Remove transport matching target id from target group if
	 * both the group exists and the transport is in the group.
	 * @param transportId
	 * @param id
	 */
	public removeTransportById(transportId: string): boolean {
		for (const transport of this.groupState.transports) {
			// Remove matching transport and exit. Only one
			// of each transport can be added to a group.
			if (transport.id() === transportId) {
				this.groupState.transports.delete(transport);
				return true;
			}
		}

		return false;
	}

	/**
	 * Remove multiple transports in one call by providing an array
	 * of log transports to remove from this group.
	 * @param transports
	 */
	public removeTransports(transports: Transport[]): boolean {
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
	 * Remove matching transports from all groups. Expensive call not suitable to
	 * use generally, but available for specific cases where transports must be removed
	 * and may exist in multiple unknown groups. Prefer to use use `removeTransport` or
	 * `removeGroupTransport` when possible.
	 * @param transport
	 */
	public removeTransportEverywhere(transport: Transport): boolean {
		if (!transport || !isType(transport, Transport)) {
			return false;
		}

		let removeCount = 0;

		this.globalState.groups.forEach((group) => {
			if (group.removeTransport(transport)) {
				removeCount++;
			}
		});

		return removeCount > 0;
	}

	/**
	 * Change global log level. Individual group levels
	 * are used instead of global level when they are set.
	 * @param level
	 */
	public setGlobalLevel(level: number): void {
		this.globalState.globalLevel(level);
	}

	/**
	 * Add a level flag to the global log level without
	 * affecting other global level flags. Has no effect
	 * if target level flag is already enabled.
	 * @param level
	 */
	public enableGlobalLevel(level: number): void {
		this.globalState.globalLevel.enableLogLevel(level);
	}

	/**
	 * Add multiple flags to global log level. Performs
	 * sanity checks on each provided level and discards
	 * invalid values.
	 * @param levels
	 */
	public enableGlobalLevels(levels: number[]): void {
		this.globalState.globalLevel.enableMultipleLevels(levels);
	}

	public disableGlobalLevel(level: number): void {
		this.globalState.globalLevel.disableLogLevel(level);
	}

	public disableGlobalLevels(levels: number[]): void {
		this.globalState.globalLevel.disableMultipleLevels(levels);
	}

	/**
	 * Set log level for target group.
	 * @param level
	 * @param id
	 */
	public setGroupLevel(level: number): void {
		this.groupState.level(level);
	}

	public enableGroupLevel(level: number): void {
		this.groupState.level.enableLogLevel(level);
	}

	public enableGroupLevels(levels: number[]): void {
		this.groupState.level.enableMultipleLevels(levels);
	}

	public disableGroupLevel(level: number): void {
		this.groupState.level.disableLogLevel(level);
	}

	public disableGroupLevels(levels: number[]): void {
		this.groupState.level.disableMultipleLevels(levels);
	}

	/**
	 * Create structured log message. Provided as a call argument
	 * during transport execution.
	 * @param ts			UTC timestamp when msg was created.
	 * @param level			Level bitmask msg was logged with.
	 * @param msg			Msg that was logged.
	 */
	private createMessage(level: number, path: string[], ...msg: unknown[]): Message {
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

		const date = Date.now();

		return {date, level, message, path};
	}

	/**
	 * Determine whether group transport can execute target log
	 * message. Checks msg log level against global log level,
	 * group log level, and transport log level.
	 * @param transport
	 * @param globalLevel
	 * @param msgLevel
	 */
	private canExecute(transportLevel: number, msgLevel: number): boolean {
		if (!this.groupState.enabled()) {
			return false;
		}

		if (!isPositiveInteger(transportLevel)) {
			return false;
		}

		if (!isPositiveInteger(msgLevel)) {
			return false;
		}

		const activeMask = this.globalState.globalLevel() | this.groupState.level();

		return (activeMask & transportLevel & msgLevel) > 0;
	}

	/**
	 * Log message to default group.
	 * @param msgLevel
	 * @param msg
	 */
	public log(msgLevel: number, ...msg: unknown[]): Promise<boolean | LogResult> {
		if (!this.groupState.enabled()) {
			return Promise.resolve(false);
		}

		if (!isPositiveInteger(msgLevel)) {
			return Promise.resolve(false);
		}

		const message: Message = this.createMessage(msgLevel, this.groupState.path.slice(), ...msg);
		const actions: LogActionResult[] = [];

		for (const transport of this.groupState.transports) {
			if (this.canExecute(transport.level(), msgLevel)) {
				const result: LogActionResult = transport.execute(message).then((res) => {
					return [transport.id(), res];
				});
				actions.push(result);
			} else {
				actions.push(Promise.resolve([transport.id(), false]));
			}
		}

		return Promise.all(actions).then((res) => {
			const result = {};
			let failed = false;

			res.forEach((action) => {
				if (action[1] !== true) {
					failed = true;
					result[action[0]] = action[1];
				}
			});

			if (!failed) {
				return true;
			}

			return result;
		});
	}

	/**
	 * Trigger an error-level log message for no specific group (global).
	 * @param msg
	 */
	public error(...msg: unknown[]): Promise<boolean | LogResult> {
		return this.log(Levels.ERROR, ...msg);
	}

	/**
	 * Trigger a warn-level log message for no specific group (global).
	 * @param msg
	 */
	public warn(...msg: unknown[]): Promise<boolean | LogResult> {
		return this.log(Levels.WARN, ...msg);
	}

	/**
	 * Trigger an info-level log message for no specific group (global).
	 * @param args
	 */
	public info(...msg: unknown[]): Promise<boolean | LogResult> {
		return this.log(Levels.INFO, ...msg);
	}

	/**
	 * Trigger a -level log message for no specific group (global).
	 * @param msg
	 */
	public debug(...msg: unknown[]): Promise<boolean | LogResult> {
		return this.log(Levels.DEBUG, ...msg);
	}

	/**
	 * Trigger a trace-level log message for no specific group (global).
	 * @param args
	 */
	public trace(...msg: unknown[]): Promise<boolean | LogResult> {
		return this.log(Levels.TRACE, ...msg);
	}

	/**
	 * Clear all transports from this group.
	 */
	public clear(): void {
		this.groupState.transports.clear();
	}

	/**
	 * Clear all transports from all groups.
	 */
	public clearAll(): void {
		this.globalState.groups.forEach((group) => {
			group.clear();
		});
	}

	/**
	 * Remove all groups except the initial group.
	 * Clear all transport from the initial group.
	 */
	public reset(): Log {
		const [initialGroup] = this.globalState.groups.values();

		for (const [key, group] of this.globalState.groups) {
			if (group !== initialGroup) {
				group.globalState.groups.delete(key);
			}
		}

		initialGroup.clear();

		return this.globalState.groups[0];
	}
}

type LogResult = Record<string, boolean | Error>;
type LogActionResult = Promise<[string, boolean | Error]>;
type MakeLogOptions = Expand<Omit<LogOptionsGroup, 'state' | 'id' | 'path'>>;
