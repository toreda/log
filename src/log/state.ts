import {
	RecordToStrong,
	StrongBoolean,
	StrongInt,
	StrongMap,
	makeBoolean,
	makeInt
} from '@toreda/strong-types';
import {LogGroup} from './group';
import {LogGroupData} from './group/data';
import {LogLevels} from './levels';
import {LogOptions} from './options';

type LogOptionsExclude = 'startingGroups';
type State = RecordToStrong<Omit<LogOptions, LogOptionsExclude>>;

/**
 * Holds internal state data, settings, and log groups for a
 * single log instance.
 */

export class LogState extends StrongMap implements State {
	public readonly consoleEnabled: StrongBoolean;
	public readonly globalLogLevel: StrongInt;
	public readonly groupsEnabledOnStart: StrongBoolean;

	public readonly groups: Record<string, LogGroup>;
	public readonly groupKeys: string[];

	constructor(options?: LogOptions) {
		super();

		// Whether console output is enabled by default. If disabled,
		// the built-in console transport can be activated at any time.
		this.consoleEnabled = makeBoolean(false);

		// Starting Global log level
		this.globalLogLevel = makeInt(LogLevels.ALL & ~LogLevels.DEBUG & ~LogLevels.TRACE);

		// Check whether groups should start enabled or disabled.
		// Disabled groups do not process logs, even if the group log level
		// or global log level would otherwise allow it.
		this.groupsEnabledOnStart = makeBoolean(false);

		this.parse(options);

		this.groups = this.createGroups(options?.startingGroups);
		this.groupKeys = Object.keys(this.groups);
	}

	private createGroups(startingGroups?: LogGroupData[]): Record<string, LogGroup> {
		const groups = {
			all: new LogGroup('all', LogLevels.ALL, this.groupsEnabledOnStart()),
			default: new LogGroup('default', LogLevels.ALL, this.groupsEnabledOnStart())
		};

		for (const group of startingGroups ?? []) {
			const enabled = group.enabled ?? this.groupsEnabledOnStart();
			groups[group.id] = new LogGroup(group.id, group.level, enabled);
		}

		return groups;
	}
}
