import {StrongBoolean, StrongMap, makeBoolean, makeInt, StrongInt} from '@toreda/strong-types';
import {LogOptions} from '../log/options';
import {LogGroup} from './group';
import {LogLevels} from './levels';

/**
 * Holds internal state data, settings, and log groups for a
 * single log instance.
 */

export class LogState extends StrongMap {
	public readonly consoleEnabled: StrongBoolean;
	public readonly globalLogLevel: StrongInt;
	public readonly groupKeys: string[];
	public readonly groups: Record<'all' | 'global' | string, LogGroup>;
	public readonly groupsDisableOnStart: StrongBoolean;

	constructor(options?: LogOptions) {
		super();

		const defaultGroups = this.createDefaultGroups();

		this.groups = defaultGroups.map;
		this.groupKeys = defaultGroups.keys;

		// Check whether groups should start enabled or disabled.
		// Disabled groups do not process logs, even if the group log level
		// or global log level would otherwise allow it.
		this.groupsDisableOnStart = makeBoolean(true);

		// Whether console output is enabled by default. If disabled,
		// the built-in console transport can be activated at any time.
		this.consoleEnabled = makeBoolean(false);

		// Starting Global log level
		this.globalLogLevel = makeInt(LogLevels.ALL & ~LogLevels.DEBUG & LogLevels.TRACE);

		if (options != null) {
			this.parse(options);
		}
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
