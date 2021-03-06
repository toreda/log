import {LogLevels} from './levels';
import {LogGroup} from './group';
import {LogOptions} from '../log/options';
import {StrongMap} from '@toreda/strong-types';

/**
 * Holds internal state data, settings, and log groups for a
 * single log instance.
 */
export class LogState extends StrongMap {
	public globalLogLevel: number;
	public readonly groups: Record<'all' | 'global' | string, LogGroup>;
	public readonly groupKeys: string[];

	constructor(options?: LogOptions) {
		super();
		this.globalLogLevel =
			options && typeof options.globalLogLevel === 'number'
				? options.globalLogLevel
				: LogLevels.ALL & ~LogLevels.DEBUG & LogLevels.TRACE;
		const defaultGroups = this.createDefaultGroups();

		this.groups = defaultGroups.map;
		this.groupKeys = defaultGroups.keys;

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
				all: new LogGroup('all', LogLevels.ALL),
				global: new LogGroup('global', LogLevels.ALL)
			}
		};
	}
}
