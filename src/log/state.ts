import {
	RecordToStrong,
	StrongBoolean,
	StrongInt,
	StrongMap,
	makeBoolean,
	makeInt
} from '@toreda/strong-types';
import {LogGroup} from './group';
import {LogLevels} from './levels';
import {LogOptions} from './options';

type State = RecordToStrong<LogOptions>;

/**
 * Holds internal state data, settings, and log groups for a
 * single log instance.
 */

export class LogState extends StrongMap implements State {
	public readonly consoleEnabled: StrongBoolean;
	public readonly globalLogLevel: StrongInt;
	public readonly groupsDisableOnStart: StrongBoolean;

	public readonly groups: Record<'all' | 'global' | string, LogGroup>;
	public readonly groupKeys: string[];

	constructor(options?: LogOptions) {
		super();

		// Whether console output is enabled by default. If disabled,
		// the built-in console transport can be activated at any time.
		this.consoleEnabled = makeBoolean(false);

		// Starting Global log level
		this.globalLogLevel = makeInt(LogLevels.ALL & ~LogLevels.DEBUG & LogLevels.TRACE);

		// Check whether groups should start enabled or disabled.
		// Disabled groups do not process logs, even if the group log level
		// or global log level would otherwise allow it.
		this.groupsDisableOnStart = makeBoolean(true);

		const defaultGroups = this.createDefaultGroups();
		this.groups = defaultGroups.map;
		this.groupKeys = defaultGroups.keys;

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
