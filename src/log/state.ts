import {LogLevels} from './levels';
import {LogGroup} from './group';
import {LogOptions} from '../log/options';

export class LogState {
	public globalLogLevel: number;
	public readonly groups: Record<'all' | 'global' | string, LogGroup>;

	constructor(options?: LogOptions) {
		this.globalLogLevel = LogLevels.ALL & ~LogLevels.DEBUG & LogLevels.TRACE;
		this.groups = this.makeDefaultGroups();

		if (options && typeof options.globalLogLevel === 'number') {
			this.globalLogLevel = options.globalLogLevel;
		}
	}

	/**
	 * Create default log groups for instance
	 */
	private makeDefaultGroups(): Record<'all' | 'global' | string, LogGroup> {
		return {
			all: new LogGroup('all', LogLevels.ALL),
			global: new LogGroup('global', LogLevels.ALL)
		};
	}
}
