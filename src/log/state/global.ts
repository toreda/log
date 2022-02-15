import {Levels} from '../../levels';
import {Log} from '../../log';
import {LogLevel} from '../level';
import {LogOptionsGlobal} from '../options/global';
import {Transport} from '../../transport';
import {checkLevel} from '../../check/level';

/**
 * Internal state data, settings, and log groups for a
 * single log instance.
 *
 * @category State
 */
export class LogStateGlobal {
	public groupsStartEnabled: boolean;
	public globalLevel: LogLevel;
	public consoleEnabled: boolean;
	public forceEnabled: boolean;
	public forceDisabled: boolean;

	public readonly groups: Map<string, Log>;
	public readonly transports: Transport[];

	constructor(options: LogOptionsGlobal = {}) {
		// Check whether groups should start enabled or disabled.
		// Disabled groups do not process logs, even if the group log level
		// or global log level would otherwise allow it.
		this.groupsStartEnabled = options.groupsStartEnabled === false ? false : true;

		// Starting Global log level
		const defaultLevel = Levels.ALL & ~Levels.DEBUG & ~Levels.TRACE;
		const logLevel = checkLevel(options.globalLevel) ? options.globalLevel : defaultLevel;

		this.globalLevel = new LogLevel(logLevel);

		// Whether console output is enabled by default. If disabled,
		// the built-in console transport can be activated at any time.
		this.consoleEnabled = options.consoleEnabled === true ? true : false;

		this.forceEnabled = false;
		this.forceDisabled = false;

		this.groups = new Map();
		this.transports = [];

		for (const transportData of options.startingTransports ?? []) {
			let transport: Transport;

			if (transportData instanceof Transport) {
				transport = transportData;
			} else {
				const {id, level, action} = transportData;
				transport = new Transport(id, level, action);
			}

			this.transports.push(transport);
		}
	}
}
