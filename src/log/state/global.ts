import {RecordToStrong, StrongBoolean, StrongMap, makeBoolean} from '@toreda/strong-types';
import {Levels} from '../../levels';
import {Log} from '../../log';
import {StrongLevel, makeLevel} from '../../strong-level';
import {LogOptionsGlobal} from '../options';

type Options = Omit<LogOptionsGlobal, 'state' | 'path'>;
type State = RecordToStrong<Omit<LogOptionsGlobal, 'state' | 'id' | 'startingGroups' | 'path'>>;

/**
 * Holds internal state data, settings, and log groups for a
 * single log instance.
 */

export class LogStateGlobal extends StrongMap implements State {
	public readonly groupsStartEnabled: StrongBoolean;
	public readonly globalLevel: StrongLevel;
	public readonly consoleEnabled: StrongBoolean;

	public readonly groups: Map<string, Log>;

	constructor(options?: Options) {
		super();

		// Check whether groups should start enabled or disabled.
		// Disabled groups do not process logs, even if the group log level
		// or global log level would otherwise allow it.
		this.groupsStartEnabled = makeBoolean(false);

		// Starting Global log level
		this.globalLevel = makeLevel(Levels.ALL & ~Levels.DEBUG & ~Levels.TRACE);

		// Whether console output is enabled by default. If disabled,
		// the built-in console transport can be activated at any time.
		this.consoleEnabled = makeBoolean(false);

		this.parse(options);

		this.groups = new Map();
	}
}
