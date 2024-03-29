import type {Expand} from '@toreda/types';
import {Levels} from './levels';
import type {LogOptions} from './log/options';
import type {LogOptionsGroup} from './log/options/group';
import {LogStateGlobal} from './log/state/global';
import {LogStateGroup} from './log/state/group';
import type {Message} from './message';
import {Transport} from './transport';
import {checkLevel} from './check/level';
import {logToConsole} from './console';

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
		let parent: Log | undefined;
		let path: string[];

		if (!options?.state) {
			path = options?.id ? [options.id] : [];
			this.globalState = new LogStateGlobal(options);
			this.globalState.groups.set(options?.id ?? 'default', this);
			level = this.globalState.globalLevel.get();
			this.globalState.globalLevel.set(level);
			enabled = this.globalState.groupsStartEnabled;
		} else if (options.state instanceof LogStateGlobal) {
			this.globalState = options.state;
			parent = options.parent;
			path = options.id.split('.');
			level = options.level;
			enabled = options.enabled;
		} else {
			throw Error(`Bad Log init - 'state' was not an instance of LogStateGlobal.`);
		}

		this.groupState = new LogStateGroup({id: path.join('.'), parent, path, level, enabled});

		// Activate console logging if allowed by start options.
		if (this.globalState.consoleEnabled) {
			this.activateDefaultConsole();
		}
	}

	/**
	 * Enable global console logging for development and debugging.
	 */
	public activateDefaultConsole(level: number = Levels.ALL_EXTENDED): void {
		const transport = new Transport('console', level, logToConsole);
		this.addTransport(transport);
	}

	public deactivateDefaultConsole(): void {
		this.removeTransportById('console');
	}

	/**
	 * Sets the level of the default console to the level
	 * of the log.
	 */
	public resetLevelDefaultConsole(): void {
		this.setLevelDefaultConsole(this.groupState.level.get());
	}

	public setLevelDefaultConsole(level: number): void {
		const console = this.getTransport('console');

		if (!console) {
			return;
		}

		console.level.set(level);
	}

	public enableLevelDefaultConsole(level: number): void {
		const console = this.getTransport('console');

		if (!console) {
			return;
		}

		console.level.enableLevel(level);
	}

	public disableLevelDefaultConsole(level: number): void {
		const console = this.getTransport('console');

		if (!console) {
			return;
		}

		console.level.disableLevel(level);
	}

	/**
	 * Attempt to make new log group with target id. Does not
	 * overwrite existing groups.
	 * @param id	 		id of new log.
	 * @returns 			The new log if successful or null if it fails.
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

		const level =
			options && checkLevel(options.level) ? options.level : this.globalState.globalLevel.get();
		const enabled = options?.enabled ?? this.globalState.groupsStartEnabled;

		const group = new Log({state: this.globalState, id: groupId, parent: this, path, level, enabled});
		this.globalState.groups.set(groupId, group);

		return group;
	}

	/**
	 * Add transport to log.
	 * @param transport 		Transport to add to log.
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

	public getTransport(transportId: string): Transport | null {
		for (const transport of this.groupState.transports) {
			// Remove matching transport and exit. Only one
			// of each transport can be added to a group.
			if (transport.id === transportId) {
				return transport;
			}
		}

		return null;
	}

	/**
	 * Remove transport from target group, or from the 'all' group if
	 * id is null.
	 * @param transport
	 */
	public removeTransport(transport: Transport | null): boolean {
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
	 */
	public removeTransportById(transportId: string): boolean {
		const transport = this.getTransport(transportId);
		return this.removeTransport(transport);
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
		if (!transport || !(transport instanceof Transport)) {
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
	 * All Logs become disabled without changing
	 * the state of each log individually.
	 */
	public enforceGlobalDisable(): void {
		this.globalState.forceDisabled = true;
		this.globalState.forceEnabled = false;
	}

	/**
	 * All Logs become enabled without changing the
	 * state of each log individually.
	 */
	public enforceGlobalEnable(): void {
		this.globalState.forceEnabled = true;
		this.globalState.forceDisabled = false;
	}

	/**
	 * Both global enable and disable are turned
	 * off. Logs rely on their own setting.
	 */
	public useGroupEnable(): void {
		this.globalState.forceDisabled = false;
		this.globalState.forceEnabled = false;
	}

	/**
	 * Enable log.
	 */
	public enable(): void {
		this.groupState.enabled = true;
	}

	/**
	 * Disable log.
	 */
	public disable(): void {
		this.groupState.enabled = false;
	}

	/**
	 * Change global log level. Individual group levels
	 * are used instead of global level when they are set.
	 * @param level
	 */
	public setGlobalLevel(level: number): void {
		this.globalState.globalLevel.set(level);
	}

	/**
	 * Add a level flag to the global log level without
	 * affecting other global level flags. Has no effect
	 * if target level flag is already enabled.
	 * @param level
	 */
	public enableGlobalLevel(level: number): void {
		this.globalState.globalLevel.enableLevel(level);
	}

	/**
	 * Add multiple flags to global log level. Performs
	 * sanity checks on each provided level and discards
	 * invalid values.
	 * @param levels
	 */
	public enableGlobalLevels(levels: number[]): void {
		this.globalState.globalLevel.enableLevels(levels);
	}

	public disableGlobalLevel(level: number): void {
		this.globalState.globalLevel.disableLevel(level);
	}

	public disableGlobalLevels(levels: number[]): void {
		this.globalState.globalLevel.disableLevels(levels);
	}

	/**
	 * Set log level for target group.
	 * @param level
	 * @param id
	 */
	public setGroupLevel(level: number): void {
		this.groupState.level.set(level);
	}

	public enableGroupLevel(level: number): void {
		this.groupState.level.enableLevel(level);
	}

	public enableGroupLevels(levels: number[]): void {
		this.groupState.level.enableLevels(levels);
	}

	public disableGroupLevel(level: number): void {
		this.groupState.level.disableLevel(level);
	}

	public disableGroupLevels(levels: number[]): void {
		this.groupState.level.disableLevels(levels);
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
	private canExecute(group: Log, transportLevel: number, msgLevel: number): boolean {
		if (this.globalState.forceDisabled) {
			return false;
		}

		if (!this.globalState.forceEnabled && !group.groupState.enabled) {
			return false;
		}

		if (!checkLevel(transportLevel)) {
			return false;
		}

		if (!checkLevel(msgLevel)) {
			return false;
		}

		const activeMask = this.globalState.globalLevel.get() | group.groupState.level.get();

		return (activeMask & transportLevel & msgLevel) > 0;
	}

	/**
	 * Log message to default group.
	 * @param msgLevel
	 * @param msg
	 */
	public log(msgLevel: number, ...msg: unknown[]): Promise<boolean | LogResult> {
		if (this.globalState.forceDisabled) {
			return Promise.resolve(false);
		}

		if (!checkLevel(msgLevel)) {
			return Promise.resolve(false);
		}

		const message: Message = this.createMessage(msgLevel, this.groupState.path.slice(), ...msg);
		const actions: LogActionResult[] = [];

		const transports: Map<string, {group: Log; transport: Transport}> = new Map();
		let group = this as Log | null;

		while (group) {
			if (group.groupState.enabled || group.globalState.forceEnabled) {
				for (const transport of group.groupState.transports) {
					if (!transports.has(transport.id)) {
						transports.set(transport.id, {group, transport});
					}
				}
			}

			group = group.groupState.parent;
		}

		for (const [id, {group, transport}] of transports) {
			if (this.canExecute(group, transport.level.get(), msgLevel)) {
				const result: LogActionResult = transport.execute(message).then((res) => {
					return [id, res];
				});
				actions.push(result);
			} else {
				actions.push(Promise.resolve([id, false]));
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
type MakeLogOptions = Expand<Omit<LogOptionsGroup, 'state' | 'id' | 'parent' | 'path'>>;
