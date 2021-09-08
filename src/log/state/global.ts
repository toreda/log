import {Levels} from '../../levels';
import type {Log} from '../../log';
import {LogLevel} from '../level';
import type {LogOptionsGlobal} from '../options';
import {LogState} from '../../log/state';
import {validLevel} from '../../../src/valid/level';

type KeysExludedFromOptions = 'state' | 'path';
type Options = Omit<LogOptionsGlobal, KeysExludedFromOptions>;
/**
 * Internal state data, settings, and log groups for a
 * single log instance.
 */

export class LogStateGlobal implements LogState {
	public groupsStartEnabled: boolean;
	public globalLevel: LogLevel;
	public consoleEnabled: boolean;
	public forceEnabled: boolean;
	public forceDisabled: boolean;

	public readonly groups: Map<string, Log>;

	constructor(options: Partial<Options> = {}) {
		// Check whether groups should start enabled or disabled.
		// Disabled groups do not process logs, even if the group log level
		// or global log level would otherwise allow it.
		this.groupsStartEnabled = options.groupsStartEnabled === true ? true : false;

		// Starting Global log level
		const defaultLevel = Levels.ALL & ~Levels.DEBUG & ~Levels.TRACE;
		const logLevel = validLevel(options.globalLevel) ? options.globalLevel : defaultLevel;

		this.globalLevel = new LogLevel(logLevel);

		// Whether console output is enabled by default. If disabled,
		// the built-in console transport can be activated at any time.
		this.consoleEnabled = options.consoleEnabled === true ? true : false;

		this.forceEnabled = false;
		this.forceDisabled = false;

		this.groups = new Map();
	}
}
