import {StrongBoolean, StrongMap, makeBoolean} from '@toreda/strong-types';

import {LogOptions} from '../log/options';
import {LogGroup} from './group';
import {LogLevels} from './levels';

/**
 * Holds internal state data, settings, and log groups for a
 * single log instance.
 */

export class LogState extends StrongMap {
	public globalLogLevel: number;
	public readonly groups: Record<'all' | 'global', LogGroup> & Record<string, LogGroup>;
	public readonly groupKeys: string[];
	public readonly groupsDefaultEnabled: StrongBoolean;
	public readonly consoleEnabled: StrongBoolean;

	constructor(options?: LogOptions) {
		super();
		this.globalLogLevel =
			options && typeof options.globalLogLevel === 'number'
				? options.globalLogLevel
				: LogLevels.ALL & ~LogLevels.DEBUG & LogLevels.TRACE;
		const defaultGroups = this.createDefaultGroups();
		// Check whether groups should start enabled or disabled.
		// Disabled groups do not process logs, even if the group log level
		// or global log level would otherwise allow it.
		const groupsEnabled =
			options && typeof options.groupsDisableOnStart === 'boolean'
				? !options.groupsDisableOnStart
				: true;
		this.groupsDefaultEnabled = makeBoolean(groupsEnabled, true);
		this.groups = defaultGroups.map;
		this.groupKeys = defaultGroups.keys;
		// Whether console output is enabled by default. If disabled,
		// the built-in console transport can be activated at any time.
		const enableConsole =
			options && typeof options.consoleLogEnabled === 'boolean' ? options.consoleLogEnabled : false;
		this.consoleEnabled = makeBoolean(enableConsole, false);
		// Starting Global log level
		if (options && typeof options.globalLogLevel === 'number') {
			this.globalLogLevel = options.globalLogLevel;
		}

		this.parse(options);
	}

	/**
	 * Create default groups object with built-in 'all' and 'global' groups.
	 */
	public createDefaultGroups(): {keys: string[]; map: Record<'all' | 'global' | string, LogGroup>} {
		return {
			keys: ['all', 'global'],
			map: {
				all: new LogGroup('all', LogLevels.ALL, true),
				global: new LogGroup('global', LogLevels.ALL, true)
			}
		};
	}
}
