import {LogLevels} from './levels';
import {LogGroup} from './group';
import {LogOptions} from '../log/options';

/**
 * Holds internal state data, settings, and log groups for a
 * single log instance.
 */
export class LogState {
	public globalLogLevel: number;
	public readonly groups: Record<'all' | 'global' | string, LogGroup>;
	public readonly groupList: string[];

	constructor(options?: LogOptions) {
		this.globalLogLevel = LogLevels.ALL & ~LogLevels.DEBUG & LogLevels.TRACE;
		const defaultGroups = this.createDefaultGroups();

		this.groups = defaultGroups.map;
		this.groupList = defaultGroups.list;

		if (options && typeof options.globalLogLevel === 'number') {
			this.globalLogLevel = options.globalLogLevel;
		}
	}

	/**
	 * Create default groups object with built-in 'all' and 'global' groups.
	 */
	private createDefaultGroups(): {list: string[]; map: Record<'all' | 'global' | string, LogGroup>} {
		return {
			list: ['all', 'global'],
			map: {
				all: new LogGroup('all', LogLevels.ALL),
				global: new LogGroup('global', LogLevels.ALL)
			}
		};
	}
}
